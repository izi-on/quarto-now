package db

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/izi-on/quarto-now/server/services/game_creation_service/router"
)

func (s *Service) HandleRoomCreation(c *gin.Context) {
	var request RoomCreationRequest
	if err := c.ShouldBindBodyWithJSON(&request); err != nil {
		c.String(http.StatusBadRequest, fmt.Sprintf("Invalid JSON format: %s", err))
	}
	roomId, err := s.CreateRoomAndGetID(request.GameID, request.Name, request.HTMLCode)
	fmt.Println("room id is:", roomId)
	if err != nil {
		fmt.Println(err)
		c.String(http.StatusInternalServerError, fmt.Sprintf("Could not create the room: %s", err))
	}
	response := RoomCreationResponse{RoomID: roomId}
	c.JSON(http.StatusOK, response)
}

func (s *Service) HandleGetCode(c *gin.Context) {
	roomId := c.Query("roomId")
	htmlCode, err := s.GetHTMLCodeFromRoomId(roomId)
	if err != nil {
		fmt.Println(err)
		c.String(http.StatusInternalServerError, fmt.Sprintf("Could not get the html code for the given request: %s", err))
	}

	// stream resposne back to client
	chunkSize := 1024
	for start := 0; start < len(*htmlCode); start += chunkSize {
		end := start + chunkSize
		if end > len(*htmlCode) {
			end = len(*htmlCode)
		}
		c.Writer.Write([]byte((*htmlCode)[start:end]))
	}
}

func (s *Service) GetHandlers() []router.Handler {
	handlers := []router.Handler{
		{
			Fn:           s.HandleRoomCreation,
			EndpointType: "POST",
			EndpointPath: "create-room",
		},
		{
			Fn:           s.HandleGetCode,
			EndpointType: "GET",
			EndpointPath: "get-game-html",
		},
	}
	return handlers
}
