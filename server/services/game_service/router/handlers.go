package router

import "github.com/gin-gonic/gin"

type Handler struct {
	Fn           func(*gin.Context)
	EndpointType string
	EndpointPath string
}
