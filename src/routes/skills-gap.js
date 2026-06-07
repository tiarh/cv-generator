/**
 * Skills Gap Analysis Routes
 * /skills-gap — compare user skills vs job requirements
 */

const express = require('express');
const router = express.Router();
const skillsGap = require('../services/skills-gap');
const db = require('../services/database');

let initialized = false;
function ensureInit() {
  if (!initialized) {
    skillsGap.initialize(db.db);
    initialized = true;
  }
}

// Skills Gap landing page
router.get('/', (req, res) => {
  ensureInit();
  const analyses = skillsGap.listAnalyses();
  res.render('skills-gap', { analyses, result: null });
});

// Analyze skills gap
router.post('/analyze', (req, res) => {
  ensureInit();
  try {
    const { targetJob, currentSkills } = req.body;
    const skills = (currentSkills || '').split(',').map(s => s.trim()).filter(Boolean);
    const analysisResult = skillsGap.analyzeSkills(skills, targetJob);

    // Save analysis
    const id = skillsGap.createAnalysis({ targetJob, currentSkills: skills, analysisResult });
    const analyses = skillsGap.listAnalyses();

    res.render('skills-gap', {
      analyses,
      result: { id, targetJob, currentSkills: skills, ...analysisResult }
    });
  } catch (error) {
    console.error('Skills gap error:', error);
    res.status(500).render('skills-gap', { analyses: [], result: null, error: 'Analysis failed' });
  }
});

// Delete an analysis
router.delete('/api/analysis/:id', (req, res) => {
  ensureInit();
  try {
    const deleted = skillsGap.deleteAnalysis(req.params.id);
    res.json({ success: deleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

module.exports = router;
