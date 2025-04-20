pub mod csv;
pub mod pdf;

pub use csv::CsvParser;
pub use pdf::PdfParser;

use serde::Serialize;
use std::path::{Path, PathBuf};

#[derive(Debug)]
pub struct ParsedData<T> {
    data: T,
    file_name: String,
}

impl<T> ParsedData<T> {
    // Constructor now takes a single data item
    pub fn new(data: T, file_name: String) -> Self {
        Self { data, file_name }
    }

    // Renamed method to access the data
    pub fn data(&self) -> &T {
        &self.data
    }

    pub fn file_name(&self) -> &str {
        &self.file_name
    }
}

pub trait FileParser {
    type Output: Serialize;

    // The parse function returns ParsedData containing the single Output item.
    fn parse(&self, path: PathBuf) -> Result<ParsedData<Self::Output>, Box<dyn std::error::Error>>;

    // Validate function remains the same.
    fn validate(&self, path: &Path) -> bool;
}
