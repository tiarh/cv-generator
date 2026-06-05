/**
 * CV Routes
 * Handles all CV-related API endpoints
 */

const express = require('express');
const router = express.Router();
const db = require('../services/database');
const ai = require('../services/ai');

// Initialize database on first request
let dbInitialized = false;
function ensureDb() {
  if (!dbInitialized) {
    db.initialize();
    dbInitialized = true;
  }
}

// Get landing page
router.get('/', (req, res) => {
  res.render('index', { templates: ['ats-modern', 'ats-classic', 'ats-minimal'] });
});

// Get wizard page
router.get('/wizard/:template?', (req, res) => {
  const template = req.params.template || 'ats-modern';
  const validTemplates = ['ats-modern', 'ats-classic', 'ats-minimal'];
  const finalTemplate = validTemplates.includes(template) ? template : 'ats-modern';

  res.render('wizard', { 
    template: finalTemplate,
    step: 1,
    draftId: null,
    savedData: null
  });
});

// Get draft for editing
router.get('/draft/:id', (req, res) => {
  ensureDb();
  const draft = db.getDraft(req.params.id);
  
  if (!draft) {
    return res.redirect('/');
  }

  res.render('wizard', {
    template: draft.template,
    step: 1,
    draftId: draft.id,
    savedData: draft.data
  });
});

// List drafts
router.get('/drafts', (req, res) => {
  ensureDb();
  const drafts = db.listDrafts();
  res.render('drafts', { drafts });
});

// Save draft
router.post('/api/draft', (req, res) => {
  ensureDb();
  try {
    const { data, template } = req.body;
    const id = db.createDraft(data, template);
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ success: false, error: 'Failed to save draft' });
  }
});

// Update draft
router.put('/api/draft/:id', (req, res) => {
  ensureDb();
  try {
    const { data, template } = req.body;
    const updated = db.updateDraft(req.params.id, data, template);
    res.json({ success: updated });
  } catch (error) {
    console.error('Error updating draft:', error);
    res.status(500).json({ success: false, error: 'Failed to update draft' });
  }
});

// Delete draft
router.delete('/api/draft/:id', (req, res) => {
  ensureDb();
  try {
    const deleted = db.deleteDraft(req.params.id);
    res.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ success: false, error: 'Failed to delete draft' });
  }
});

// Generate experience description with AI
router.post('/api/generate/experience', async (req, res) => {
  try {
    const { jobTitle, company, responsibilities, category } = req.body;
    
    if (!jobTitle || !company) {
      return res.status(400).json({ error: 'Job title and company are required' });
    }

    const description = await ai.generateExperienceDescription(
      jobTitle, 
      company, 
      responsibilities, 
      category
    );

    res.json({ 
      success: true, 
      description,
      source: ai.isEnabled() ? 'ai' : 'template'
    });
  } catch (error) {
    console.error('Error generating experience:', error);
    res.status(500).json({ error: 'Generation failed' });
  }
});

// Generate professional summary with AI
router.post('/api/generate/summary', async (req, res) => {
  try {
    const data = req.body;
    
    const summary = await ai.generateProfessionalSummary(data);

    res.json({ 
      success: true, 
      summary,
      source: ai.isEnabled() ? 'ai' : 'template'
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Generation failed' });
  }
});

// Preview CV
router.post('/preview', (req, res) => {
  const { data, template } = req.body;
  const validTemplates = ['ats-modern', 'ats-classic', 'ats-minimal'];
  const finalTemplate = validTemplates.includes(template) ? template : 'ats-modern';

  res.render(`templates/${finalTemplate}`, { 
    data: data,
    layout: false
  });
});

// Download CV as PDF
router.post('/download', async (req, res) => {
  const { data, template } = req.body;
  const validTemplates = ['ats-modern', 'ats-classic', 'ats-minimal'];
  const finalTemplate = validTemplates.includes(template) ? template : 'ats-modern';

  try {
    // Render HTML
    const html = await new Promise((resolve, reject) => {
      res.render(`templates/${finalTemplate}`, { 
        data: data,
        layout: false
      }, (err, str) => {
        if (err) reject(err);
        else resolve(str);
      });
    });

    // Use puppeteer for PDF generation
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();

    const fileName = `${data.personalInfo?.fullName?.replace(/\s+/g, '_') || 'CV'}_Resume.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdf);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    aiEnabled: ai.isEnabled()
  });
});

module.exports = router;