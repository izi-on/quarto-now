package db

import "database/sql"

type ClientToRoom struct {
	ID     string `json:"id"`
	roomID string `json:""`
}

type Service struct {
	dbConn *sql.DB
}
