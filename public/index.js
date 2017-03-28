/* global Phaser */
import WS from './js/websocket';

const SPEED = 150;

// это типа локальный стейт
const state = {
    tickId: null,
    player: null,
    players: {
        byId: {},
        allIds: []
    },
    map: null
};

const ws = new WS({
    server: 'ws://localhost:3000/server',
    onMessage(serverState) {
        const currentPlayerId = serverState.player_id;
        state.tickId = serverState.id;
        const alivePlayersIds = {
            byId: {},
            allIds: []
        };

        for (let i = 0; i < serverState.players.length; i++) {
            const player = serverState.players[i];
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

            let otherPlayer = state.players.byId[player.id];
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

let game;
// let weapon;
let monster;
// let cursors;
let wKey;
let aKey;
let sKey;
let dKey;
// let fireButton;

fetch('http://localhost:3000/map')
    .then(response => response.json())
    .then(map => {
        state.map = map;

        // создаем игру
        game = new Phaser.Game(
            map.width * 10,
            map.height * 10,
            Phaser.AUTO,
            document.querySelector('.js-game'),
            { preload, create, update }
        );
    })
    .catch(error => {
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
        let moving = false;
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

        const updatePlayer = {
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
    state.players.allIds.forEach(id => {
        const player = state.players.byId[id];
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
function createPlayer({ x, y, r = 0, id }) {
    state.players.byId[id] = {
        sprite: null,
        x,
        y,
        r
    };
    state.players.allIds.push(id);
}

/**
 * Возвращает спрайт игрока
 * @param {number} x
 * @param {number} y
 */
function createPlayerSprite({ x, y }) {
    const sprite = game.add.sprite(x, y, 'player');
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
    const newStatePlayers = {
        allIds: aliveIds.allIds,
        byId: {}
    };
    state.players.allIds.filter(id => {
        if (aliveIds[id]) {
            newStatePlayers.byId[id] = state.players.byId[id];
        }
    });
}
