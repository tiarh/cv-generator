/**
 * Database Initialization Script
 * Creates SQLite database and tables for CV drafts
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const dbPath = process.env.DB_PATH || './db/cvgenerator.db';
const dbDir = path.dirname(dbPath);

// Ensure db directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

console.log('Initializing database at:', dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create drafts table
db.exec(`
  CREATE TABLE IF NOT EXISTS drafts (
    id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    template TEXT DEFAULT 'ats-modern',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create index for faster lookups
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_drafts_updated 
  ON drafts(updated_at DESC)
`);

console.log('Database initialized successfully!');
console.log('Tables created: drafts');

db.close();