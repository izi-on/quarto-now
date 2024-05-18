package db

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
)

func (s *Service) storeHtmlCode(gameId string, name string, htmlCode string) error {
	document := GameDocument{
		GameID:   gameId,
		Name:     name,
		HTMLCode: htmlCode,
	}

	_, err := s.mongoDbCollection.InsertOne(context.TODO(), document)
	if err != nil {
		return err
	}
	return nil
}

func (s *Service) createRoom(gameId string) (string, error) {
	id := uuid.New()
	query := "INSERT INTO room(id, game_id) VALUES ($1, $2)"
	_, err := s.postgresConn.Exec(query, id.String(), gameId)
	if err != nil {
		return "", err
	}
	return id.String(), nil
}

func (s *Service) getGameIdFromRoomId(roomId string) (string, error) {
	var gameId string
	query := "SELECT game_id FROM room WHERE id = $1"
	if err := s.postgresConn.QueryRow(query, roomId).Scan(&gameId); err != nil {
		return "", err
	}
	return gameId, nil
}

func (s *Service) getHtmlCodeFromGameId(gameId string) (*string, error) {
	var result GameDocument

	// Define filter options
	filter := bson.D{
		{"game_id", gameId},
	}

	if err := s.mongoDbCollection.FindOne(context.TODO(), filter).Decode(&result); err != nil {
		return nil, err
	}

	return &(result.HTMLCode), nil
}

func (s *Service) GetHTMLCode(roomId string) (*string, error) {
	gameId, err := s.getGameIdFromRoomId(roomId)
	if err != nil {
		fmt.Printf("Could not get the room ID: %s\n", err)
		return nil, err
	}
	htmlCode, err := s.getHtmlCodeFromGameId(gameId)
	if err != nil {
		fmt.Printf("Could not get the html code: %s\n", err)
		return nil, err
	}
	return htmlCode, nil
}

func (s *Service) CreateRoomAndGetID(gameId string, name string, htmlCode string) (string, error) {
	if err := s.storeHtmlCode(gameId, name, htmlCode); err != nil {
		fmt.Printf("Could not store HTML code: %s\n", err)
		return "", err
	}

	roomId, err := s.createRoom(gameId)
	if err != nil {
		fmt.Printf("Could not create the game room: %s", err)
		return "", err
	}

	return roomId, nil
}
