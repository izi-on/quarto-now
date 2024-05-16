package db

import (
	"database/sql"
	"fmt"
	"os"
)

func Connect() (*sql.DB, error) {
	connStr := fmt.Sprintf("user=%s dbname=%s sslmode=disable password=%s", "postgres", "quarto", os.Getenv("POSTGRES_PASSWORD"))
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		fmt.Println(err)
		return &sql.DB{}, err
	}

	err = db.Ping()
	if err != nil {
		fmt.Println(err)
		return &sql.DB{}, err
	}

	return db, nil
}
