package db

type GameCreationRequest struct {
	GameID   string `json:"game_id"`
	Name     string `json:"name"`
	HTMLCode string `json:"html_code"`
}

type GameCreationResponse struct {
	RoomID string `json:"room_id"`
}

type GameDocument struct {
	GameID   string `bson:"game_id"`
	Name     string `bson:"name"`
	HTMLCode string `bson:"html_code"`
}
