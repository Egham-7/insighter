use super::{FileParser, ParsedData};
use serde_json::{Map, Value};
use std::fs::File;
use std::io::BufReader;
use std::path::{Path, PathBuf};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum CsvError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("CSV parsing error: {0}")]
    Csv(#[from] csv::Error),

    #[error("Invalid file path")]
    InvalidPath,
}

#[derive(Debug, Default)]
pub struct CsvParser {
    batch_size: usize,
    has_headers: bool,
    delimiter: u8,
}

impl CsvParser {
    pub fn new() -> Self {
        Self {
            batch_size: 1000,
            has_headers: true,
            delimiter: b',',
        }
    }

    pub fn with_batch_size(mut self, batch_size: usize) -> Self {
        self.batch_size = batch_size;
        self
    }

    pub fn with_headers(mut self, has_headers: bool) -> Self {
        self.has_headers = has_headers;
        self
    }

    pub fn with_delimiter(mut self, delimiter: u8) -> Self {
        self.delimiter = delimiter;
        self
    }
}

impl FileParser for CsvParser {
    type Output = Value;

    fn parse(&self, path: PathBuf) -> Result<ParsedData<Self::Output>, Box<dyn std::error::Error>> {
        // Extract filename for metadata
        let file_name = path
            .file_name()
            .and_then(|name| name.to_str())
            .ok_or(CsvError::InvalidPath)?
            .to_string();

        // Open file with buffered reader
        let file = File::open(&path)?;
        let file_size = file.metadata()?.len();
        let buffer_size = (file_size.min(1024 * 1024) as usize).max(8192);
        let reader = BufReader::with_capacity(buffer_size, file);

        // Create CSV reader with configuration
        let mut csv_reader = csv::ReaderBuilder::new()
            .has_headers(self.has_headers)
            .delimiter(self.delimiter)
            .from_reader(reader);

        // Get headers
        let headers = if self.has_headers {
            csv_reader
                .headers()?
                .iter()
                .map(String::from)
                .collect::<Vec<_>>()
        } else {
            // If no headers present, generate column names
            let record_width = csv_reader.headers()?.len();
            (0..record_width).map(|i| format!("column_{i}")).collect()
        };

        // Process records in batches
        let mut all_records = Vec::new();
        let mut batch = Vec::with_capacity(self.batch_size);

        for result in csv_reader.records() {
            let record = result?;

            let row_obj = headers
                .iter()
                .enumerate()
                .filter_map(|(i, header)| {
                    record
                        .get(i)
                        .map(|value| (header.clone(), Value::String(value.to_string())))
                })
                .collect::<Map<String, Value>>();

            batch.push(Value::Object(row_obj));

            // When batch is full, add it to results and start a new batch
            if batch.len() >= self.batch_size {
                all_records.push(Value::Array(std::mem::take(&mut batch)));
                batch.reserve(self.batch_size);
            }
        }

        // Add any remaining records
        if !batch.is_empty() {
            all_records.push(Value::Array(batch));
        }

        Ok(ParsedData::new(all_records, file_name))
    }

    fn validate(&self, path: &Path) -> bool {
        path.is_file()
            && path
                .extension()
                .and_then(|ext| ext.to_str())
                .is_some_and(|ext| ext.eq_ignore_ascii_case("csv"))
    }
}
