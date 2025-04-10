use super::{FileParser, ParsedData};
use std::io::Read;
use std::path::{Path, PathBuf};

#[derive(Debug, Default)]
pub struct CsvParser;

impl FileParser for CsvParser {
    type Output = serde_json::Value;

    fn parse(&self, path: PathBuf) -> Result<ParsedData<Self::Output>, Box<dyn std::error::Error>> {
        // Read file contents
        let mut file = std::fs::File::open(&path)?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)?;

        // Parse the contents using a reader from the string
        let mut reader = csv::Reader::from_reader(contents.as_bytes());

        let csv_data: Vec<serde_json::Value> =
            reader.deserialize().collect::<Result<Vec<_>, _>>()?;

        let file_name = path
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or_default()
            .to_string();

        Ok(ParsedData::new(vec![csv_data], file_name))
    }

    fn validate(&self, path: &Path) -> bool {
        path.extension()
            .and_then(|ext| ext.to_str())
            .is_some_and(|ext| ext.eq_ignore_ascii_case("csv"))
    }
}
