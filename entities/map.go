package entities

import (
	"math"
)

const MAP_HEIGHT = 10
const MAP_WIDTH = 10

var MAP = [MAP_HEIGHT][MAP_WIDTH]int{
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

func IsBlocking(x float64, y float64) bool {
	if y < 0 || y >= MAP_HEIGHT || x < 0 || x >= MAP_WIDTH {
		return true
	}

	x_index := int(math.Floor(x))
	y_index := int(math.Floor(y))
	return (MAP[y_index][x_index] != 0)
}
