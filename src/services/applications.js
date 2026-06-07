/**
 * Job Application Tracker Service
 * CRUD for job applications with SQLite storage
 */

const { v4: uuidv4 } = require('uuid');

class ApplicationsService {
  constructor() { this.db = null; }
  initialize(db) { this.db = db; }

  createApplication(data) {
    const id = uuidv4();
    const stmt = this.db.prepare(
      `INSERT INTO applications (id, company, position, status, applied_date, notes, follow_up_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    );
    stmt.run(id, data.company, data.position, data.status || 'applied',
      data.appliedDate || new Date().toISOString().split('T')[0],
      data.notes || '', data.followUpDate || null);
    return id;
  }

  getApplication(id) {
    const stmt = this.db.prepare('SELECT * FROM applications WHERE id = ?');
    return stmt.get(id);
  }

  updateApplication(id, data) {
    const fields = [];
    const values = [];
    if (data.company !== undefined) { fields.push('company = ?'); values.push(data.company); }
    if (data.position !== undefined) { fields.push('position = ?'); values.push(data.position); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
    if (data.appliedDate !== undefined) { fields.push('applied_date = ?'); values.push(data.appliedDate); }
    if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }
    if (data.followUpDate !== undefined) { fields.push('follow_up_date = ?'); values.push(data.followUpDate); }
    if (fields.length === 0) return false;
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    const stmt = this.db.prepare(`UPDATE applications SET ${fields.join(', ')} WHERE id = ?`);
    return stmt.run(...values).changes > 0;
  }

  deleteApplication(id) {
    const stmt = this.db.prepare('DELETE FROM applications WHERE id = ?');
    return stmt.run(id).changes > 0;
  }

  listApplications(limit = 100) {
    const stmt = this.db.prepare('SELECT * FROM applications ORDER BY updated_at DESC LIMIT ?');
    return stmt.all(limit);
  }

  getStats() {
    const total = this.db.prepare('SELECT COUNT(*) as count FROM applications').get().count;
    const applied = this.db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'applied'").get().count;
    const interview = this.db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'interview'").get().count;
    const offer = this.db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'offer'").get().count;
    const rejected = this.db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'rejected'").get().count;

    const responseRate = total > 0 ? Math.round(((interview + offer) / total) * 100) : 0;

    // Overdue follow-ups
    const overdue = this.db.prepare(
      "SELECT * FROM applications WHERE follow_up_date IS NOT NULL AND follow_up_date < date('now') AND status NOT IN ('offer', 'rejected')"
    ).all();

    return { total, applied, interview, offer, rejected, responseRate, overdue };
  }

  getOverdue() {
    return this.db.prepare(
      "SELECT * FROM applications WHERE follow_up_date IS NOT NULL AND follow_up_date < date('now') AND status NOT IN ('offer', 'rejected') ORDER BY follow_up_date ASC"
    ).all();
  }
}

module.exports = new ApplicationsService();
