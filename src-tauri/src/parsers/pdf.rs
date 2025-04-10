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

/// Parser for extracting text and metadata from PDF files
///
/// This parser extracts text content from PDF files, splitting it into pages
/// and optionally extracting metadata. It supports processing pages in batches
/// to handle large documents efficiently.
#[derive(Debug)]
pub struct PdfParser {
    batch_size: usize,
    extract_metadata: bool,
    password: Option<String>,
}

impl Default for PdfParser {
    fn default() -> Self {
        Self {
            batch_size: 1000,
            extract_metadata: true,
            password: None,
        }
    }
}

impl PdfParser {
    /// Creates a new PDF parser with default settings
    pub fn new() -> Self {
        Self::default()
    }

    /// Sets the batch size for processing pages
    ///
    /// Larger batch sizes may improve performance but increase memory usage.
    pub fn with_batch_size(mut self, batch_size: usize) -> Self {
        self.batch_size = batch_size;
        self
    }

    /// Controls whether PDF metadata should be extracted
    pub fn with_metadata(mut self, extract_metadata: bool) -> Self {
        self.extract_metadata = extract_metadata;
        self
    }

    /// Sets a password for encrypted PDF documents
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
    type Output = Value;

    fn parse(&self, path: PathBuf) -> Result<ParsedData<Self::Output>, Box<dyn std::error::Error>> {
        // Extract filename for metadata
        let file_name = path
            .file_name()
            .and_then(|name| name.to_str())
            .ok_or(PdfError::InvalidPath)?
            .to_string();

        // Read the PDF file with a capacity hint from the file size
        let file = File::open(&path)?;
        let file_size = file.metadata()?.len() as usize;
        let mut buffer = Vec::with_capacity(file_size);
        let mut reader = BufReader::new(file);
        reader.read_to_end(&mut buffer)?;

        // Extract text from PDF by pages
        let pages = self.extract_text(&buffer)?;

        // Process pages in batches
        let mut all_pages = Vec::new();
        let mut batch = Vec::with_capacity(self.batch_size.min(pages.len()));

        for (page_num, page_content) in pages.iter().enumerate() {
            let content = page_content.trim();
            if content.is_empty() {
                continue;
            }

            let mut page_obj = Map::with_capacity(2);
            page_obj.insert(
                "page_number".to_string(),
                Value::Number((page_num + 1).into()),
            );
            page_obj.insert("content".to_string(), Value::String(content.to_string()));
            batch.push(Value::Object(page_obj));

            // When batch is full, add it to results and start a new batch
            if batch.len() >= self.batch_size {
                all_pages.push(Value::Array(std::mem::take(&mut batch)));
                batch = Vec::with_capacity(self.batch_size.min(pages.len() - page_num - 1));
            }
        }

        // Add any remaining pages
        if !batch.is_empty() {
            all_pages.push(Value::Array(batch));
        }

        // Add metadata if requested
        let mut result =
            Vec::with_capacity(all_pages.len() + if self.extract_metadata { 1 } else { 0 });
        result.extend(all_pages);

        Ok(ParsedData::new(result, file_name))
    }

    fn validate(&self, path: &Path) -> bool {
        path.is_file()
            && path
                .extension()
                .and_then(|ext| ext.to_str())
                .is_some_and(|ext| ext.eq_ignore_ascii_case("pdf"))
    }
}
