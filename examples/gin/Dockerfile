FROM golang:1.22.4 as builder

WORKDIR /app

COPY go.mod .
COPY go.sum .

# Install dependencies before build
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o blink_app .

FROM alpine:latest

RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*


COPY --from=builder /app/blink_app .

ENTRYPOINT ["./blink_app"]