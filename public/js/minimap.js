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
