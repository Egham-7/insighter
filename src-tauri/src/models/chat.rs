use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
    pub attachments: Vec<FileAttachment>,
    pub timestamp: i64,
}

#[derive(serde::Deserialize)]
pub struct PartialChatMessage {
    pub role: Option<String>,
    pub content: Option<String>,
    pub file_paths: Option<Vec<Option<String>>>,
    pub timestamp: Option<i64>,
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

    pub fn set_role(&mut self, role: String) {
        self.role = role;
    }
    pub fn set_content(&mut self, content: String) {
        self.content = content;
    }
    pub fn set_attachments(&mut self, attachments: Vec<FileAttachment>) {
        self.attachments = attachments;
    }
    pub fn set_timestamp(&mut self, timestamp: i64) {
        self.timestamp = timestamp;
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
