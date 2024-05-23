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

var registerLock sync.Mutex

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
		id:           clientId,
		conn:         conn,
		roomId:       roomId,
		connAttempts: 0,
	}
	return client
}

func (h *Hub) forwardMsgToHub(payload []byte) error {
	// extract hubId
	var msg PayloadMsg
	fmt.Println("THE PAYLOAD IS:", string(payload))
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

func (h *Hub) SignalGameStart(roomId string) error {
	clients, err := h.db.GetClientsForRoom(roomId)
	if err != nil {
		fmt.Printf("Could not get clients for room id: %s: %s", roomId, err)
		return err
	}
	for _, client := range *clients {
		signalMsg := &PayloadMsg{
			ClientId: client.ID,
			Type:     GameStart,
			JSONStr:  "",
		}
		jsonMsg, err := json.Marshal(signalMsg)
		if err != nil {
			fmt.Printf("Could not marshal the signal to start the game: %s", err)
			return err
		}
		h.forwardMsgToHub(jsonMsg)
	}

	// set has_started to true for room
	err = h.db.SetRoomStart(roomId)
	if err != nil {
		fmt.Printf("Could not set the start value of the room %s to true: %s", roomId, err)
	}
	return nil
}

func (h *Hub) registerClient(client *Client) (bool, error) {
	registerLock.Lock()
	defer registerLock.Unlock()
	fmt.Println("received register signal for client: ", client.id)
	if client, ok := h.clients[client.id]; ok {
		fmt.Println("Client already exists!")
		client.connAttempts += 1
	}
	h.clients[client.id] = client
	isGameStart, err := h.db.SetClient(client.id, client.roomId, h.id)
	if err != nil {
		fmt.Printf("Error while setting the client in the database: %s\n", err)
		return false, err
	}
	return isGameStart, nil
}

func (h *Hub) unregisterClient(clientId string) {
	registerLock.Lock()
	defer registerLock.Unlock()
	client, ok := h.clients[clientId]
	if !ok {
		fmt.Printf("cannot unregister client %s it does not exist in map!\n", clientId)
		return
	}
	if client.connAttempts > 0 {
		fmt.Printf("client with id %s has attempted to connect already, so skipping unregister...\n", clientId)
		client.connAttempts -= 1
		return
	}
	fmt.Println("received unregister signal for client: ", client.id)
	err := h.db.RemoveClient(client.id)
	if err != nil {
		fmt.Printf("Error while removing client: %s\n", err)
	}
	if err := client.conn.Close(); err != nil {
		fmt.Printf("Error closing the connection: %s", err)
	}
	delete(h.clients, client.id)
}

func (h *Hub) Run(ctx context.Context) {
	pubsub := h.pubsub.GetSubscriber(h.id)
	defer pubsub.Close()
	for {
		select {
		case client := <-h.register:
			isGameStart, err := h.registerClient(client)
			if err != nil {
				go func() { fmt.Println("Couldn't register client, sending unregister"); h.unregister <- client.id }()
			}
			if isGameStart {
				fmt.Printf("starting game on room: %s\n", client.roomId)
				go func() {
					err = h.SignalGameStart(client.roomId)
					if err != nil {
						panic("unable to start game despite clients being there!")
					}
				}()
			}
		case client := <-h.unregister:
			h.unregisterClient(client)
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
		clients:    make(map[string]*Client),
		register:   make(chan *Client),
		unregister: make(chan string),
		pubsub:     &pubsub,
		db:         db,
	}, nil
}
