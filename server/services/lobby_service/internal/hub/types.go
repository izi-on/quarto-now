package hub

import (
	"github.com/gorilla/websocket"
	"github.com/izi-on/quarto-now/server/services/lobby_service/internal/db"
	"github.com/izi-on/quarto-now/server/services/lobby_service/internal/pubsub"
)

type Client struct {
	conn         *websocket.Conn
	id           string
	roomId       string
	connAttempts int
}

type Hub struct {
	clients    map[string]*Client
	register   chan (*Client)
	unregister chan (string)
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
	JSONStr   string `json:"jsonStr"`
	ClientId  string `json:"clientId"`
	Type      WSType `json:"type"`
	DoesStart bool   `json:"doesStart"`
}
