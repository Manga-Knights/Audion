// Scanner module for file walking and metadata extraction
pub mod walker;
pub mod metadata;

pub use walker::scan_directory;
pub use metadata::extract_metadata;
