package router

import "github.com/gin-gonic/gin"

type Router struct {
	instance *gin.Engine
}

func InitRouter(handlers ...Handler) *Router {
	router := gin.Default()
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
