// bind keyboard events to game functions (movement, etc)
function bindKeys() {
	document.onkeydown = function(e) {
		e = e || window.event;
		switch (e.keyCode) { // which key was pressed?
			case 38: // up, move player forward, ie. increase speed
				player.speed = 1;
				break;
			case 40: // down, move player backward, set negative speed
				player.speed = -1;
				break;
			case 37: // left, rotate player left
				player.dir = -1;
				break;
			case 39: // right, rotate player right
				player.dir = 1;
				break;
		}
	}

	document.onkeyup = function(e) {
		e = e || window.event;
		switch (e.keyCode) {
			case 38:
			case 40:
				player.speed = 0;	// stop the player movement when up/down key is released
				break;
			case 37:
			case 39:
				player.dir = 0;
				break;
		}
	}
}

function updateMiniMap() {
	var miniMap = $("minimap");
	var miniMapObjects = $("minimapobjects");

	var objectCtx = miniMapObjects.getContext("2d");
	objectCtx.clearRect(0,0,miniMap.width,miniMap.height);

  drawPlayer(player, objectCtx);
  for (var pid in players) {
    var other_player = players[pid];
    drawPlayer(other_player, objectCtx);
  }
}

function drawMiniMap() {
	// draw the topdown view minimap

	var miniMap = $("minimap");			// the actual map
	var miniMapCtr = $("minimapcontainer");		// the container div element
	var miniMapObjects = $("minimapobjects");	// the canvas used for drawing the objects on the map (player character, etc)

	miniMap.width = mapWidth * miniMapScale;	// resize the internal canvas dimensions
	miniMap.height = mapHeight * miniMapScale;	// of both the map canvas and the object canvas
	miniMapObjects.width = miniMap.width;
	miniMapObjects.height = miniMap.height;

	var w = (mapWidth * miniMapScale) + "px" 	// minimap CSS dimensions
	var h = (mapHeight * miniMapScale) + "px"
	miniMap.style.width = miniMapObjects.style.width = miniMapCtr.style.width = w;
	miniMap.style.height = miniMapObjects.style.height = miniMapCtr.style.height = h;


	var ctx = miniMap.getContext("2d");

	// loop through all blocks on the map
	for (var y=0;y<mapHeight;y++) {
		for (var x=0;x<mapWidth;x++) {
			var wall = map[y][x];
			if (wall > 0) { // if there is a wall block at this (x,y) ...
				ctx.fillStyle = "rgb(200,200,200)";
				ctx.fillRect(				// ... then draw a block on the minimap
					x * miniMapScale,
					y * miniMapScale,
					miniMapScale,miniMapScale
				);
			}
		}
	}
	updateMiniMap();
}

var players = {};
var player = createPlayer(2, 2, 0);

function createPlayer(x, y, rot) {
  return {
  	x : x,			// current x, y position
  	y : y,
  	dir : 0,		// the direction that the player is turning, either -1 for left or 1 for right.
  	rot : rot,		// the current angle of rotation
  	speed : 0,		// is the playing moving forward (speed = 1) or backwards (speed = -1).
  	moveSpeed : 0.18,	// how far (in map units) does the player move each step/update
  	rotSpeed : 8		// how much does the player rotate each step/update (in degrees)
  }
}

function movePlayer() {
	var moveStep = player.speed * player.moveSpeed;	// player will move this far along the current direction vector

	player.rot += player.dir * player.rotSpeed * Math.PI / 180; // add rotation if player is rotating (player.dir != 0)

	var newX = player.x + Math.cos(player.rot) * moveStep;	// calculate new player position with simple trigonometry
	var newY = player.y + Math.sin(player.rot) * moveStep;

  if (isBlocking(newX, newY)) {
		// No, bail out
		return;
	}

	player.x = newX; // set new position
	player.y = newY;
}

function isBlocking(x,y) {
	// First make sure that we cannot move
	// outside the boundaries of the level
	if (y < 0 || y >= mapHeight || x < 0 || x >= mapWidth) {
		return true;
	}
	// Return true if the map block is not 0,
	// i.e. if there is a blocking wall.
	return (map[Math.floor(y)][Math.floor(x)] != 0);
}

function drawPlayer(p, ctx) {
	ctx.fillRect(		// draw a dot at the current player position
		p.x * miniMapScale - 2,
		p.y * miniMapScale - 2,
		4, 4
	);

	ctx.beginPath();
	ctx.moveTo(p.x * miniMapScale, p.y * miniMapScale);
	ctx.lineTo(
		(p.x + Math.cos(p.rot) * 4) * miniMapScale,
		(p.y + Math.sin(p.rot) * 4) * miniMapScale
	);
	ctx.closePath();
	ctx.stroke();
}

var ws = new WebSocket("ws://localhost:3000/server");

ws.onopen = function(evt) {
    console.log("OPEN");
}
ws.onclose = function(evt) {
    console.log("CLOSE: " + evt.data);
    ws = null;
}
ws.onmessage = function(evt) {
    json = JSON.parse(evt.data);

    var playerId = json.player_id;
    var tickId = json.id;
    var newTickId = tickId + 1;
    var existed = {};

    for (var i = 0; i < json.players.length; i++) {
      var data = json.players[i];

      if (data.id == playerId) { continue; }

      var otherPlayer = players[data.id]
      if (otherPlayer == null) {
        otherPlayer = createPlayer(data.x, data.y, data.r)
        players[data.id] = otherPlayer
      } else {
        otherPlayer.x = data.x
        otherPlayer.y = data.y
        otherPlayer.rot = data.r
      }

      existed[data.id] = true;
    }

    for (id in players) {
      if (!existed[id]) { delete players[id]; }
    }

    var updatePlayer = '{"id":'+newTickId+',"x":'+player.x+',"y":'+player.y+',"r":'+player.rot+'}';
    ws.send(updatePlayer);
}
ws.onerror = function(evt) {
    console.log("ERROR: " + evt.data);
}

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
  requestAnimationFrame(gameCycle)
}
