// Database module for SQLite operations
pub mod schema;
pub mod queries;

use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new(app_dir: &PathBuf) -> Result<Self, rusqlite::Error> {
        let db_path = app_dir.join("rlist.db");
        let conn = Connection::open(&db_path)?;
        
        // Initialize schema
        schema::init_schema(&conn)?;
        
        Ok(Self {
            conn: Mutex::new(conn),
        })
    }
}
