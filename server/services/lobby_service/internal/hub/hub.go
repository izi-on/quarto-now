package hub

import (
	"context"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // TODO: clearly define origin
	},
}

func makeNewClient(conn *websocket.Conn) (Client, error) {
	uuid, err := uuid.NewUUID()
	if err != nil {
		fmt.Println("Error while creating UUID could not register client, shutting down hub...")
		return Client{}, err
	}
	client := Client{
		id:   uuid.String(),
		conn: conn,
	}
	return client, nil
}

func (h *Hub) broadcastMsg(payload []byte) {
}

func (h *Hub) Run(ctx context.Context) {
	pubsub := h.pubsub.Subscribe(ctx, "msgTransfer")
	select {
	case client := <-h.register:
		h.clients[client] = true
	case client := <-h.unregister:
		client.conn.Close()
		delete(h.clients, client)
	case msg := <-pubsub.Channel():
		h.broadcastMsg([]byte(msg.Payload))
	}
}

func (h *Hub) HandleConnections(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println(err)
		return
	}

	client, err := makeNewClient(conn)
	if err != nil {
		fmt.Println(err)
		return
	}

	defer func() { h.unregister <- client }()

	h.register <- client
	for {
		_, p, err := conn.ReadMessage()
		if err != nil {
			fmt.Println(err)
			continue
		}
		h.pubsub.Publish(context.Background(), "msgTransfer", p)
	}
}
