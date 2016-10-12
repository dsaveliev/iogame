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

var screenWidth = 320;
var stripWidth = 4;
var fov = 60 * Math.PI / 180;
var numRays = Math.ceil(screenWidth / stripWidth);
var fovHalf = fov / 2;
var viewDist = (screenWidth/2) / Math.tan((fov / 2));
var twoPI = Math.PI * 2;

function castRays(player) {
	var stripIdx = 0;

	for (var i = 0; i < numRays; i++) {
		// where on the screen does ray go through?
		var rayScreenPos = (-numRays/2 + i) * stripWidth;

		// the distance from the viewer to the point on the screen, simply Pythagoras.
		var rayViewDist = Math.sqrt(rayScreenPos*rayScreenPos + viewDist*viewDist);

		// the angle of the ray, relative to the viewing direction.
		// right triangle: a = sin(A) * c
		var rayAngle = Math.asin(rayScreenPos / rayViewDist);

		castSingleRay(
		  player,
			player.rot + rayAngle, 	// add the players viewing direction to get the angle in world space
			stripIdx++
		);
	}
}

function castSingleRay(player, rayAngle, stripIdx) {
	// first make sure the angle is between 0 and 360 degrees
	rayAngle %= twoPI;
	if (rayAngle < 0) rayAngle += twoPI;

	// moving right/left? up/down? Determined by which quadrant the angle is in.
	var right = (rayAngle > twoPI * 0.75 || rayAngle < twoPI * 0.25);
	var up = (rayAngle < 0 || rayAngle > Math.PI);

	// only do these once
	var angleSin = Math.sin(rayAngle);
	var angleCos = Math.cos(rayAngle);


	var dist = 0;	// the distance to the block we hit
	var xHit = 0; 	// the x and y coord of where the ray hit the block
	var yHit = 0;

	var textureX;	// the x-coord on the texture of the block, ie. what part of the texture are we going to render
	var wallX;	// the (x,y) map coords of the block
	var wallY;


	// first check against the vertical map/wall lines
	// we do this by moving to the right or left edge of the block we're standing in
	// and then moving in 1 map unit steps horizontally. The amount we have to move vertically
	// is determined by the slope of the ray, which is simply defined as sin(angle) / cos(angle).
	var slope = angleSin / angleCos; 	// the slope of the straight line made by the ray
	var dX = right ? 1 : -1; 	// we move either 1 map unit to the left or right
	var dY = dX * slope; 		// how much to move up or down

	var x = right ? Math.ceil(player.x) : Math.floor(player.x);	// starting horizontal position, at one of the edges of the current map block
	var y = player.y + (x - player.x) * slope;			// starting vertical position. We add the small horizontal step we just made, multiplied by the slope.

	while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
		var wallX = Math.floor(x + (right ? 0 : -1));
		var wallY = Math.floor(y);

		// is this point inside a wall block?
		if (map[wallY][wallX] > 0) {

			var distX = x - player.x;
			var distY = y - player.y;
			dist = distX*distX + distY*distY;	// the distance from the player to this point, squared.

			textureX = y % 1;	// where exactly are we on the wall? textureX is the x coordinate on the texture that we'll use when texturing the wall.
			if (!right) textureX = 1 - textureX; // if we're looking to the left side of the map, the texture should be reversed

			xHit = x;	// save the coordinates of the hit. We only really use these to draw the rays on minimap.
			yHit = y;

			break;
		}
		x += dX;
		y += dY;
	}

	// now check against horizontal lines. It's basically the same, just "turned around".
	// the only difference here is that once we hit a map block,
	// we check if there we also found one in the earlier, vertical run. We'll know that if dist != 0.
	// If so, we only register this hit if this distance is smaller.

	var slope = angleCos / angleSin;
	var dY = up ? -1 : 1;
	var dX = dY * slope;
	var y = up ? Math.floor(player.y) : Math.ceil(player.y);
	var x = player.x + (y - player.y) * slope;

	while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
		var wallY = Math.floor(y + (up ? -1 : 0));
		var wallX = Math.floor(x);
		if (map[wallY][wallX] > 0) {
			var distX = x - player.x;
			var distY = y - player.y;
			var blockDist = distX*distX + distY*distY;
			if (!dist || blockDist < dist) {
				dist = blockDist;
				xHit = x;
				yHit = y;
				textureX = x % 1;
				if (up) textureX = 1 - textureX;
			}
			break;
		}
		x += dX;
		y += dY;
	}

	if (dist) { drawRay(player, xHit, yHit); }
}

function drawRay(player, rayX, rayY) {
	var miniMapObjects = $("minimapobjects");
	var objectCtx = miniMapObjects.getContext("2d");

	objectCtx.strokeStyle = "rgba(0,100,0,0.3)";
	objectCtx.lineWidth = 0.5;
	objectCtx.beginPath();
	objectCtx.moveTo(player.x * miniMapScale, player.y * miniMapScale);
	objectCtx.lineTo(
		rayX * miniMapScale,
		rayY * miniMapScale
	);
	objectCtx.closePath();
	objectCtx.stroke();
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
  castRays(player);
  requestAnimationFrame(gameCycle)
}
