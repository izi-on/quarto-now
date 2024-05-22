package db

import (
	"database/sql"
	"fmt"
)

type Service struct {
	db *sql.DB
}

func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

func (s *Service) GetRecipientFromSenderClient(senderId string) (string, error) {
	var recipientId string
	query := `
    SELECT client_id FROM client_room_hub crh 
    WHERE crh.room_id IN 
    (SELECT room_id FROM client_room_hub WHERE client_id = $1) 
    AND client_id <> $1;
  `
	err := s.db.QueryRow(query, senderId).Scan(&recipientId)
	if err != nil {
		fmt.Println(err)
		if err != sql.ErrNoRows {
			return "", err
		}
	}
	return recipientId, nil
}

func (s *Service) GetHubIdForClient(clientId string) (string, error) {
	var hubId string
	query := "SELECT hub_id FROM client_room_hub WHERE client_id = $1"
	err := s.db.QueryRow(query, clientId).Scan(&hubId)
	if err != nil {
		fmt.Println(err)
		if err != sql.ErrNoRows {
			return "", err
		}
	}
	return hubId, nil
}

func (s *Service) GetClientsForRoom(roomId string) (*[]ClientRoomHub, error) {
	var result []ClientRoomHub
	query := "SELECT client_id FROM client_room_hub WHERE room_id = $1"
	rows, err := s.db.Query(query, roomId)
	if err != nil {
		fmt.Println(err)
		if err != sql.ErrNoRows {
			return nil, err
		} else {
			return &result, nil
		}
	}
	defer rows.Close()

	for rows.Next() {
		var clientToRoom ClientRoomHub
		err := rows.Scan(&clientToRoom.ID)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
		result = append(result, clientToRoom)
	}

	if err = rows.Err(); err != nil {
		fmt.Println(err)
		if err != sql.ErrNoRows {
			return nil, err
		}
	}

	return &result, nil
}

func (s *Service) GetRoomForClient(clientId string) (string, error) {
	var roomId string
	query := "SELECT room_id FROM client_room_hub WHERE client_id = $1"
	err := s.db.QueryRow(query, clientId).Scan(&roomId)
	if err != nil {
		fmt.Println(err)
		if err != sql.ErrNoRows {
			return "", err
		}
	}
	return roomId, nil
}

func (s *Service) RemoveClient(clientId string) error {
	query := "DELETE FROM client_room_hub WHERE client_id = $1"
	_, err := s.db.Exec(query, clientId)
	if err != nil {
		fmt.Println(err)
		return err
	}
	return nil
}

func (s *Service) SetClient(clientId string, roomId string, hubId string) (bool, error) {
	rows, err := s.GetClientsForRoom(roomId)
	if err != nil {
		fmt.Println(err)
		if err != sql.ErrNoRows {
			return false, err
		}
	}
	if len(*rows) >= 2 {
		err := fmt.Errorf("a room cannot contain more than 2 clients")
		fmt.Println(err)
		return false, err
	}

	gameStart := false
	if len(*rows) == 1 {
		gameStart = true
	}

	query := `
    INSERT INTO 
      client_room_hub (client_id, room_id, hub_id)
    VALUES 
      ($1, $2, $3)
		ON CONFLICT (client_id) 
    DO UPDATE SET 
      room_id = EXCLUDED.room_id,
      hub_id = EXCLUDED.hub_id;
  `

	_, err = s.db.Exec(query, clientId, roomId, hubId)
	if err != nil {
		fmt.Println(err)
		return false, err
	}

	return gameStart, nil
}

func (s *Service) SetRoomStart(roomId string) error {
	query := `
    UPDATE room
    SET has_started = true
    WHERE id = $1
  `
	_, err := s.db.Exec(query, roomId)
	if err != nil {
		fmt.Printf("Could not set room %s to start boolean value: %s", roomId, err)
	}
	return nil
}
