package entities

import (
	"github.com/satori/go.uuid"

	. "iogame/utils"
)

const PLAYER_STATE_VALID = 0
const PLAYER_STATE_BLOCKED = 1
const PLAYER_STATE_NETWORK_ERROR = 2

type Player struct {
	Id    string      `json:"id" binding:"required"`
	X     float64     `json:"x"  binding:"required"`
	Y     float64     `json:"y"  binding:"required"`
	Rot   float64     `json:"r" binding:"required"`
	State int         `json:"state" binding:"required"`
	Conn  *Connection `json:"-"`
}

func BuildPlayer(conn *Connection) *Player {
	return &Player{
		Id:    uuid.NewV4().String(),
		X:     2.0,
		Y:     2.0,
		Rot:   0.0,
		State: PLAYER_STATE_VALID,
		Conn:  conn,
	}
}

func (p *Player) IsAlive() bool {
	return p.Conn.IsAlive() && p.State == PLAYER_STATE_VALID
}

func (p *Player) Listen(m *Map) {
	defer func() {
		if r := recover(); r != nil {
			Log("Close connection due previous error")
		}
		p.State = PLAYER_STATE_NETWORK_ERROR
		p.Conn.Close()
	}()

	for {
		if !p.IsAlive() {
			break
		}
		ps := &PlayerState{}
		p.Conn.Read(ps)
		if !m.IsBlocking(ps.X, ps.Y) {
			p.X = ps.X
			p.Y = ps.Y
			p.Rot = ps.Rot
		} else {
			p.State = PLAYER_STATE_BLOCKED
		}
	}
}

func (p *Player) Update(ws *WorldState) {
	p.Conn.Send(ws)
}
