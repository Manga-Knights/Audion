// Library-related Tauri commands
use crate::db::{queries, Database};
use crate::scanner::{extract_metadata, scan_directory};
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct ScanProgress {
    pub current: usize,
    pub total: usize,
    pub current_file: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScanResult {
    pub tracks_added: usize,
    pub tracks_updated: usize,
    pub errors: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Library {
    pub tracks: Vec<queries::Track>,
    pub albums: Vec<queries::Album>,
    pub artists: Vec<queries::Artist>,
}

#[tauri::command]
pub async fn scan_music(
    paths: Vec<String>,
    db: State<'_, Database>,
) -> Result<ScanResult, String> {
    let mut tracks_added = 0;
    let mut errors = Vec::new();

    for path in paths {
        let scan_result = scan_directory(&path);
        errors.extend(scan_result.errors);

        let conn = db.conn.lock().map_err(|e| e.to_string())?;

        for file_path in scan_result.audio_files {
            if let Some(track_data) = extract_metadata(&file_path) {
                match queries::insert_or_update_track(&conn, &track_data) {
                    Ok(_) => tracks_added += 1,
                    Err(e) => errors.push(format!("Failed to insert {}: {}", file_path, e)),
                }
            }
        }
    }

    Ok(ScanResult {
        tracks_added,
        tracks_updated: 0, // TODO: Distinguish between insert and update
        errors,
    })
}

#[tauri::command]
pub async fn get_library(db: State<'_, Database>) -> Result<Library, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let tracks = queries::get_all_tracks(&conn).map_err(|e| e.to_string())?;
    let albums = queries::get_all_albums(&conn).map_err(|e| e.to_string())?;
    let artists = queries::get_all_artists(&conn).map_err(|e| e.to_string())?;

    Ok(Library {
        tracks,
        albums,
        artists,
    })
}

#[tauri::command]
pub async fn get_tracks_by_album(
    album_id: i64,
    db: State<'_, Database>,
) -> Result<Vec<queries::Track>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_tracks_by_album(&conn, album_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_tracks_by_artist(
    artist: String,
    db: State<'_, Database>,
) -> Result<Vec<queries::Track>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_tracks_by_artist(&conn, &artist).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_album(
    album_id: i64,
    db: State<'_, Database>,
) -> Result<Option<queries::Album>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    queries::get_album_by_id(&conn, album_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_albums_by_artist(
    artist: String,
    db: State<'_, Database>,
) -> Result<Vec<queries::Album>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT DISTINCT a.id, a.name, a.artist, a.art_data 
         FROM albums a
         INNER JOIN tracks t ON t.album_id = a.id
         WHERE t.artist = ?1
         ORDER BY a.name"
    ).map_err(|e| e.to_string())?;

    let albums = stmt.query_map([&artist], |row| {
        Ok(queries::Album {
            id: row.get(0)?,
            name: row.get(1)?,
            artist: row.get(2)?,
            art_data: row.get(3)?,
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(albums)
}
