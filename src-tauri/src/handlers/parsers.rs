use crate::parsers::{csv::CsvParser, pdf::PdfParser, FileParser};
use serde_json::Value;
use std::path::PathBuf;

#[tauri::command]
pub fn parse_file(file_path: String) -> Result<Value, String> {
    let path = PathBuf::from(file_path);

    let extension = path
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.to_lowercase())
        .ok_or_else(|| "Unable to determine file type from extension".to_string())?;

    match extension.as_str() {
        "csv" => {
            let parser = CsvParser::new();
            parse_with_parser(parser, path)
        }
        "pdf" => {
            let parser = PdfParser::new();
            parse_with_parser(parser, path)
        }
        _ => Err(format!("Unsupported file type: {}", extension)),
    }
}

fn parse_with_parser<P>(parser: P, path: PathBuf) -> Result<Value, String>
where
    P: FileParser<Output = Value>,
{
    if !parser.validate(&path) {
        return Err(format!("Invalid file format for path: {}", path.display()));
    }

    parser
        .parse(path)
        .map(|data| {
            let records = data.records();
            serde_json::to_value(records).unwrap_or(Value::Null)
        })
        .map_err(|e| e.to_string())
}
