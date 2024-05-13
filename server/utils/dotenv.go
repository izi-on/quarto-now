package utils

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnvVars() {
	env := os.Getenv("GO_ENV")
	if env == "" {
		env = "development"
	}
	envFile := fmt.Sprintf(".env.%s", env)
	if err := godotenv.Load(envFile); err != nil {
		log.Fatalf("Error loading dotenv file for %s environment: %v", env, err)
	}
}
