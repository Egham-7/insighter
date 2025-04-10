use crate::parsers::csv::CsvParser;
use crate::parsers::FileParser;
use std::path::PathBuf;

#[tauri::command]
pub fn parse_csv(file_path: String) -> Result<serde_json::Value, String> {
    let parser = CsvParser::new();
    let path = PathBuf::from(file_path);

    if !parser.validate(&path) {
        return Err("Invalid file format. Only CSV files are supported.".to_string());
    }

    parser
        .parse(path)
        .map(|data| {
            let records = data.records();
            serde_json::to_value(records).unwrap_or(serde_json::Value::Null)
        })
        .map_err(|e| e.to_string())
}
