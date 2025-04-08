use crate::models::chat::ChatMessage;
use crate::parsers::csv::CsvParser;
use crate::parsers::FileParser;
use std::path::PathBuf;

#[tauri::command]
pub fn create_chat_message(
    role: String,
    content: String,
    file_path: Option<String>,
    timestamp: i64,
) -> Result<ChatMessage, String> {
    let attachments = if let Some(path) = file_path {
        let parser = CsvParser;
        let path = PathBuf::from(path);
        if !parser.validate(&path) {
            return Err("Invalid file format. Only CSV files are supported.".into());
        }
        parser
            .parse(path)
            .map(|data| data.records().to_vec())
            .map_err(|e| e.to_string())?
    } else {
        Vec::new()
    };

    Ok(ChatMessage::new(role, content, attachments, timestamp))
}
