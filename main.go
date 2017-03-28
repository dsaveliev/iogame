package main

import (
	"encoding/json"
	"flag"
	"math/rand"
	"net/http"
	"time"

	"github.com/gorilla/websocket"

	. "iogame/entities"
	. "iogame/utils"
)

var addr = flag.String("addr", "localhost:3000", "http service address")

var world = BuildWorld()

var upgrader = websocket.Upgrader{
	//ReadBufferSize:  1024,
	//WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func serverHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	CheckErr(err, "Upgrade")

	world.CreatePlayer(conn)
}

func mapHandler(w http.ResponseWriter, r *http.Request) {
	json, err := json.Marshal(world.Map)
	CheckErr(err, "Marshall")

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Write(json)
}

func main() {
	seed := int64(time.Now().Unix())
	rand.Seed(seed)

	Log("Start server on localhost:3000")
	go world.Run()

	flag.Parse()

	staticHandler := http.FileServer(http.Dir("public"))
	vendorHandler := http.FileServer(http.Dir("node_modules"))

	http.Handle("/", staticHandler)
	http.Handle("/vendor/", http.StripPrefix("/vendor/", vendorHandler))
	http.HandleFunc("/server", serverHandler)
	http.HandleFunc("/map", mapHandler)
	http.ListenAndServe(*addr, nil)
}
