package router

import (
	"fmt"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/izi-on/quarto-now/server/services/lobby_service/api"
)

type Router struct {
	r *gin.Engine
}

func (router *Router) InitRouter(wsHandler gin.HandlerFunc) {
	router.r = gin.Default()
	// CORS configuration
	fmt.Println("ORIGIN IS", api.Origins)
	config := cors.Config{
		AllowOrigins:     api.Origins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "clientId", "roomId"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	// Apply the CORS middleware to your router
	router.r.Use(cors.New(config))
	router.r.GET("lobby-service", wsHandler)
}

func (router *Router) StartRouter(addr string) {
	router.r.Run(addr)
}
