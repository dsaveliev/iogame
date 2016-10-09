var $ = function(id) { return document.getElementById(id); };
var dc = function(tag) { return document.createElement(tag); };

var map = [];
var mapWidth = 0;
var mapHeight = 0;
var miniMapScale = 32;

function loadMap()
{
  var url = "http://localhost:3000/map";

  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", url, false ); // false for synchronous request
  xmlHttp.send( null );

  var json = JSON.parse(xmlHttp.responseText);
  map = json.layout;
  mapWidth = json.width;
  mapHeight = json.height;
}

function init() {
  loadMap();
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
