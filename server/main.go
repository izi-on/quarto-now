package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var wsupgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// CheckOrigin can be used to disable CORS checks.
	// In real applications, customize this to allow only valid origins.
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func websocketHandler(c *gin.Context) {
	conn, err := wsupgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		http.Error(c.Writer, "Could not open websocket connection", http.StatusBadRequest)
		return
	}

	defer conn.Close()
	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			return // Ends the loop if we cannot read messages (e.g., connection closed)
		}
		// Echo the message back to the client
		if err = conn.WriteMessage(messageType, p); err != nil {
			return // Ends the loop if we cannot write messages
		}
	}
}

func main() {
	r := gin.Default()
	r.GET("/ws", websocketHandler)
	r.Run(":8080")
}
