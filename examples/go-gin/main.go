package main

import (
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/blocto/solana-go-sdk/client"
	"github.com/blocto/solana-go-sdk/common"
	"github.com/blocto/solana-go-sdk/program/system"
	"github.com/blocto/solana-go-sdk/rpc"
	"github.com/blocto/solana-go-sdk/types"
	"github.com/gin-gonic/gin"
)

const (
	ServerPort = ":3000"
)

type Rule struct {
	Rules []Rules `json:"rules"`
}

type Rules struct {
	PathPattern string `json:"pathPattern"`
	ApiPath     string `json:"apiPath"`
}

type ActionGetResponse struct {
	Title       string `json:"title"`
	Icon        string `json:"icon"`
	Description string `json:"description"`
	Links       Links  `json:"links"`
}

type Links struct {
	Actions []ActionLink `json:"actions"`
}

type ActionLink struct {
	Label      string      `json:"label"`
	Href       string      `json:"href"`
	Parameters []Parameter `json:"parameters"`
}

type Parameter struct {
	Name     string `json:"name"`
	Label    string `json:"label"`
	Required bool   `json:"required"`
}

type PostRequest struct {
	Account string `json:"account"`
}

type PostResponse struct {
	Transaction string `json:"transaction"`
	Message     string `json:"message"`
}

func actionRules(c *gin.Context) {
	rules := Rule{
		Rules: []Rules{
			{
				PathPattern: "/**",
				ApiPath:     "/api/actions/transfer-sol",
			},
		},
	}

	c.JSON(http.StatusOK, rules)
}

func handleActionsRequest(c *gin.Context) {
	switch c.Request.Method {
	case http.MethodGet:
		handleGetRequest(c)
	case http.MethodPost:
		handlePostRequest(c)
	default:
		c.JSON(http.StatusMethodNotAllowed, gin.H{"error": "Method not allowed"})
	}
}

func handleGetRequest(c *gin.Context) {
	baseUrl := "/api/actions/transfer-sol?"
	response := ActionGetResponse{
		Title:       "Actions Example - Transfer Native SOL",
		Icon:        "https://solana-actions.vercel.app/solana_devs.jpg",
		Description: "Transfer SOL to another Solana wallet",
		Links: Links{
			Actions: []ActionLink{
				{Label: "Send 1 SOL", Href: fmt.Sprintf("%samount=1", baseUrl)},
				{Label: "Send 2 SOL", Href: fmt.Sprintf("%samount=2", baseUrl)},
				{Label: "Send 3 SOL", Href: fmt.Sprintf("%samount=3", baseUrl)},
				{
					Label: "Send SOL",
					Href:  fmt.Sprintf("%samount={amount}", baseUrl),
					Parameters: []Parameter{
						{
							Name:     "amount",
							Label:    "Enter the amount of SOL you want to send",
							Required: true,
						},
					},
				},
			},
		},
	}

	c.JSON(http.StatusOK, response)
}

func prepareTransaction(c *gin.Context, senderPubKey common.PublicKey, receiverPubKey common.PublicKey, amountInFloat float64) (string, error) {

	client := client.NewClient(rpc.DevnetRPCEndpoint)

	lamports := uint64(amountInFloat * 1e9)

	recentBlockhash, err := client.GetLatestBlockhash(c)
	if err != nil {
		return "", fmt.Errorf("failed to get recent blockhash: %v", err)
	}
	tx, err := types.NewTransaction(types.NewTransactionParam{
		Signers: []types.Account{},
		Message: types.NewMessage(types.NewMessageParam{
			FeePayer:        senderPubKey,
			RecentBlockhash: recentBlockhash.Blockhash,
			Instructions: []types.Instruction{
				system.Transfer(system.TransferParam{
					From:   senderPubKey,
					To:     receiverPubKey,
					Amount: lamports,
				}),
			},
		}),
	})
	if err != nil {
		return "", fmt.Errorf("failed to create transaction: %v", err)
	}

	serializedTx, err := tx.Serialize()
	if err != nil {
		return "", fmt.Errorf("failed to serialize transaction: %v", err)
	}

	encodedTx := base64.StdEncoding.EncodeToString(serializedTx)

	return encodedTx, nil
}

func handlePostRequest(c *gin.Context) {
	var payload PostRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error decoding payload"})
		return
	}

	queryAmount := c.Query("amount")
	amountInFloat, err := strconv.ParseFloat(queryAmount, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid amount"})
		return
	}
	senderPubKey := common.PublicKeyFromString(payload.Account)
	receiverPubKey := types.NewAccount().PublicKey
	serializedTx, err := prepareTransaction(c, senderPubKey, receiverPubKey, amountInFloat)
	if err != nil {
		log.Printf("Error preparing transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error preparing transaction"})
		return
	}

	response := PostResponse{
		Transaction: serializedTx,
		Message:     "Transaction sent successfully",
	}

	c.JSON(http.StatusOK, response)
}

func main() {
	r := gin.Default()

	r.Use(corsMiddleware)

	r.GET("/actions.json", actionRules)
	r.Any("/api/actions/transfer-sol", handleActionsRequest)

	log.Printf("Server starting on port %s", ServerPort)
	if err := r.Run(ServerPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
		os.Exit(1)
	}
}

func corsMiddleware(c *gin.Context) {
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Encoding, Accept-Encoding")

	if c.Request.Method == "OPTIONS" {
		c.AbortWithStatus(http.StatusOK)
		return
	}

	c.Next()
}
