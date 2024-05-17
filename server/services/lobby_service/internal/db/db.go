package db

import (
	"database/sql"
	"fmt"
)

func Connect(connStr string) (*sql.DB, error) {
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
