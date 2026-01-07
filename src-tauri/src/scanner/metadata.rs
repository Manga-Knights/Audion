// Audio metadata extraction using lofty
use base64::{engine::general_purpose::STANDARD, Engine};
use lofty::{Accessor, AudioFile, Probe, TaggedFileExt};
use std::path::Path;

use crate::db::queries::TrackInsert;

pub fn extract_metadata(path: &str) -> Option<TrackInsert> {
    let path = Path::new(path);

    // Try to read the file
    let tagged_file = match Probe::open(path).and_then(|p| p.read()) {
        Ok(file) => file,
        Err(e) => {
            eprintln!("Failed to read audio file {:?}: {}", path, e);
            return Some(create_fallback_metadata(path));
        }
    };

    let properties = tagged_file.properties();
    let duration = properties.duration().as_secs() as i32;
    let bitrate = properties.audio_bitrate().map(|b| b as i32);
    let format = Some(format!("{:?}", tagged_file.file_type()));

    // Try to get tags
    let tag = tagged_file
        .primary_tag()
        .or_else(|| tagged_file.first_tag());

    match tag {
        Some(tag) => {
            let title = tag
                .title()
                .map(|s| s.to_string())
                .or_else(|| get_filename_without_ext(path));
            let artist = tag.artist().map(|s| s.to_string());
            let album = tag.album().map(|s| s.to_string());
            let track_number = tag.track().map(|n| n as i32);

            // Extract album art
            let album_art = tag
                .pictures()
                .first()
                .map(|pic| STANDARD.encode(pic.data()));

            Some(TrackInsert {
                path: path.to_string_lossy().to_string(),
                title,
                artist,
                album,
                track_number,
                duration: Some(duration),
                album_art,
                format,
                bitrate,
            })
        }
        None => {
            // No tags found, use fallback
            let mut track = create_fallback_metadata(path);
            track.duration = Some(duration);
            track.format = format;
            track.bitrate = bitrate;
            Some(track)
        }
    }
}

fn create_fallback_metadata(path: &Path) -> TrackInsert {
    TrackInsert {
        path: path.to_string_lossy().to_string(),
        title: get_filename_without_ext(path),
        artist: None,
        album: None,
        track_number: None,
        duration: None,
        album_art: None,
        format: None,
        bitrate: None,
    }
}

fn get_filename_without_ext(path: &Path) -> Option<String> {
    path.file_stem()
        .and_then(|s| s.to_str())
        .map(|s| s.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_filename_without_ext() {
        assert_eq!(
            get_filename_without_ext(Path::new("/music/song.flac")),
            Some("song".to_string())
        );
        assert_eq!(
            get_filename_without_ext(Path::new("artist - track.mp3")),
            Some("artist - track".to_string())
        );
    }
}
