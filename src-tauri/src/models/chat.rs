use serde::{Deserialize, Serialize};
use std::path::PathBuf;

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
    #[serde(skip)]
    pub file_path: PathBuf,
}

impl FileAttachment {
    pub fn new(
        file_name: String,
        file_type: String,
        data: serde_json::Value,
        file_path: PathBuf,
    ) -> Self {
        Self {
            file_name,
            file_type,
            data,
            file_path,
        }
    }
}
