use crate::parsers::{csv::CsvParser, pdf::PdfParser, FileParser}; // Ensure ParsedData is imported
use serde_json::Value;
use std::path::PathBuf;

#[tauri::command]
pub fn parse_file(file_path: String) -> Result<Value, String> {
    let path = PathBuf::from(file_path);

    // Check if the file exists before proceeding
    if !path.exists() {
        return Err(format!("File not found: {}", path.display()));
    }
    if !path.is_file() {
        return Err(format!("Path is not a file: {}", path.display()));
    }

    let extension = path
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.to_lowercase())
        .ok_or_else(|| "Unable to determine file type from extension".to_string())?;

    match extension.as_str() {
        "csv" => {
            let parser = CsvParser::new().with_headers(true).with_delimiter(b',');
            parse_with_parser(parser, path)
        }
        "pdf" => {
            let parser = PdfParser::new().with_metadata(false);
            parse_with_parser(parser, path)
        }
        _ => Err(format!("Unsupported file type: {}", extension)),
    }
}

fn parse_with_parser<P>(parser: P, path: PathBuf) -> Result<Value, String>
where
    // The parser's Output type must be serde_json::Value
    P: FileParser<Output = Value>,
{
    // Validation is good, keep it.
    if !parser.validate(&path) {
        // Provide a more specific error if validation fails
        return Err(format!(
            "File validation failed for parser: {}",
            path.display()
        ));
    }

    // Call the parser's parse method
    parser
        .parse(path.clone())
        .map(|parsed_data| parsed_data.data().clone())
        .map_err(|e| {
            // Improve error reporting
            eprintln!("Parsing error for {}: {}", path.display(), e);
            format!("Failed to parse file {}: {}", path.display(), e)
        })
}
