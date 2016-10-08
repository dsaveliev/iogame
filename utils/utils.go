package utils

import (
	"log"
)

func CheckErr(err error, msg string) {
	if err != nil {
		log.Panicln("[ERROR]["+msg+"]", err)
	}
}

func Log(msg string) {
	log.Println("[INFO]", msg)
}
