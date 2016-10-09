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
