package main

import (
	"fmt"
	"os"

	"github.com/izi-on/quarto-now/server/services/game_creation_service/db"
	"github.com/izi-on/quarto-now/server/services/game_creation_service/router"

	_ "github.com/lib/pq"
)

func main() {
	// create db service (mongo and postgres)
	// TODO: use ssl
	fmt.Println("Creating DB service...")
	postgressConnStr := fmt.Sprintf("user=%s dbname=%s sslmode=disable password=%s", "postgres", "quarto", os.Getenv("POSTGRES_PASSWORD"))
	mongoConnStr := fmt.Sprintf("mongodb://%s:%s", os.Getenv("BASE_URL"), os.Getenv("MONGODB_PORT"))
	dbService, err := db.Connect(postgressConnStr, mongoConnStr)
	if err != nil {
		panic(fmt.Sprintf("Could not connect to a database: %s", err))
	}
	// create router
	fmt.Println("Creating router...")
	routerInstance := router.InitRouter(dbService.GetHandlers()...)
	fmt.Println("Starting router...")
	routerInstance.StartRouter(fmt.Sprintf("%s:%s", os.Getenv("BASE_URL"), os.Getenv("GAME_SERVICE_PORT")))
}
