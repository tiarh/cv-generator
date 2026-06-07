/**
 * Cover Letter Service
 * AI-powered cover letter generation + PDF export
 */

const fetch = require('node-fetch');
const ai = require('./ai');

class CoverLetterService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.model = process.env.AI_MODEL || 'google/gemma-3-27b-it';
  }

  /**
   * Generate a cover letter using AI
   * @param {Object} cvData - CV data to base the letter on
   * @param {Object} params - { companyName, position, tone }
   * @returns {Object} { content, source }
   */
  async generate(cvData, params) {
    const { companyName, position, tone = 'formal' } = params;
    
    if (!companyName || !position) {
      throw new Error('Company name and position are required');
    }

    const aiResult = await this._generateWithAI(cvData, params);
    if (aiResult) {
      return { content: aiResult, source: 'ai' };
    }

    return { content: this._generateFallback(cvData, params), source: 'template' };
  }

  async _generateWithAI(cvData, params) {
    if (!this.apiKey) return null;

    const { companyName, position, tone } = params;
    const name = cvData.personalInfo?.fullName || 'Candidate';
    const title = cvData.personalInfo?.jobTitle || 'Professional';
    const skills = (cvData.skills || []).slice(0, 8).join(', ') || 'relevant skills';
    const experience = (cvData.experience || []).slice(0, 2).map(e => `${e.jobTitle} at ${e.company}`).join('; ') || 'relevant experience';
    const summary = cvData.summary || '';

    const toneInstructions = {
      formal: 'Write in a formal, professional tone. Use traditional business letter conventions.',
      friendly: 'Write in a warm, approachable tone. Show personality while staying professional.',
      creative: 'Write in a creative, engaging tone. Use vivid language and a compelling narrative hook.'
    };

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'http://localhost:8083',
          'X-Title': 'CV Generator - Cover Letter'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are an expert cover letter writer. ${toneInstructions[tone] || toneInstructions.formal} Generate a compelling, tailored cover letter. Keep it to 3-4 paragraphs. Do NOT use placeholders — fill in real-sounding content based on the provided context. Start with a strong hook, connect experience to the role, and end with a confident call to action.`
            },
            {
              role: 'user',
              content: `Generate a cover letter for:
Candidate: ${name}
Current Title: ${title}
Target Position: ${position} at ${companyName}
Key Skills: ${skills}
Experience Highlights: ${experience}
Professional Summary: ${summary}
Tone: ${tone}

Write the complete cover letter body (no date/header/footer — just the letter content).`
            }
          ],
          max_tokens: 600,
          temperature: 0.8
        })
      });

      if (response.status === 429) { console.log('Cover letter AI rate limited'); return null; }
      if (!response.ok) { console.log('Cover letter AI error', response.status); return null; }
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (e) {
      console.log('Cover letter AI error', e.message);
      return null;
    }
  }

  _generateFallback(cvData, params) {
    const { companyName, position, tone } = params;
    const name = cvData.personalInfo?.fullName || 'Candidate';
    const title = cvData.personalInfo?.jobTitle || 'Professional';
    const skills = (cvData.skills || []).slice(0, 5).join(', ') || 'relevant skills';
    const expCount = (cvData.experience || []).length;

    if (tone === 'creative') {
      return `I've been following ${companyName}'s trajectory for some time, and when I saw the ${position} role, I knew I had to reach out. What you're building resonates deeply with the kind of work that gets me out of bed in the morning.

As a ${title} with ${expCount > 0 ? expCount + ' years of' : ''} hands-on experience across ${skills}, I've developed a knack for turning complex challenges into elegant solutions. My background has taught me to think creatively while delivering concrete results — exactly the combination that drives innovation at companies like yours.

I would welcome the chance to discuss how my perspective and expertise could contribute to ${companyName}'s next chapter. Let's connect and explore the possibilities.`;
    }

    if (tone === 'friendly') {
      return `I was excited to come across the ${position} opening at ${companyName} — it feels like a natural fit for where I am in my career, and I'd love to tell you why.

With a background as a ${title} and experience in ${skills}, I've built a track record of delivering meaningful results while genuinely enjoying the work. I bring both technical depth and a collaborative spirit to every project, and I'm drawn to ${companyName}'s approach to ${position}-related challenges.

I'd really enjoy the opportunity to chat about how I can contribute to your team. Looking forward to connecting!`;
    }

    // Formal (default)
    return `I am writing to express my strong interest in the ${position} position at ${companyName}. With my background as a ${title} and demonstrated expertise in ${skills}, I am confident in my ability to make a meaningful contribution to your organization.

Throughout my career, I have consistently delivered results by leveraging my skills in ${skills} to solve complex challenges and drive organizational objectives. My experience has equipped me with both the technical proficiency and strategic perspective required to excel in this role.

I would welcome the opportunity to discuss how my qualifications align with ${companyName}'s goals for this position. I am available at your convenience and look forward to your response.

Thank you for considering my application.`;
  }

  /**
   * Render cover letter as HTML for PDF generation
   * @param {Object} cvData - CV data
   * @param {Object} params - { companyName, position, tone }
   * @param {string} content - Generated letter content
   * @returns {string} HTML string
   */
  renderHTML(cvData, params, content) {
    const { companyName, position, tone } = params;
    const name = cvData.personalInfo?.fullName || 'Candidate';
    const email = cvData.personalInfo?.email || '';
    const phone = cvData.personalInfo?.phone || '';
    const location = cvData.personalInfo?.location || '';

    const toneColors = {
      formal: { primary: '#1a1a1a', accent: '#333' },
      friendly: { primary: '#2563eb', accent: '#3b82f6' },
      creative: { primary: '#7c3aed', accent: '#8b5cf6' }
    };
    const colors = toneColors[tone] || toneColors.formal;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cover Letter - ${name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', 'Times New Roman', serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; background: white; }
    .container { max-width: 700px; margin: 0 auto; padding: 48px; }
    .header { margin-bottom: 32px; }
    .sender-name { font-size: 16pt; font-weight: bold; color: ${colors.primary}; }
    .sender-info { font-size: 10pt; color: #555; margin-top: 4px; }
    .sender-info span:not(:last-child)::after { content: " · "; }
    .date { font-size: 10pt; color: #666; margin-top: 20px; }
    .recipient { margin-top: 16px; font-size: 10.5pt; color: #333; line-height: 1.5; }
    .salutation { margin-top: 24px; font-size: 11pt; }
    .body { margin-top: 16px; font-size: 11pt; line-height: 1.65; }
    .body p { margin-bottom: 14px; text-align: justify; }
    .closing { margin-top: 24px; }
    .sign-name { margin-top: 36px; font-weight: bold; color: ${colors.primary}; }
    .ps { margin-top: 16px; font-size: 10pt; color: #666; font-style: italic; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="sender-name">${name}</div>
      <div class="sender-info">
        ${email ? `<span>${email}</span>` : ''}
        ${phone ? `<span>${phone}</span>` : ''}
        ${location ? `<span>${location}</span>` : ''}
      </div>
      <div class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div class="recipient">
        Hiring Manager<br>
        ${companyName}<br>
        Re: ${position}
      </div>
    </div>
    <div class="salutation">Dear Hiring Manager,</div>
    <div class="body">
      ${content.split('\n').filter(p => p.trim()).map(p => `<p>${p.trim()}</p>`).join('\n')}
    </div>
    <div class="closing">
      <p>Sincerely,</p>
      <div class="sign-name">${name}</div>
    </div>
  </div>
</body>
</html>`;
  }
}

module.exports = new CoverLetterService();
