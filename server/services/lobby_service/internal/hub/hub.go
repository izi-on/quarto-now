package hub

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/izi-on/quarto-now/server/services/lobby_service/internal/db"
	"github.com/izi-on/quarto-now/server/services/lobby_service/internal/pubsub"
)

var lock sync.Mutex

func (h *Hub) forwardMsgToClient(payload string) error { // TODO: can definitely be optimized
	// extract clientId
	var msg PayloadMsg
	err := json.Unmarshal([]byte(payload), &msg)
	if err != nil {
		return err
	}

	// TODO: combine these two steps into one

	// get roomid
	roomId, err := h.db.GetRoomForClient(msg.ClientId)
	if err != nil {
		return err
	}

	// get other client
	clients, err := h.db.GetClientsForRoom(roomId)
	if err != nil {
		fmt.Println(err)
		return err
	}
	for _, client := range *clients {
		if client.ID == msg.ClientId {
			continue
		}
		recipient_client, ok := h.clients[client.ID]
		if !ok {
			return fmt.Errorf("unexpected error, the recipient client does not exist on this hub! Client ID: %s", client.ID)
		}

		recipient_client.conn.WriteMessage(websocket.TextMessage, []byte(payload))
	}
	return nil
}

func (h *Hub) makeNewClient(conn *websocket.Conn, clientId string, roomId string) Client {
	client := Client{
		id:     clientId,
		conn:   conn,
		roomId: roomId,
	}
	return client
}

func (h *Hub) forwardMsgToHub(payload []byte) error {
	// extract hubId
	var msg PayloadMsg
	err := json.Unmarshal(payload, &msg)
	if err != nil {
		return err
	}
	recipientId, err := h.db.GetRecipientFromSenderClient(msg.ClientId)
	if err != nil {
		return err
	}
	hubId, err := h.db.GetHubIdForClient(recipientId)
	if err != nil {
		return err
	}

	// notify through db
	h.pubsub.Publish(hubId, string(payload))
	return nil
}

func (h *Hub) Run(ctx context.Context) {
	pubsub := h.pubsub.GetSubscriber(h.id)
	defer pubsub.Close()
	for {
		select {
		case client := <-h.register:
			fmt.Println("received register signal")
			lock.Lock()
			h.clients[client.id] = client
			lock.Unlock()
			err := h.db.SetClient(client.id, client.roomId, h.id)
			if err != nil {
				go func() { h.unregister <- client }()
			}

		case client := <-h.unregister:
			err := h.db.RemoveClient(client.id)
			if err != nil {
				fmt.Println(err)
			}
			if err := client.conn.Close(); err != nil {
				fmt.Println(err)
			}
			lock.Lock()
			delete(h.clients, client.id)
			lock.Unlock()

		case notification := <-pubsub.Channel(): // gets forwarded ws msg from some hub
			h.forwardMsgToClient(notification.Payload)
		}
	}
}

func NewHub(pubsub pubsub.Pubsub, db *db.Service) (*Hub, error) {
	id, err := uuid.NewUUID()
	if err != nil {
		return &Hub{}, err
	}
	return &Hub{
		id:         id.String(),
		clients:    make(map[string]Client),
		register:   make(chan Client),
		unregister: make(chan Client),
		pubsub:     &pubsub,
		db:         db,
	}, nil
}
