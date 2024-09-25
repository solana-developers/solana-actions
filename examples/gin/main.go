package main

import (
	"StickyLabsBlinks/app"
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"os"
)

func main() {
	var (
		corsConfig = cors.DefaultConfig()
		router     = gin.Default()
		port       = os.Getenv("PORT")
	)

	corsConfig.AllowAllOrigins = true
	corsConfig.AddAllowHeaders([]string{"Content-Length", "Content-Type", "Access-Control-Allow-Origin"}...)
	corsConfig.AddAllowMethods([]string{"GET", "POST", "OPTIONS"}...)

	router.Use(cors.New(corsConfig))

	router.GET("/actions.json", app.ActionsRulesHandler)
	router.GET("/api/actions/mint_nft", app.GetActionsHandler)
	router.OPTIONS("/api/actions/mint_nft", app.OptionsHandler)
	router.POST("/api/actions/mint_nft", app.PostHandler)

	log.Println("StickyLabs Blink Active 🚀")

	if port == "" {
		port = "8081"
	}

	log.Println("Server is running")
	err := router.Run(fmt.Sprintf(":%v", port))
	if err != nil {
		log.Fatal(err)
		return
	}
}
