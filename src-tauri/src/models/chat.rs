use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
    pub attachments: Vec<FileAttachment>,
    pub timestamp: i64,
}

impl ChatMessage {
    pub fn new(
        role: String,
        content: String,
        attachments: Vec<FileAttachment>,
        timestamp: i64,
    ) -> Self {
        Self {
            role,
            content,
            attachments,
            timestamp,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileAttachment {
    pub file_name: String,
    pub file_type: String,
    pub data: serde_json::Value,
}

impl FileAttachment {
    pub fn new(file_name: String, file_type: String, data: serde_json::Value) -> Self {
        Self {
            file_name,
            file_type,
            data,
        }
    }
}
