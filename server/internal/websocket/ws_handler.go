package websocket

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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

type WsHandler struct {
	Service *Service
}

var mu sync.Mutex

func (handler *WsHandler) WebsocketHandler(c *gin.Context) {
	conn, err := wsupgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		http.Error(c.Writer, "Could not open websocket connection", http.StatusBadRequest)
		return
	}

	mu.Lock()
	if len(handler.Service.getClients()) > 2 {
		fmt.Println("Maximum 2 connections allowed!")
		mu.Unlock()
		return
	}
	clientId := uuid.New().String()
	handler.Service.addClient(conn, c.ClientIP(), clientId)
	fmt.Printf("After adding. Connections: %v\n", handler.Service.getClients())
	mu.Unlock()

	defer func() {
		conn.Close()
		mu.Lock()
		handler.Service.removeClient(clientId)
		fmt.Printf("After removal. Connections: %v\n", handler.Service.getClients())
		mu.Unlock()
	}()
	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Could not read message:", err)
			return // Ends the loop if we cannot read messages (e.g., connection closed)
		}
		fmt.Println("message type", messageType)
		err = handler.Service.parseWebsocketMessage(p, messageType)
		if err != nil {
			fmt.Println("Could not parse websocket message:", err)
			return
		}
	}
}
