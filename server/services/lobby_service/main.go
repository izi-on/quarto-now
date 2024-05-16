package main

import (
	"os"

	"github.com/izi-on/quarto-now/internal/hub"
	"github.com/izi-on/quarto-now/router"
	"github.com/izi-on/quarto-now/utils"
)

func main() {
	// load env variables
	utils.LoadEnvVars()

	// create new websocket hub
	hub := hub.NewHub()

	// create router
	addr := os.Getenv("BASE_URL_WEBSOCKET")
	router := router.Router{}
	router.InitRouter(hub.HandleConnections)
	router.StartRouter(addr)
}
