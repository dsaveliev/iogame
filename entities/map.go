package entities

import (
	"math"
)

const MAP_HEIGHT = 10
const MAP_WIDTH = 10

var MAP = [][]int{
	{1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
	{1, 0, 0, 0, 0, 0, 0, 0, 0, 1},
	{1, 0, 0, 0, 0, 0, 0, 0, 0, 1},
	{1, 0, 0, 0, 0, 0, 0, 0, 0, 1},
	{1, 0, 0, 0, 0, 0, 0, 0, 0, 1},
	{1, 0, 0, 0, 0, 0, 0, 0, 0, 1},
	{1, 0, 0, 0, 0, 0, 0, 0, 0, 1},
	{1, 0, 0, 0, 0, 0, 0, 0, 0, 1},
	{1, 0, 0, 0, 0, 0, 0, 0, 0, 1},
	{1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
}

type Map struct {
	layout [][]int `json:"layout" binding:"required"`
	height int     `json:"height" binding:"required"`
	width  int     `json:"width"  binding:"required"`
}

func BuildMap() *Map {
	return &Map{
		layout: MAP,
		height: MAP_HEIGHT,
		width:  MAP_WIDTH,
	}
}

func (m *Map) IsBlocking(x float64, y float64) bool {
	x_index := int(math.Floor(x))
	y_index := int(math.Floor(y))

	if y_index < 0 || y_index >= m.height || x_index < 0 || x_index >= m.width {
		return true
	}

	return (m.layout[y_index][x_index] != 0)
}
