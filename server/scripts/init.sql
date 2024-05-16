CREATE DATABASE quarto;

\connect quarto;

CREATE TABLE client_to_room (
  clientId VARCHAR(255) PRIMARY KEY,
  roomId VARCHAR(255) NOT NULL
);

CREATE INDEX room_idx ON client_to_room (roomId);

CLUSTER client_to_room USING room_idx;
