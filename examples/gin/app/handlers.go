package app

import (
	"github.com/blocto/solana-go-sdk/types"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
)

const (
	RPC_URL = ""
)

func ActionsRulesHandler(c *gin.Context) {
	payload := gin.H{
		"rules": []gin.H{
			{
				"pathPattern": "/*",
				"apiPath":     "/api/actions/*",
			},
			{
				"pathPattern": "/api/actions/**",
				"apiPath":     "/api/actions/**",
			},
		},
	}

	c.JSON(http.StatusOK, payload)
}

func GetActionsHandler(c *gin.Context) {
	payload := ActionGetResponse{
		Title: "Actions Example - Mint NFT",
		// Icon:        c.Request.URL.Scheme + "://" + c.Request.URL.Host + "/solana_devs.jpg",
		Description: "Transfer SOL to another Solana wallet",
		Label:       "Transfer",
	}
	payload.Links.Actions = []Actions{
		{"Mint NFT", "/api/actions/mint_nft", []ActionParameters{
			{"name", "Enter the Name of the NFT", true},
			{"symbol", "Enter the Symbol of the NFT", true},
			{"uri", "Enter the Uri of the NFT", true},
		}},
	}

	c.JSON(http.StatusOK, payload)
}

func OptionsHandler(c *gin.Context) {
	for key, value := range ACTIONS_CORS_HEADERS {
		c.Header(key, value)
	}
	c.Status(http.StatusOK)
}

func PostHandler(c *gin.Context) {
	var (
		qPayload MintNFTParams
		request  ActionPostRequest
		response ActionPostResponse
	)

	if err := c.ShouldBindQuery(&qPayload); err != nil {
		c.JSON(http.StatusBadRequest, ActionError{Message: "Invalid Query Params"})
		return
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, ActionError{Message: "Invalid request"})
		return
	}

	account, err := types.AccountFromBase58(request.Account)
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusBadRequest, ActionError{Message: "Invalid request; Error validating account"})
		return
	}
	response.Fields.Transaction, response.Fields.Message = mintNFT(qPayload, account)

	c.JSON(http.StatusOK, response)
}
