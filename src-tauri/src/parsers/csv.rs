use super::{FileParser, ParsedData}; // Assuming these are defined elsewhere
use serde_json::{Map, Number, Value}; // Import Number
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

    #[error("File metadata error: {0}")]
    Metadata(std::io::Error),
}

#[derive(Debug)]
pub struct CsvParser {
    has_headers: bool,
    delimiter: u8,
}

impl Default for CsvParser {
    fn default() -> Self {
        Self {
            has_headers: true,
            delimiter: b',',
        }
    }
}

impl CsvParser {
    pub fn new() -> Self {
        Self::default()
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

/// Attempts to parse a string value into the most appropriate JSON Value type.
fn infer_value_type(value_str: &str) -> Value {
    let trimmed = value_str.trim();

    // Handle empty strings as Null
    if trimmed.is_empty() {
        return Value::Null;
    }

    // Try parsing as integer (i64)
    if let Ok(num) = trimmed.parse::<i64>() {
        return Value::Number(Number::from(num));
    }

    // Try parsing as float (f64)
    if let Ok(num) = trimmed.parse::<f64>() {
        // Use Number::from_f64 for safe conversion (handles NaN/Infinity)
        if let Some(n) = Number::from_f64(num) {
            return Value::Number(n);
        }
        // If from_f64 fails (NaN/Infinity), fall back to string
    }

    // Try parsing as boolean (case-insensitive)
    match trimmed.to_lowercase().as_str() {
        "true" | "t" | "yes" | "y" | "1" => return Value::Bool(true),
        "false" | "f" | "no" | "n" | "0" => return Value::Bool(false),
        _ => {} // Not a standard boolean string
    }

    // Default to String if no other type matches
    Value::String(value_str.to_string()) // Store original string if it couldn't be parsed
}

impl FileParser for CsvParser {
    type Output = Value;

    fn parse(&self, path: PathBuf) -> Result<ParsedData<Self::Output>, Box<dyn std::error::Error>> {
        let file_name = path
            .file_name()
            .and_then(|name| name.to_str())
            .ok_or(CsvError::InvalidPath)?
            .to_string();

        let file = File::open(&path)?;
        let file_size = file.metadata().map_err(CsvError::Metadata)?.len();
        let buffer_size = (file_size.min(1024 * 1024) as usize).max(8192);
        let reader = BufReader::with_capacity(buffer_size, file);

        let mut csv_reader = csv::ReaderBuilder::new()
            .has_headers(self.has_headers)
            .delimiter(self.delimiter)
            .from_reader(reader);

        let headers = if self.has_headers {
            csv_reader.headers()?.clone()
        } else {
            let mut first_record = csv::StringRecord::new();
            if csv_reader.read_record(&mut first_record)? {
                let record_width = first_record.len();
                (0..record_width)
                    .map(|i| format!("column_{}", i + 1))
                    .collect::<Vec<_>>()
                    .into()
            } else {
                csv::StringRecord::new()
            }
        };

        let headers_pos = csv_reader.position().clone();
        csv_reader.seek(headers_pos)?;

        let mut all_row_objects = Vec::new();

        for result in csv_reader.records() {
            let record = result?;

            // Create a JSON object for the row with inferred types
            let row_obj: Map<String, Value> = headers
                .iter()
                .zip(record.iter())
                .map(|(header, value_str)| {
                    // Infer the type for each value
                    (header.to_string(), infer_value_type(value_str))
                })
                .collect();

            all_row_objects.push(Value::Object(row_obj));
        }

        let final_output = Value::Array(all_row_objects);

        Ok(ParsedData::new(final_output, file_name))
    }

    fn validate(&self, path: &Path) -> bool {
        path.is_file()
            && path
                .extension()
                .and_then(|ext| ext.to_str())
                .is_some_and(|ext| ext.eq_ignore_ascii_case("csv"))
    }
}
