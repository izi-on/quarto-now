package cleaner

import (
	"fmt"
	"time"

	"github.com/izi-on/quarto-now/server/services/lobby_service/internal/db"
)

type cleaner struct {
	db *db.Service
}

func (c *cleaner) Run() {
	for {
		time.Sleep(20 * time.Second)
		fmt.Println("CLEANING UP INACTIVE ROOMS")
		c.db.RemoveInactiveRooms()
		fmt.Println("DONE CLEANING UP")
	}
}

func NewCleaner(dbConn *db.Service) *cleaner {
	return &cleaner{db: dbConn}
}
