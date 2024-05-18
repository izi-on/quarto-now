package main

import (
	"context"
	"fmt"
	"os"

	"github.com/izi-on/quarto-now/server/services/lobby_service/internal/db"
	"github.com/izi-on/quarto-now/server/services/lobby_service/internal/hub"
	"github.com/izi-on/quarto-now/server/services/lobby_service/internal/pubsub"
	"github.com/izi-on/quarto-now/server/services/lobby_service/router"
	_ "github.com/lib/pq"
)

func main() {
	// create new db service
	// TODO: use ssl
	connStr := fmt.Sprintf("user=%s dbname=%s sslmode=disable password=%s", "postgres", "quarto", os.Getenv("POSTGRES_PASSWORD"))
	dbConn, err := db.Connect(connStr)
	if err != nil {
		panic("Could not connect to postgres db")
	}
	dbService := db.NewService(dbConn)

	// create pubsub instance
	redisAddr := fmt.Sprintf("%s:%s", os.Getenv("BASE_URL"), os.Getenv("REDIS_PORT"))
	pubsub, err := pubsub.NewPubsub(redisAddr)
	if err != nil {
		panic("Could not create pubsub instance")
	}

	// create new websocket hub
	hub, err := hub.NewHub(*pubsub, dbService)
	if err != nil {
		panic("Could not create the websocket hub")
	}

	// run the hub in a separate go routine
	go hub.Run(context.Background())

	// create router
	addr := os.Getenv("BASE_URL")
	port := os.Getenv("LOBBY_SERVICE_PORT")
	fullAddr := fmt.Sprintf("%s:%s", addr, port)
	fmt.Println("THE FULL ADDRESS IS", fullAddr)
	router := router.Router{}
	router.InitRouter(hub.HandleConnections)
	router.StartRouter(fullAddr)
}
