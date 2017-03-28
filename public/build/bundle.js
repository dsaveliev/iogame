(function () {
'use strict';

var WS = function WS(props) {
    var this$1 = this;

    this.webSocket = new WebSocket(props.server);
    this.webSocket.onopen = function () {
        console.log("OPEN");
    };
    this.webSocket.onclose = function (event) {
        console.log("CLOSE");
        console.log(event);
        this$1.webSocket = null;
    };
    this.webSocket.onmessage = function (event) {
        var state = JSON.parse(event.data);
        props.onMessage(state);
    };
    this.webSocket.onerror = function (event) {
        console.log("ERROR");
        console.log(event.data);
    };
};

/* global Phaser */
var SPEED = 150;

// это типа локальный стейт
var state = {
    tickId: null,
    player: null,
    players: {
        byId: {},
        allIds: []
    },
    map: null
};

var ws = new WS({
    server: 'ws://localhost:3000/server',
    onMessage: function onMessage(serverState) {
        var currentPlayerId = serverState.player_id;
        state.tickId = serverState.id;
        var alivePlayersIds = {
            byId: {},
            allIds: []
        };

        for (var i = 0; i < serverState.players.length; i++) {
            var player = serverState.players[i];
            alivePlayersIds.byId[player.id] = true;
            alivePlayersIds.allIds.push(player.id);

            if (player.id === currentPlayerId) {
                if (!state.player) {
                    // добавляем текущего игрока, если его еще нет
                    state.player = {
                        id: player.id,
                        x: player.x,
                        y: player.y,
                        r: player.r
                    };
                }
                continue;
            }

            var otherPlayer = state.players.byId[player.id];
            // обновляем других игроков
            if (!otherPlayer) {
                createPlayer({
                    x: player.x,
                    y: player.y,
                    r: player.r,
                    id: player.id
                });
            } else {
                otherPlayer.x = player.x;
                otherPlayer.y = player.y;
                otherPlayer.r = player.r;
            }
        }

        // удаляем игроков, которые есть локально, но не пришли с сервера
        if (alivePlayersIds.allIds.length < state.players.allIds.length) {
            filterPlayers(alivePlayersIds);
        }

        if (!alivePlayersIds.byId[state.player.id]) {
            // убираем текущего игрока
            state.player = null;
        }
    }
});

var game;
// let weapon;
var monster;
// let cursors;
var wKey;
var aKey;
var sKey;
var dKey;
// let fireButton;

fetch('http://localhost:3000/map')
    .then(function (response) { return response.json(); })
    .then(function (map) {
        state.map = map;

        // создаем игру
        game = new Phaser.Game(
            map.width * 10,
            map.height * 10,
            Phaser.AUTO,
            document.querySelector('.js-game'),
            { preload: preload, create: create, update: update }
        );
    })
    .catch(function (error) {
        console.error(error);
    });

/**
 * Метод для предзагрузки ресурсов для игры
 */
function preload() {
    game.load.image('grass', '/assets/grass.jpg');
    game.load.image('bullet', '/assets/bullet.png');

    game.load.spritesheet('player', '/assets/player.png', 60, 60);
    game.load.spritesheet('monster', '/assets/monster.png', 80, 80);
}

/**
 * Запускается при создании игры
 */
function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.world.setBounds(0, 0, 1000, 1000);

    game.add.tileSprite(0, 0, 1000, 1000, 'grass');

    // weapon = game.add.weapon(30, 'bullet');
    // weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    // weapon.bulletSpeed = 1000;
    // weapon.fireRate = 200;
    // weapon.trackSprite(player, 27, 0, true);

    monster = game.add.sprite(600, 600, 'monster');
    game.physics.arcade.enable(monster);

    // cursors = game.input.keyboard.createCursorKeys();
    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);

    // fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
}

/**
 * Обновляет состояние игры в бесконечном цикле
 */
function update() {
    if (state.player) {
        var moving = false;
        if (
            wKey.isDown ||
            aKey.isDown ||
            sKey.isDown ||
            dKey.isDown
        ) {
            if (aKey.isDown) {
                state.player.x = -SPEED;
            } else if (dKey.isDown) {
                state.player.x = SPEED;
            }
            if (wKey.isDown) {
                state.player.y = -SPEED;
            } else if (sKey.isDown) {
                state.player.y = SPEED;
            }

            moving = true;
        }
        state.player.r = game.physics.arcade.angleToPointer(state.player);

        if (!state.player.sprite) {
            state.player.sprite = createPlayerSprite(state.player);
        }

        if (moving) {
            state.player.sprite.body.velocity.x = state.player.x;
            state.player.sprite.body.velocity.y = state.player.y;

            state.player.sprite.animations.play('walk');
        } else {
            state.player.sprite.animations.stop();
            state.player.sprite.frame = 0;
        }
        state.player.sprite.rotation = state.player.r;

        var updatePlayer = {
            id: state.tickId + 1,
            x: state.player.x,
            y: state.player.y,
            r: state.player.r
        };

        // отправка данных об игроке
        ws.webSocket.send(JSON.stringify(updatePlayer));
    }

    // if (fireButton.isDown) {
    //     weapon.fire();
    // }

    // обновляем остальных игроков
    state.players.allIds.forEach(function (id) {
        var player = state.players.byId[id];
        if (!player.sprite) {
            player.sprite = createPlayerSprite(player);
        }
        player.sprite.body.velocity.x = player.x;
        player.sprite.body.velocity.y = player.y;
        player.sprite.rotation = player.r;
    });
}

/**
 * Добавляет игрока в state
 * @param {number} x
 * @param {number} y
 * @param {number} r
 * @param {string} id
 */
function createPlayer(ref) {
    var x = ref.x;
    var y = ref.y;
    var r = ref.r; if ( r === void 0 ) r = 0;
    var id = ref.id;

    state.players.byId[id] = {
        sprite: null,
        x: x,
        y: y,
        r: r
    };
    state.players.allIds.push(id);
}

/**
 * Возвращает спрайт игрока
 * @param {number} x
 * @param {number} y
 */
function createPlayerSprite(ref) {
    var x = ref.x;
    var y = ref.y;

    var sprite = game.add.sprite(x, y, 'player');
    sprite.anchor.setTo(0.5, 0.5);
    game.physics.arcade.enable(sprite);
    sprite.body.collideWorldBounds = true;
    sprite.animations.add('walk', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);
    return sprite;
}

/**
 * Удаляет игроков, не входящих в <aliveIds>
 * @param {number[]} aliveIds
 */
function filterPlayers(aliveIds) {
    var newStatePlayers = {
        allIds: aliveIds.allIds,
        byId: {}
    };
    state.players.allIds.filter(function (id) {
        if (aliveIds[id]) {
            newStatePlayers.byId[id] = state.players.byId[id];
        }
    });
}

}());
//# sourceMappingURL=bundle.js.map
