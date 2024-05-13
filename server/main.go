package main

import (
	"os"

	"github.com/izi-on/quarto-now/internal/websocket"
	"github.com/izi-on/quarto-now/router"
	"github.com/izi-on/quarto-now/utils"
)

func main() {
	// load env variables
	utils.LoadEnvVars()

	// create websocket
	wsService := websocket.NewWSService()
	wsHandler := websocket.WsHandler{Service: wsService}

	// create router
	addr := os.Getenv("BASE_URL_WEBSOCKET")
	router := router.Router{}
	router.InitRouter(wsHandler.WebsocketHandler)
	router.StartRouter(addr)
}
