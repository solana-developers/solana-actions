# Solana Action: Transfer SOL

This example demonstrates how to perform a SOL transfer action on the Solana blockchain using Go and the Gin web framework.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup Instructions](#setup-instructions)
3. [Running the Application](#running-the-application)
4. [API Endpoint](#api-endpoint)
5. [Testing the Action on Devnet](#testing-the-action-on-devnet)

---

## Prerequisites

Before proceeding, ensure you have the following:

- Go installed (version 1.16 or higher)
- Gin web framework (`go get github.com/gin-gonic/gin`)
- Solana Devnet setup for testing

---

## Setup Instructions

1. **Clone the repository** and navigate to the Go Gin example directory:

   ```bash
   cd .examples/go-gin
   ```

2. **Install the necessary dependencies** by running:
   ```bash
   go mod tidy
   ```

---

## Running the Application

Once the dependencies are installed, you can start the application by running:

```bash
go run main.go
```

The server will be available at:  
`http://localhost:3000`

---

## API Endpoint

The API endpoint to initiate a SOL transfer action is:

```
http://localhost:3000/api/actions/transfer-sol
```

You can use this endpoint to send SOL from one account to another on the Solana blockchain.

---

## Testing the Action on Devnet

You can easily test the SOL transfer action on Solana Devnet using Blink by visiting:

[https://dial.to/developer?url=localhost%3A3000%2Fapi%2Factions%2Ftransfer-sol&cluster=devnet](https://dial.to/developer?url=localhost%3A3000%2Fapi%2Factions%2Ftransfer-sol&cluster=devnet)

This will allow you to simulate the SOL transfer action in a sandbox environment without using real SOL.

---
