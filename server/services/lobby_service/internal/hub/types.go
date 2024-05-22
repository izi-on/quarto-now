package hub

import (
	"github.com/gorilla/websocket"
	"github.com/izi-on/quarto-now/server/services/lobby_service/internal/db"
	"github.com/izi-on/quarto-now/server/services/lobby_service/internal/pubsub"
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

type WSType string

const (
	TurnInfo  WSType = "turnInfo"
	GameStart WSType = "gameStart"
)

type PayloadMsg struct {
	ClientId string `json:"clientId"` // id of the sender
	Type     WSType `json:"type"`
	JSONStr  string `json:"jsonStr"`
}
