package router

import (
	"fmt"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Router struct {
	instance *gin.Engine
}

func InitRouter(handlers ...Handler) *Router {
	router := gin.Default()

	// CORS configuration
	origins := []string{fmt.Sprintf("%s://%s:5173", os.Getenv("PROTOCOL"), os.Getenv("BASE_URL"))} // TODO: remove all port wildcard
	fmt.Println("ORIGIN IS", origins)
	config := cors.Config{
		AllowOrigins:     origins, // Use * to allow all origins or specify your frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "roomId"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour, // MaxAge indicates how long (in seconds) the results of a preflight request can be cached
	}

	// Apply the CORS middleware to your router
	router.Use(cors.New(config))

	for _, handler := range handlers {
		switch handler.EndpointType {
		case "GET":
			router.GET(handler.EndpointPath, handler.Fn)
		case "POST":
			router.POST(handler.EndpointPath, handler.Fn)
		}
	}
	return &Router{instance: router}
}

func (r *Router) StartRouter(addr string) {
	r.instance.Run(addr)
}
