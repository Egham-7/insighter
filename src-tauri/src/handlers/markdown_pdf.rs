use tauri::command;
use pulldown_cmark::{Parser, Options, html};
use std::io::Write;
use tempfile::NamedTempFile;
use std::process::Command;

#[command]
pub async fn markdown_to_pdf(markdown: String, pdf_path: String) -> Result<(), String> {
    // Convert markdown to HTML
    let mut html_output = String::new();
    let parser = Parser::new_ext(&markdown, Options::all());
    html::push_html(&mut html_output, parser);

    // Write HTML to a temp file
    let mut temp_html = NamedTempFile::new().map_err(|e| e.to_string())?;
    write!(temp_html, "{}", html_output).map_err(|e| e.to_string())?;
    let html_path = temp_html.path().to_str().unwrap();

    // Call html2pdf CLI
    let output = Command::new("html2pdf")
        .arg(html_path)
        .arg("-o")
        .arg(&pdf_path)
        .output()
        .map_err(|e| format!("Failed to run html2pdf: {e}"))?;

    if !output.status.success() {
        return Err(format!(
            "html2pdf failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    Ok(())
}

