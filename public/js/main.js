var $ = function(id) { return document.getElementById(id); };
var dc = function(tag) { return document.createElement(tag); };

var map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

var mapWidth = 0;
var mapHeight = 0;
var miniMapScale = 16;

function init() {
	mapWidth = map[0].length;
	mapHeight = map.length;

	bindKeys();
	drawMiniMap();
	gameCycle();
}

function gameCycle() {
	movePlayer();
	updateMiniMap();
  castRays(player);
  requestAnimationFrame(gameCycle)
}
