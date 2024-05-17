package pubsub

import (
	"fmt"

	"github.com/go-redis/redis"
)

type Pubsub struct {
	redis *redis.Client
}

func NewPubsub(redisAddr string) (*Pubsub, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})
	_, err := rdb.Ping().Result()
	if err != nil {
		fmt.Println("could not connect to redis client:", err)
		return &Pubsub{}, err
	}
	return &Pubsub{redis: rdb}, nil
}

func (ps *Pubsub) Publish(hubId string, payload string) error {
	err := ps.redis.Publish(hubId, payload).Err()
	if err != nil {
		fmt.Printf("Failed to publish using pubsub to %s", hubId)
		return err
	}
	fmt.Printf("Published on %s\n", hubId)
	return nil
}

func (ps *Pubsub) GetSubscriber(hubId string) *redis.PubSub {
	fmt.Printf("Subscribing on %s\n", hubId)
	return ps.redis.Subscribe(hubId)
}
