use markdown2pdf::parse;

/// Convert Markdown to PDF using markdown2pdf.
///
/// # Arguments
/// * `markdown` - The Markdown content as a string.
/// * `output_path` - The path where the PDF should be saved.
///
/// # Returns
/// * `Ok(())` on success, or an error message on failure.
#[tauri::command]
pub async fn markdown_to_pdf(markdown: String, output_path: String) -> Result<(), String> {
    parse(markdown, &output_path).map_err(|e| format!("Failed to convert markdown to PDF: {e}"))?;
    Ok(())
}
