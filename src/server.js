/**
 * CV Generator Server
 * Express + EJS + SQLite
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');

const cvRoutes = require('./routes/cv');

const app = express();
const PORT = process.env.PORT || 8083;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Routes
app.use('/', cvRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', {}, (err, html) => {
    if (err) return res.status(404).send('<h1>404 - Page Not Found</h1>');
    res.send(html);
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║         CV Generator Server Started               ║
╠═══════════════════════════════════════════════════╣
║  Local:    http://localhost:${PORT}                 
║  Health:   http://localhost:${PORT}/health          
║  AI Mode:  ${process.env.OPENROUTER_API_KEY ? 'Enabled ✓' : 'Template Fallback ✗'}   
╚═══════════════════════════════════════════════════╝
  `);
});

module.exports = app;