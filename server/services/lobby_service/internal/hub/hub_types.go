package hub

import (
	"fmt"
	"os"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
)

type Client struct {
	id   string
	conn *websocket.Conn
}

type Hub struct {
	clients    map[Client]bool
	register   chan (Client)
	unregister chan (Client)
	pubsub     *redis.Client
}

func NewHub() *Hub {
	rdb := redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s", os.Getenv("BASE_URL"), os.Getenv("REDIS_PORT")),
	})
	return &Hub{
		clients:    make(map[Client]bool),
		register:   make(chan Client),
		unregister: make(chan Client),
		pubsub:     rdb,
	}
}
