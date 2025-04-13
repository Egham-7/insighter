use super::{FileParser, ParsedData};
use pdf_extract::{self};
use serde_json::{Map, Value};
use std::fs::File;
use std::io::{BufReader, Read};
use std::path::{Path, PathBuf};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum PdfError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("PDF parsing error: {0}")]
    Pdf(String),

    #[error("Invalid file path")]
    InvalidPath,
}

#[derive(Debug)]
pub struct PdfParser {
    // Removed batch_size
    extract_metadata: bool, // Kept for potential future use, but not used in current output
    password: Option<String>,
}

impl Default for PdfParser {
    fn default() -> Self {
        Self {
            // batch_size: 1000, // Removed
            extract_metadata: true,
            password: None,
        }
    }
}

impl PdfParser {
    pub fn new() -> Self {
        Self::default()
    }

    // Removed with_batch_size

    pub fn with_metadata(mut self, extract_metadata: bool) -> Self {
        self.extract_metadata = extract_metadata;
        self
    }

    pub fn with_password(mut self, password: impl Into<String>) -> Self {
        self.password = Some(password.into());
        self
    }

    fn extract_text(&self, buffer: &[u8]) -> Result<Vec<String>, PdfError> {
        let result = match &self.password {
            Some(password) => {
                pdf_extract::extract_text_from_mem_by_pages_encrypted(buffer, password)
            }
            None => pdf_extract::extract_text_from_mem_by_pages(buffer),
        };

        result.map_err(|e| PdfError::Pdf(e.to_string()))
    }
}

impl FileParser for PdfParser {
    type Output = Value; // Output is a single Value (Value::Array)

    fn parse(&self, path: PathBuf) -> Result<ParsedData<Self::Output>, Box<dyn std::error::Error>> {
        let file_name = path
            .file_name()
            .and_then(|name| name.to_str())
            .ok_or(PdfError::InvalidPath)?
            .to_string();

        let file = File::open(&path)?;
        let file_size = file.metadata()?.len() as usize;
        let mut buffer = Vec::with_capacity(file_size);
        let mut reader = BufReader::new(file);
        reader.read_to_end(&mut buffer)?;

        let pages = self.extract_text(&buffer)?;

        // Collect all page objects into a single Vec
        let mut all_page_objects = Vec::with_capacity(pages.len());

        for (page_num, page_content) in pages.iter().enumerate() {
            let content = page_content.trim();
            if content.is_empty() {
                continue; // Skip empty pages
            }

            let mut page_obj = Map::with_capacity(2);
            page_obj.insert(
                "page_number".to_string(),
                Value::Number((page_num + 1).into()),
            );
            page_obj.insert("content".to_string(), Value::String(content.to_string()));
            all_page_objects.push(Value::Object(page_obj));
        }

        // Wrap the collection of page objects in a single Value::Array
        let final_output = Value::Array(all_page_objects);

        Ok(ParsedData::new(final_output, file_name))
    }

    fn validate(&self, path: &Path) -> bool {
        path.is_file()
            && path
                .extension()
                .and_then(|ext| ext.to_str())
                .is_some_and(|ext| ext.eq_ignore_ascii_case("pdf"))
    }
}
