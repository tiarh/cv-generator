/**
 * Job Application Tracker Routes
 * /applications — CRUD + Kanban + stats
 */

const express = require('express');
const router = express.Router();
const applications = require('../services/applications');
const db = require('../services/database');

let initialized = false;
function ensureInit() {
  if (!initialized) {
    applications.initialize(db.db);
    initialized = true;
  }
}

// Applications dashboard
router.get('/', (req, res) => {
  ensureInit();
  const apps = applications.listApplications();
  const stats = applications.getStats();
  res.render('applications', { apps, stats });
});

// Create application
router.post('/api/application', (req, res) => {
  ensureInit();
  try {
    const { company, position, status, appliedDate, notes, followUpDate } = req.body;
    if (!company || !position) return res.status(400).json({ error: 'Company and position are required' });
    const id = applications.createApplication({ company, position, status, appliedDate, notes, followUpDate });
    res.json({ success: true, id });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// Update application
router.put('/api/application/:id', (req, res) => {
  ensureInit();
  try {
    const updated = applications.updateApplication(req.params.id, req.body);
    res.json({ success: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Delete application
router.delete('/api/application/:id', (req, res) => {
  ensureInit();
  try {
    const deleted = applications.deleteApplication(req.params.id);
    res.json({ success: deleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

// Get stats
router.get('/api/stats', (req, res) => {
  ensureInit();
  res.json(applications.getStats());
});

// Get overdue follow-ups
router.get('/api/overdue', (req, res) => {
  ensureInit();
  res.json(applications.getOverdue());
});

module.exports = router;
