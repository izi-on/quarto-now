package db

import (
	"context"
	"database/sql"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

type Service struct {
	postgresConn      *sql.DB
	mongoDbCollection *mongo.Collection
}

func Connect(postgresConnStr string, mongoConnStr string) (*Service, error) {
	// postgres
	postgressConn, err := sql.Open("postgres", postgresConnStr)
	if err != nil {
		fmt.Println(err)
		return &Service{}, err
	}
	fmt.Println("Connected to postgres!")

	// mongo
	clientOptions := options.Client().ApplyURI(mongoConnStr)
	ctx := context.Background()
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
		return &Service{}, err
	}
	fmt.Println("Connected to mongo!")
	fmt.Println(mongoConnStr)
	fmt.Println("Pinging mongo...")
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		log.Fatal(err)
		return &Service{}, err
	}
	fmt.Println("Pong!")
	mongoCollection := client.Database("quarto").Collection("games")
	return &Service{postgresConn: postgressConn, mongoDbCollection: mongoCollection}, nil
}
