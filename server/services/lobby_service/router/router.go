package router

import (
	"os"

	"github.com/gin-gonic/gin"
)

type Router struct {
	r *gin.Engine
}

func (router *Router) InitRouter(wsHandler gin.HandlerFunc) {
	router.r = gin.Default()
	router.r.GET(os.Getenv("LOBBY_ID"), wsHandler)
}

func (router *Router) StartRouter(addr string) {
	router.r.Run(addr)
}
