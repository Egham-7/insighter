pub mod csv;

pub use csv::CsvParser;

use serde::Serialize;
use std::path::{Path, PathBuf};

#[derive(Debug)]
pub struct ParsedData<T> {
    records: Vec<T>,
    file_name: String,
}

impl<T> ParsedData<T> {
    pub fn new(records: Vec<T>, file_name: String) -> Self {
        Self { records, file_name }
    }

    pub fn records(&self) -> &[T] {
        &self.records
    }

    pub fn file_name(&self) -> &str {
        &self.file_name
    }
}

pub trait FileParser {
    type Output: Serialize;
    fn parse(&self, path: PathBuf) -> Result<ParsedData<Self::Output>, Box<dyn std::error::Error>>;
    fn validate(&self, path: &Path) -> bool;
}
