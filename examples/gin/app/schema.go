package app

type ActionGetResponse struct {
	Title       string `json:"title"`
	Icon        string `json:"icon"`
	Description string `json:"description"`
	Label       string `json:"label"`
	Links       struct {
		Actions []Actions `json:"actions"`
	} `json:"links"`
}

type Actions struct {
	Label      string             `json:"label"`
	Href       string             `json:"href"`
	Parameters []ActionParameters `json:"parameters,omitempty"`
}

type ActionParameters struct {
	Name     string `json:"name"`
	Label    string `json:"label"`
	Required bool   `json:"required"`
}

type ActionPostRequest struct {
	Account string `json:"account"`
}

type ActionPostResponse struct {
	Fields ActionPostResponseFields `json:"fields"`
}
type ActionPostResponseFields struct {
	Transaction string `json:"transaction"`
	Message     string `json:"message"`
}

type ActionError struct {
	Message string `json:"message"`
}

type MintNFTParams struct {
	Name   string `form:"name"   binding:"required"`
	Symbol string `form:"symbol" binding:"required"`
	URI    string `form:"uri"    binding:"required"`
}

var ACTIONS_CORS_HEADERS = map[string]string{
	"Access-Control-Allow-Origin":  "*",
	"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
}
