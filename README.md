IOGame
======

Фронтэнд - голый JS, сборка Gulp'ом. Бэкэнд - Golang.

При создании сервера руководстсвовался этим циклом статей:
- [Мультиплеер в быстрых играх (части I, II)](https://habrahabr.ru/post/302394/)
- [Мультиплеер в быстрых играх (Часть III: появление врага)](https://habrahabr.ru/post/302834/)
- [Мультиплеер в быстрых играх (Часть IV: Хэдшот! Путешествуем во времени)](https://habrahabr.ru/post/303006/)

Структура проекта
-----------------
```text
├── entities      // Бэкэнд, основные модули
├── utils         // Бэкэнд, вспомогательные модули
├── main.go       // Бэкэнд, точка входа (главный модуль)
├── public        // Фронт и статика
├── README.md     // Собственно, сабж
├── run.sh        // Скрипт компиляции фронта/бэкэнда и запуска сервера
└── gulpfile.js   // Гульп модули
```

Запуск в текущем виде
---------------------

1. Устанавливаем npm
2. [Устанавливаем golang](https://golang.org/doc/install)
3. Ставим модули гульпа:

	```bash
	npm install --global gulp-cli
	npm install --save-dev gulp
	npm install --save-dev gulp-concat
	npm install --save-dev gulp-uglify
	npm install --save-dev gulp-order
	```

4. Ставим модули golang'а:

	```bash
	go get github.com/gorilla/websocket
	go get github.com/satori/go.uuid
	```

5. Запускаем сервер

	```bash
	./run.sh
	[13:53:33] Using gulpfile ~/Work/Golang/src/iogame/gulpfile.js
	[13:53:33] Starting 'minify'...
	[13:53:33] Finished 'minify' after 14 ms
	[13:53:33] Starting 'default'...
	[13:53:33] Finished 'default' after 48 μs
	2017/02/23 13:53:34 [INFO] Start server on localhost:3000
	```

6. [Идем смотреть, что получилось](http://localhost:3000)

Описание API
------------

### /map
Возврат карты. Нужно дергать перед установкой WebSocket соединения.
```json
{
	"layout": [
		[1, 1, 1, 1, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 0, 0, 0, 1],
		[1, 1, 1, 1, 1]
	],
	"height": 5,
	"width": 5
}
```

### /server
WebSocket соединение.

**id** - номер текущего эмм.. хмм.. фрейма, скажем так.

**state** - состояние игрока:
```golang
const PLAYER_STATE_VALID = 0         // Игрок активен
const PLAYER_STATE_BLOCKED = 1       // Игрок заблокирован. Сервер полагает что коллизии проверяются на клиенте,
                                     // но проверяет состояние у себя, и если концы с концами не сходятся,
                                     // то игрок блокируется (считаем его читером).
const PLAYER_STATE_NETWORK_ERROR = 2 // Ошибка соединения, игрок отключился.
```

От бэкэнда к фронтэнду:
```json
{
	"id": 1831,
	"player_id": "7bb3b5aa-c3a6-4aa2-9fbe-5e1a7a2d7822",
	"players": [{
		"id": "7bb3b5aa-c3a6-4aa2-9fbe-5e1a7a2d7822",
		"x": 2,
		"y": 2,
		"r": 0,
		"state": 0
	},
	{
		"id": "d87ddd78-0cb1-4436-9631-14366488b069",
		"x": 2,
		"y": 2,
		"r": 0,
		"state": 0
	}]
}
```
От фронтэнда бэкэнду:
```json
{
	"id": 1831,
	"x": 2,
	"y": 2,
	"r": 0
}
```

