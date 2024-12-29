use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::net::SocketAddr;
use std::env;
use dotenv::dotenv;
use axum::{Router, routing::post, extract::Json, response::IntoResponse};
use tower_http::cors::{CorsLayer, Any};

#[derive(Serialize)]
struct OpenAIChatRequest {
    model: String,
    messages: Vec<Message>,
    max_tokens: usize,
    temperature: f32,
}

#[derive(Serialize, Deserialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct OpenAIChatResponse {
    choices: Option<Vec<ChatChoice>>,
    error: Option<OpenAIError>,
}

#[derive(Deserialize)]
struct ChatChoice {
    message: Message,
}

#[derive(Deserialize)]
struct OpenAIError {
    message: String,
}

#[derive(Debug, Deserialize)]
struct LogRequest {
    text: String,
    command: String,
}

async fn edit_text(action: &str, input_text: &str, api_key: &str) -> Result<String, Box<dyn Error>> {
    let model = "gpt-3.5-turbo";

    let prompt = match action {
        "paraphrase" => format!("Paraphrase this text: {}", input_text),
        "expand" => format!("Expand this text: {}", input_text),
        "summarize" => format!("Summarize this text: {}", input_text),
        "translate" => format!("Translate this text into French: {}", input_text),
        _ => return Err("Invalid action type".into()),
    };

    let messages = vec![Message {
        role: "user".to_string(),
        content: prompt,
    }];

    let request_body = OpenAIChatRequest {
        model: model.to_string(),
        messages,
        max_tokens: 100,
        temperature: 0.7,
    };

    let client = Client::new();
    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&request_body)
        .send()
        .await?;

    let status = response.status();
    let response_body: OpenAIChatResponse = response.json().await?;

    if status.is_success() {
        if let Some(choices) = response_body.choices {
            if let Some(choice) = choices.get(0) {
                return Ok(choice.message.content.trim().to_string());
            }
        }
        Err("No choices found in the response".into())
    } else if let Some(error) = response_body.error {
        Err(format!("API Error: {}", error.message).into())
    } else {
        Err("Unknown error occurred".into())
    }
}

pub fn build_routes() -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    return Router::new().merge(routes()).layer(cors);
}

fn routes() -> Router {
    return Router::new()
        .route("/proc", post(handler));
}

async fn handler(Json(body): Json<LogRequest>) -> impl IntoResponse {
    dotenv().ok();
    let api_key = env::var("API_KEY").unwrap();

    let text = body.text;
    let command = body.command;

    let result = edit_text(&command, &text, &api_key).await.unwrap();

    Json(format!("{}", result))
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    let routes = build_routes();
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("--> LISTENING on {addr}");

    axum::Server::bind(&addr).serve(routes.into_make_service()).await.unwrap();

    Ok(())
}
