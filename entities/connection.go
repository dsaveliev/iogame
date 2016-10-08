package entities

import (
	"encoding/json"

	"github.com/gorilla/websocket"

	. "iogame/utils"
)

type ConnStatus int

const CONN_STATUS_ALIVE ConnStatus = 0
const CONN_STATUS_CLOSED ConnStatus = 1

type Connection struct {
	Conn   *websocket.Conn
	Status ConnStatus
}

func BuildConnection(conn *websocket.Conn) *Connection {
	return &Connection{
		Conn:   conn,
		Status: CONN_STATUS_ALIVE,
	}
}

func (c *Connection) IsAlive() bool {
	return c.Status == CONN_STATUS_ALIVE
}

func (c *Connection) Send(ws *WorldState) {
	json, err := json.Marshal(ws)
	CheckErr(err, "Marshall")

	err = c.Conn.WriteMessage(websocket.TextMessage, json)
	CheckErr(err, "Write")
}

func (c *Connection) Close() {
	c.Conn.Close()
	c.Status = CONN_STATUS_CLOSED
}

func (c *Connection) Read(ps *PlayerState) {
	err := c.Conn.ReadJSON(ps)
	CheckErr(err, "Read")
}
