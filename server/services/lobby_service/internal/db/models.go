package db

type ClientToRoom struct {
	ID     string `json:"client_id"`
	RoomID string `json:"room_id"`
	HubID  string `json:"hub_id"`
}
