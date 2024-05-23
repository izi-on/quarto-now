package hub

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/izi-on/quarto-now/server/services/lobby_service/api"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		for _, c_origin := range api.Origins {
			if origin == c_origin {
				return true
			}
		}
		return false // TODO: clearly define origin
	},
}

func (h *Hub) HandleConnections(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println(err)
		return
	}

	clientId := c.Query("clientId")
	roomId := c.Query("roomId")
	client := h.makeNewClient(conn, clientId, roomId)
	fmt.Println("created new client", client)
	h.register <- &client

	defer func() { fmt.Println("Shutting down handler, sending unregister..."); h.unregister <- client.id }()

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
