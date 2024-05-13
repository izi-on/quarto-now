package websocket

import (
	"fmt"

	"github.com/gorilla/websocket"
)

type Service struct {
	Clients map[string]client
}

type client struct {
	id     string
	conn   *websocket.Conn
	ipAddr string
}

func NewWSService() *Service {
	return &Service{Clients: make(map[string]client)}
}

func (s *Service) addClient(conn *websocket.Conn, ipAddr string, uuid string) {
	client := client{
		id:     uuid,
		conn:   conn,
		ipAddr: ipAddr,
	}
	s.Clients[client.id] = client
}

func (s *Service) removeClient(clientId string) {
	delete(s.Clients, clientId)
}

func (s *Service) getClients() []client {
	var clients []client
	for _, client := range s.Clients {
		clients = append(clients, client)
	}
	return clients
}

func (s *Service) broadcastMessage() {
}

func (s *Service) parseWebsocketMessage(message []byte, messageType int) error {
	switch messageType {
	case websocket.TextMessage:
		msg := string(message)
		fmt.Printf("Message is: %s\n", msg)
	}
	return nil
}
