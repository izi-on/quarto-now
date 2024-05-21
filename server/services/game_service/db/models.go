package db

type RoomCreationRequest struct {
	GameID   string `json:"gameId"`
	Name     string `json:"name"`
	HTMLCode string `json:"htmlCode"`
}

type RoomCreationResponse struct {
	RoomID string `json:"roomId"`
}

type GameDocument struct {
	GameID   string `bson:"gameId"`
	Name     string `bson:"name"`
	HTMLCode string `bson:"htmlCode"`
}
