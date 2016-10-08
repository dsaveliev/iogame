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
