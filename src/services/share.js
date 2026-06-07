/**
 * Share Service
 * Generates public shareable links for CVs with optional password & expiry
 */

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class ShareService {
  constructor() { this.db = null; }
  initialize(db) { this.db = db; }

  createShareLink(data) {
    const id = uuidv4();
    const shareId = crypto.randomBytes(6).toString('hex'); // 12-char short ID
    const stmt = this.db.prepare(
      `INSERT INTO share_links (id, share_id, draft_id, cv_data, template, password, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    );
    stmt.run(id, shareId, data.draftId || null,
      JSON.stringify(data.cvData || {}),
      data.template || 'ats-modern',
      data.password || null,
      data.expiresAt || null);
    return { id, shareId };
  }

  getSharedCV(shareId) {
    const stmt = this.db.prepare('SELECT * FROM share_links WHERE share_id = ?');
    const row = stmt.get(shareId);
    if (!row) return null;

    // Check expiry
    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      return { expired: true };
    }

    row.cv_data = JSON.parse(row.cv_data);
    return row;
  }

  verifyPassword(shareId, password) {
    const stmt = this.db.prepare('SELECT password FROM share_links WHERE share_id = ?');
    const row = stmt.get(shareId);
    if (!row) return false;
    if (!row.password) return true; // No password required
    return row.password === password;
  }

  listShareLinks(limit = 20) {
    const stmt = this.db.prepare('SELECT id, share_id, draft_id, template, password IS NOT NULL as has_password, expires_at, created_at FROM share_links ORDER BY created_at DESC LIMIT ?');
    return stmt.all(limit);
  }

  deleteShareLink(id) {
    const stmt = this.db.prepare('DELETE FROM share_links WHERE id = ?');
    return stmt.run(id).changes > 0;
  }

  getShareLinkByDraftId(draftId) {
    const stmt = this.db.prepare('SELECT * FROM share_links WHERE draft_id = ? ORDER BY created_at DESC LIMIT 1');
    const row = stmt.get(draftId);
    if (row) row.cv_data = JSON.parse(row.cv_data);
    return row;
  }
}

module.exports = new ShareService();
