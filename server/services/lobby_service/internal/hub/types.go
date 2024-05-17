package hub

import (
	"github.com/gorilla/websocket"
	"github.com/izi-on/quarto-now/internal/db"
	"github.com/izi-on/quarto-now/internal/pubsub"
)

type Client struct {
	conn   *websocket.Conn
	id     string
	roomId string
}

type Hub struct {
	clients    map[string]Client
	register   chan (Client)
	unregister chan (Client)
	pubsub     *pubsub.Pubsub
	db         *db.Service
	id         string
}

type PayloadMsg struct {
	ClientId string `json:"client_id"` // id of the sender
	JSONStr  string `json:"json_str"`
}
