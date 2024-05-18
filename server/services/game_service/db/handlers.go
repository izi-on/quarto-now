package db

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/izi-on/quarto-now/server/services/game_creation_service/router"
)

func (s *Service) HandleRoomCreation(c *gin.Context) {
	var request GameCreationRequest
	if err := c.ShouldBindBodyWithJSON(&request); err != nil {
		c.String(http.StatusBadRequest, fmt.Sprintf("Invalid JSON format: %s", err))
	}
	roomId, err := s.CreateRoomAndGetID(request.GameID, request.Name, request.HTMLCode)
	if err != nil {
		fmt.Println(err)
	}
	response := GameCreationResponse{RoomID: roomId}
	c.JSON(http.StatusOK, response)
}

func (s *Service) HandleGetCode(c *gin.Context) {
	roomId := c.Query("room-id")
	htmlCode, err := s.GetHTMLCode(roomId)
	if err != nil {
		fmt.Printf("Could not get the html code for the given request: %s", err)
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
			EndpointPath: "/create-room",
		},
	}
	return handlers
}
