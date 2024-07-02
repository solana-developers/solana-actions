use axum::{
    extract::{Json, Query},
    http::{
        header::{ACCEPT_ENCODING, AUTHORIZATION, CONTENT_ENCODING, CONTENT_TYPE},
        Method, StatusCode,
    },
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use base64::{engine::general_purpose::STANDARD, Engine};
use bincode::serialize;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    commitment_config::CommitmentConfig, native_token::LAMPORTS_PER_SOL, pubkey::Pubkey,
    signature::Keypair, signer::Signer, system_instruction::transfer, transaction::Transaction,
};
use std::str::FromStr;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

#[tokio::main]
async fn main() {
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers([
            CONTENT_TYPE,
            AUTHORIZATION,
            CONTENT_ENCODING,
            ACCEPT_ENCODING,
        ])
        .allow_origin(Any);

    let app = Router::new()
        .route("/actions.json", get(get_request_actions_json))
        .route("/api/actions/transfer-sol", get(get_request_handler))
        .route("/api/actions/transfer-sol", post(post_request_handler))
        .layer(cors);

    let listener = TcpListener::bind("127.0.0.1:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn get_request_actions_json() -> impl IntoResponse {
    Json(json!({
        "rules": [
            {
                "pathPattern": "/*",
                "apiPath": "/api/actions/*",
            },
            {
                "pathPattern": "/api/actions/**",
                "apiPath": "/api/actions/**",
            },
        ],
    }))
}

#[derive(Serialize)]
struct ActionGetResponse {
    title: String,
    icon: String,
    description: String,
    links: Links,
}

#[derive(Serialize)]
struct Links {
    actions: Vec<ActionLink>,
}

#[derive(Serialize)]
struct ActionLink {
    label: String,
    href: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    parameters: Option<Vec<Parameter>>,
}

#[derive(Serialize)]
struct Parameter {
    name: String,
    label: String,
    required: bool,
}

async fn get_request_handler() -> impl IntoResponse {
    let base_href = "/api/actions/transfer-sol?";
    let response = ActionGetResponse {
        title: "Actions Example - Transfer Native SOL".into(),
        icon: "https://solana-actions.vercel.app/solana_devs.jpg".into(),
        description: "Transfer SOL to another Solana wallet".into(),
        links: Links {
            actions: vec![
                ActionLink {
                    label: "Send 1 SOL".into(),
                    href: format!("{}amount=1", base_href),
                    parameters: None,
                },
                ActionLink {
                    label: "Send 5 SOL".into(),
                    href: format!("{}amount=5", base_href),
                    parameters: None,
                },
                ActionLink {
                    label: "Send 10 SOL".into(),
                    href: format!("{}amount=10", base_href),
                    parameters: None,
                },
                ActionLink {
                    label: "Send SOL".into(),
                    href: format!("{}amount={{amount}}", base_href),
                    parameters: Some(vec![Parameter {
                        name: "amount".into(),
                        label: "Enter the amount of SOL to send".into(),
                        required: true,
                    }]),
                },
            ],
        },
    };

    (StatusCode::OK, Json(response))
}

#[derive(Deserialize)]
struct QueryParams {
    amount: f64,
}

#[derive(Deserialize)]
struct PostRequest {
    account: String,
}

#[derive(Serialize)]
struct PostResponse {
    transaction: String,
    message: String,
}

async fn post_request_handler(
    Query(params): Query<QueryParams>,
    Json(payload): Json<PostRequest>,
) -> Result<impl IntoResponse, (StatusCode, Json<Value>)> {
    let account = Pubkey::from_str(&payload.account).map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "Invalid 'account' provided"})),
        )
    })?;
    let to_pubkey = Keypair::new().pubkey();
    let lamports = (params.amount * LAMPORTS_PER_SOL as f64) as u64;

    let rpc_client = RpcClient::new_with_commitment(
        "https://api.devnet.solana.com".to_string(),
        CommitmentConfig::confirmed(),
    );

    let recent_blockhash = rpc_client.get_latest_blockhash().map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": format!("Failed to get latest blockhash: {}", e)})),
        )
    })?;

    let instruction = transfer(&account, &to_pubkey, lamports);
    let mut transaction = Transaction::new_with_payer(&[instruction], Some(&account));
    transaction.message.recent_blockhash = recent_blockhash;

    let serialized_transaction = serialize(&transaction).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": "Failed to serialize transaction"})),
        )
    })?;

    Ok(Json(PostResponse {
        transaction: STANDARD.encode(serialized_transaction),
        message: format!("Send {} SOL to {}", params.amount, to_pubkey),
    }))
}
