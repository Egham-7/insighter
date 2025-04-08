use super::{FileParser, ParsedData};
use crate::models::chat::FileAttachment;
use std::path::{Path, PathBuf};

#[derive(Debug, Default)]
pub struct CsvParser;

impl FileParser for CsvParser {
    type Output = FileAttachment;

    fn parse(&self, path: PathBuf) -> Result<ParsedData<Self::Output>, Box<dyn std::error::Error>> {
        let reader = csv::Reader::from_path(&path)?;
        let csv_data: Vec<serde_json::Value> =
            reader.into_deserialize().collect::<Result<Vec<_>, _>>()?;

        let file_name = path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or_default()
            .to_string();

        let attachment = FileAttachment::new(
            file_name.clone(),
            "csv".to_string(),
            serde_json::Value::Array(csv_data),
        );

        Ok(ParsedData::new(vec![attachment], file_name))
    }

    fn validate(&self, path: &Path) -> bool {
        path.extension()
            .and_then(|ext| ext.to_str())
            .is_some_and(|ext| ext.eq_ignore_ascii_case("csv"))
    }
}
