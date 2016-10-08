package entities

import (
	"time"

	"github.com/gorilla/websocket"

	. "iogame/utils"
)

const FRAME_LENGTH time.Duration = time.Duration(20) * time.Millisecond
const TICKS_LIMIT = 2400

type World struct {
	Players []*Player
}

func BuildWorld() *World {
	return &World{}
}

func (w *World) CreatePlayer(wc *websocket.Conn) {
	c := BuildConnection(wc)
	p := BuildPlayer(c)
	w.Players = append(w.Players, p)

	go p.Listen()
}

func (w *World) DeletePlayer(i int) {
	p := w.Players[i]
	p.Conn.Close()
	tmp := []*Player{}
	tmp = append(tmp, w.Players[:i]...)
	tmp = append(tmp, w.Players[i+1:]...)
	w.Players = tmp
}

func (w *World) UpdatePlayer(p *Player, tickId int) {
	worldState := &WorldState{
		Id:       tickId,
		PlayerId: p.Id,
		Players:  w.Players,
	}
	p.Update(worldState)
}

func (w *World) Run() {
	ticker := time.NewTicker(FRAME_LENGTH)

	defer func() {
		if r := recover(); r != nil {
			Log("Stop the world due previous error")
		}
		ticker.Stop()
	}()

	tickId := 0
	for _ = range ticker.C {
		if tickId >= TICKS_LIMIT {
			tickId = 0
		} else {
			tickId = tickId + 1
		}

		for i, p := range w.Players {
			if p.IsAlive() {
				w.UpdatePlayer(p, tickId)
			} else {
				w.DeletePlayer(i)
			}
		}
	}
}
