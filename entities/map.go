package entities

import (
	"math"
)

const HEIGHT = 500
const WIDTH = 500

type Map struct {
	Layout [][]int `json:"layout" binding:"required"`
	Height int     `json:"height" binding:"required"`
	Width  int     `json:"width"  binding:"required"`
}

func BuildLayout() [][]int {
	layout := make([][]int, HEIGHT)
	for i := 0; i != HEIGHT; i++ {
		layout[i] = make([]int, WIDTH)
		for j := 0; j != WIDTH; j++ {
			layout[i][j] = 0
		}
	}
	return layout
}

func BuildMap() *Map {
	return &Map{
		Layout: BuildLayout(),
		Height: HEIGHT,
		Width:  WIDTH,
	}
}

func (m *Map) IsBlocking(x float64, y float64) bool {
	x_index := int(math.Floor(x))
	y_index := int(math.Floor(y))

	if y_index < 0 || y_index >= m.Height || x_index < 0 || x_index >= m.Width {
		return true
	}

	return (m.Layout[y_index][x_index] != 0)
}
