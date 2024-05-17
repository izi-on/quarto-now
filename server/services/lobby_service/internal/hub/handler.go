package hub

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // TODO: clearly define origin
	},
}

func (h *Hub) HandleConnections(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println(err)
		return
	}

	clientId := c.Request.Header.Get("client-id")
	roomId := c.Request.Header.Get("room-id")
	client := h.makeNewClient(conn, clientId, roomId)
	fmt.Println("created new client", client)
	h.register <- client

	defer func() { h.unregister <- client }()

	for {
		_, p, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
				fmt.Println("Connection closed:", err)
				return
			}
			fmt.Println(err)
			return
		}
		if err = h.forwardMsgToHub(p); err != nil {
			fmt.Println("FATAL!!!", err)
			return
		}
	}
}
