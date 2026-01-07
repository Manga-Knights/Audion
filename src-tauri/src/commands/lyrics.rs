// Lyrics LRC file commands
use std::fs;
use std::path::PathBuf;

/// Get LRC file path for a music file
fn get_lrc_path(music_path: &str) -> PathBuf {
    let path = PathBuf::from(music_path);
    path.with_extension("lrc")
}

/// Save LRC file alongside music file
#[tauri::command]
pub fn save_lrc_file(music_path: String, lrc_content: String) -> Result<(), String> {
    let lrc_path = get_lrc_path(&music_path);

    fs::write(&lrc_path, lrc_content).map_err(|e| format!("Failed to save LRC file: {}", e))?;

    Ok(())
}

/// Load LRC file if it exists
#[tauri::command]
pub fn load_lrc_file(music_path: String) -> Result<Option<String>, String> {
    let lrc_path = get_lrc_path(&music_path);

    if !lrc_path.exists() {
        return Ok(None);
    }

    let content =
        fs::read_to_string(&lrc_path).map_err(|e| format!("Failed to read LRC file: {}", e))?;

    Ok(Some(content))
}
