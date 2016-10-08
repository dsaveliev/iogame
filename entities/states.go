package entities

type PlayerState struct {
	Id  int     `json:"id" binding:"required"`
	X   float64 `json:"x" binding:"required"`
	Y   float64 `json:"y" binding:"required"`
	Rot float64 `json:"r" binding:"required"`
}

type WorldState struct {
	Id       int       `json:"id" binding:"required"`
	PlayerId string    `json:"player_id" binding:"required"`
	Players  []*Player `json:"players" binding:"required"`
}
