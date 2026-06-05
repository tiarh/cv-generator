/**
 * Database Service
 * Handles all SQLite operations for CV drafts
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class DatabaseService {
  constructor() {
    this.db = null;
    this.dbPath = null;
  }

  initialize(dbPath) {
    this.dbPath = dbPath || process.env.DB_PATH || './db/cvgenerator.db';
    const dbDir = path.dirname(this.dbPath);

    // Ensure db directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');

    // Create tables if not exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS drafts (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        template TEXT DEFAULT 'ats-modern',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_drafts_updated 
      ON drafts(updated_at DESC)
    `);

    console.log('Database connected:', this.dbPath);
  }

  createDraft(data, template = 'ats-modern') {
    const id = uuidv4();
    const stmt = this.db.prepare(
      'INSERT INTO drafts (id, data, template) VALUES (?, ?, ?)'
    );
    stmt.run(id, JSON.stringify(data), template);
    return id;
  }

  getDraft(id) {
    const stmt = this.db.prepare('SELECT * FROM drafts WHERE id = ?');
    const row = stmt.get(id);
    if (row) {
      row.data = JSON.parse(row.data);
    }
    return row;
  }

  updateDraft(id, data, template) {
    const stmt = this.db.prepare(
      'UPDATE drafts SET data = ?, template = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    const result = stmt.run(JSON.stringify(data), template || 'ats-modern', id);
    return result.changes > 0;
  }

  deleteDraft(id) {
    const stmt = this.db.prepare('DELETE FROM drafts WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  listDrafts(limit = 20) {
    const stmt = this.db.prepare(
      'SELECT id, template, created_at, updated_at FROM drafts ORDER BY updated_at DESC LIMIT ?'
    );
    return stmt.all(limit);
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = new DatabaseService();