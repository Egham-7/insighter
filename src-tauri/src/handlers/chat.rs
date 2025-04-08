use crate::models::chat::ChatMessage;
use crate::parsers::csv::CsvParser;
use crate::parsers::FileParser;
use std::path::PathBuf;

#[tauri::command]
pub fn create_chat_message(
    role: String,
    content: String,
    file_paths: Vec<Option<String>>,
    timestamp: i64,
) -> Result<ChatMessage, String> {
    let attachments = if !file_paths.is_empty() {
        let mut all_records = Vec::new();
        for file_path in file_paths.into_iter().flatten() {
            let parser = CsvParser;
            let path = PathBuf::from(file_path);
            if !parser.validate(&path) {
                continue;
            }
            let records = parser
                .parse(path)
                .map(|data| data.records().to_vec())
                .map_err(|e| e.to_string())?;
            all_records.extend(records);
        }
        all_records
    } else {
        Vec::new()
    };

    Ok(ChatMessage::new(role, content, attachments, timestamp))
}
