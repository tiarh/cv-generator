/**
 * Interview Prep Routes
 * /interview-prep — generate interview questions and suggested answers
 */

const express = require('express');
const router = express.Router();
const interviewPrep = require('../services/interview-prep');
const db = require('../services/database');

let initialized = false;
function ensureInit() {
  if (!initialized) {
    interviewPrep.initialize(db.db);
    initialized = true;
  }
}

// Interview Prep landing page
router.get('/', (req, res) => {
  ensureInit();
  const sessions = interviewPrep.listPrepSessions();
  res.render('interview', { sessions, result: null });
});

// Generate questions for a role
router.post('/generate', (req, res) => {
  ensureInit();
  try {
    const { company, position, cvData } = req.body;
    const questions = interviewPrep.generateQuestionsForRole(position, company);

    // Save session
    const id = interviewPrep.createPrepSession({ company, position, cvData, questions });
    const sessions = interviewPrep.listPrepSessions();

    res.render('interview', {
      sessions,
      result: { id, questions, company, position, cvData }
    });
  } catch (error) {
    console.error('Interview prep error:', error);
    res.status(500).render('interview', { sessions: [], result: null, error: 'Failed to generate questions' });
  }
});

// Get AI-suggested answer for a question
router.post('/api/answer', async (req, res) => {
  ensureInit();
  try {
    const { question, cvData } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const answer = await interviewPrep.generateSuggestedAnswer(question, cvData);
    res.json({ success: true, answer });
  } catch (error) {
    console.error('Answer generation error:', error);
    res.status(500).json({ error: 'Failed to generate answer' });
  }
});

// Delete a prep session
router.delete('/api/session/:id', (req, res) => {
  ensureInit();
  try {
    const deleted = interviewPrep.deletePrepSession(req.params.id);
    res.json({ success: deleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

module.exports = router;
