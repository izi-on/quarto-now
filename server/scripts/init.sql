CREATE DATABASE quarto;

\connect quarto;

CREATE TABLE room (
  id VARCHAR(255) PRIMARY KEY,
  game_id VARCHAR(255) NOT NULL,
  client_id_of_generator VARCHAR(255) NOT NULL,
  does_creator_start BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  has_started BOOLEAN DEFAULT FALSE
);


CREATE TABLE client_room_hub (
  client_id VARCHAR(255) PRIMARY KEY,
  room_id VARCHAR(255) NOT NULL,
  hub_id VARCHAR(255) NOT NULL,
  FOREIGN KEY (room_id) REFERENCES room (id)
);

CREATE INDEX hub_idx ON client_room_hub (hub_id);
CREATE INDEX room_idx ON client_room_hub (room_id);

CLUSTER client_room_hub USING hub_idx;
