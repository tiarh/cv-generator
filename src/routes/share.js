/**
 * Share Routes
 * /share — public shareable CV links
 */

const express = require('express');
const router = express.Router();
const share = require('../services/share');
const db = require('../services/database');

let initialized = false;
function ensureInit() {
  if (!initialized) {
    share.initialize(db.db);
    initialized = true;
  }
}

// View a shared CV (public)
router.get('/:shareId', (req, res) => {
  ensureInit();
  const shared = share.getSharedCV(req.params.shareId);

  if (!shared) return res.status(404).render('404', {});
  if (shared.expired) return res.render('share', { expired: true, needPassword: false, shareId: req.params.shareId, data: null, template: null });

  if (shared.password) {
    // Check if password was submitted
    if (req.query.pw !== shared.password) {
      return res.render('share', { expired: false, needPassword: true, shareId: req.params.shareId, data: null, template: null });
    }
  }

  res.render('share', {
    expired: false,
    needPassword: false,
    shareId: req.params.shareId,
    data: shared.cv_data,
    template: shared.template
  });
});

// Password verification
router.post('/:shareId/verify', (req, res) => {
  ensureInit();
  const { password } = req.body;
  const valid = share.verifyPassword(req.params.shareId, password);
  if (valid) {
    const shared = share.getSharedCV(req.params.shareId);
    res.json({ success: true, redirect: `/share/${req.params.shareId}?pw=${encodeURIComponent(password)}` });
  } else {
    res.json({ success: false, error: 'Incorrect password' });
  }
});

// Create a share link (API)
router.post('/api/create', (req, res) => {
  ensureInit();
  try {
    const { draftId, cvData, template, password, expiresAt } = req.body;
    const result = share.createShareLink({ draftId, cvData, template, password, expiresAt });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Share create error:', error);
    res.status(500).json({ error: 'Failed to create share link' });
  }
});

// List share links (API)
router.get('/api/links', (req, res) => {
  ensureInit();
  res.json(share.listShareLinks());
});

// Delete share link
router.delete('/api/link/:id', (req, res) => {
  ensureInit();
  try {
    const deleted = share.deleteShareLink(req.params.id);
    res.json({ success: deleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete share link' });
  }
});

module.exports = router;
