/**
 * Interview Prep Service
 * Generates interview questions, suggested answers, STAR breakdowns
 * Stores prep sessions in SQLite
 */

const { v4: uuidv4 } = require('uuid');
const ai = require('./ai');

class InterviewPrepService {
  constructor() { this.db = null; }
  initialize(db) { this.db = db; }

  generateQuestionsForRole(position, company) {
    return {
      behavioral: this._behavioral(position),
      technical: this._technical(position),
      company: this._company(company),
      general: this._general()
    };
  }

  _behavioral(role) {
    const r = (role || '').toLowerCase();
    return [
      { question: 'Tell me about a time you faced a significant challenge at work. How did you handle it?', category: 'behavioral', starBreakdown: { situation: 'Describe the specific challenge or obstacle. Include context about the project, team, or business.', task: 'Explain your specific responsibility in addressing the challenge.', action: 'Detail the steps you personally took. Use strong action verbs. Focus on YOUR contributions.', result: 'Quantify the outcome. Include metrics, feedback, or lessons learned.' }, tips: 'Focus on a real example. Avoid vague answers. Quantify results.' },
      { question: 'Describe a situation where you had to work with a difficult team member or stakeholder.', category: 'behavioral', starBreakdown: { situation: 'Who was the difficult person? What was the nature of the conflict?', task: 'What did you need to accomplish despite the difficulty?', action: 'How did you communicate? What compromises did you propose?', result: 'What was the resolution? Did the relationship improve?' }, tips: 'Never badmouth the person. Show empathy and problem-solving.' },
      { question: 'Give me an example of when you showed leadership, even without a formal title.', category: 'behavioral', starBreakdown: { situation: 'What was the context where leadership was needed?', task: 'What gap did you identify? What needed to happen?', action: 'How did you step up? What initiatives did you take?', result: 'What changed because of your leadership? What was the business impact?' }, tips: 'Show initiative, influence, and impact on others.' },
      { question: 'Tell me about a time you failed or made a significant mistake.', category: 'behavioral', starBreakdown: { situation: 'What was the mistake? Be honest and specific.', task: 'What were you trying to accomplish? What went wrong?', action: 'How did you take ownership? What steps did you take to fix it?', result: 'What was the outcome? What systems did you put in place?' }, tips: 'Be genuine. Show self-awareness and growth.' },
      ...(r.includes('engineer') || r.includes('developer') ? [{ question: 'Describe a time you had to make a critical technical decision with incomplete information.', category: 'behavioral', starBreakdown: { situation: 'What was the technical challenge? What information was missing?', task: 'What decision needed to be made? What were the stakes?', action: 'How did you evaluate options? What trade-offs did you consider?', result: 'What was the outcome? How did you validate it?' }, tips: 'Show analytical thinking and risk assessment.' }] : []),
      ...(r.includes('manager') || r.includes('lead') ? [{ question: 'Tell me about a time you had to deliver difficult news to your team.', category: 'behavioral', starBreakdown: { situation: 'What was the difficult news?', task: 'What was your responsibility in communicating this?', action: 'How did you prepare? What approach did you use?', result: 'How did people react? How did it affect trust?' }, tips: 'Show empathy + transparency.' }] : [])
    ];
  }

  _technical(role) {
    const r = (role || '').toLowerCase();
    const q = [];
    if (r.includes('frontend') || r.includes('react') || r.includes('vue')) q.push(
      { question: 'How do you optimize a React/Vue app\'s performance?', category: 'technical', tips: 'Memoization, code splitting, lazy loading, profiling tools.' },
      { question: 'Explain CSS Grid vs Flexbox. When would you use each?', category: 'technical', tips: 'Grid is 2D, Flexbox is 1D layout.' },
      { question: 'How do you handle state management in large apps?', category: 'technical', tips: 'Redux, Context API, Zustand — when each is appropriate.' }
    );
    if (r.includes('backend') || r.includes('api') || r.includes('server')) q.push(
      { question: 'How do you design a RESTful API? Best practices?', category: 'technical', tips: 'HTTP methods, status codes, pagination, versioning, idempotency.' },
      { question: 'Explain database indexing. When should you add one?', category: 'technical', tips: 'B-tree, query optimization, read vs write trade-off.' },
      { question: 'How do you handle auth in microservices?', category: 'technical', tips: 'JWT, OAuth2, API gateway, service-to-service auth.' }
    );
    if (r.includes('data') || r.includes('analyst')) q.push(
      { question: 'How do you handle missing or messy data?', category: 'technical', tips: 'Imputation, dropping records, MCAR/MAR/MNAR.' },
      { question: 'Explain the bias-variance tradeoff.', category: 'technical', tips: 'Overfitting vs underfitting, cross-validation, regularization.' }
    );
    if (r.includes('product') || r.includes('pm')) q.push(
      { question: 'How do you prioritize features when everything seems important?', category: 'technical', tips: 'RICE framework, impact vs effort, user research.' },
      { question: 'Walk me through launching a new feature.', category: 'technical', tips: 'Discovery, PRD, design, engineering, QA, launch, metrics.' }
    );
    if (r.includes('design') || r.includes('ux')) q.push(
      { question: 'How do you validate design decisions?', category: 'technical', tips: 'User testing, A/B testing, analytics, accessibility audits.' },
      { question: 'Describe your design process from brief to delivery.', category: 'technical', tips: 'Research, wireframes, prototyping, testing, handoff.' }
    );
    if (q.length === 0) q.push(
      { question: 'What are the most important skills for this role?', category: 'technical', tips: 'Align with job description. Show continuous learning.' },
      { question: 'Walk me through a complex project from start to finish.', category: 'technical', tips: 'Use STAR framework. Focus on measurable outcomes.' },
      { question: 'How do you approach problem-solving with something you\'ve never seen?', category: 'technical', tips: 'Research, break down the problem, prototype, iterate.' }
    );
    return q;
  }

  _company(company) {
    if (!company) return [];
    return [
      { question: `Why do you want to work at ${company} specifically?`, category: 'company', tips: `Research ${company}'s mission, products, culture, and recent news.` },
      { question: `What do you know about ${company}'s products and market position?`, category: 'company', tips: `Demonstrate deep research. Mention competitors and ${company}'s unique value.` },
      { question: `How do you see yourself contributing to ${company}'s goals?`, category: 'company', tips: `Connect your skills to ${company}'s stated objectives.` },
      { question: `What questions do you have about working at ${company}?`, category: 'company', tips: 'Ask thoughtful questions about growth, culture, or product direction.' }
    ];
  }

  _general() {
    return [
      { question: 'Tell me about yourself.', category: 'general', tips: '2-min max. Present → Past → Future.' },
      { question: 'Where do you see yourself in 3-5 years?', category: 'general', tips: 'Align with role growth path. Focus on skills and impact.' },
      { question: 'Why are you leaving your current position?', category: 'general', tips: 'Be positive. Focus on growth and new challenges.' },
      { question: 'What is your greatest strength? Greatest weakness?', category: 'general', tips: 'Strength: relevant with evidence. Weakness: real one you\'re improving.' },
      { question: 'Why should we hire you over other candidates?', category: 'general', tips: 'Unique skills + cultural fit + proven results.' },
      { question: 'What are your salary expectations?', category: 'general', tips: 'Research rates. Give a range. Defer if possible.' }
    ];
  }

  async generateSuggestedAnswer(question, cvData) {
    if (!ai.isEnabled()) return this._fallbackAnswer(question, cvData);
    const cvSummary = this._summarizeCV(cvData);
    const prompt = `You are an expert interview coach. Generate a strong, personalized answer to this interview question based on the candidate's CV.

Question: "${question}"

CV Summary:
${cvSummary}

Write a 3-5 sentence answer that: addresses the question directly, references their CV experiences, uses quantifiable results, sounds natural, shows enthusiasm. No filler phrases.`;
    const result = await ai.generateWithAI(prompt, 500);
    return result || this._fallbackAnswer(question, cvData);
  }

  _summarizeCV(cvData) {
    if (!cvData) return 'No CV data provided.';
    const p = [];
    if (cvData.personalInfo) p.push(`Name: ${cvData.personalInfo.fullName}, Title: ${cvData.personalInfo.jobTitle}`);
    if (cvData.summary) p.push(`Summary: ${cvData.summary}`);
    if (cvData.experience?.length) p.push('Experience: ' + cvData.experience.map(e => `${e.jobTitle} at ${e.company}: ${e.description || ''}`).join('; '));
    if (cvData.skills?.length) p.push(`Skills: ${cvData.skills.join(', ')}`);
    if (cvData.education?.length) p.push('Education: ' + cvData.education.map(e => `${e.degree} in ${e.field} from ${e.institution}`).join('; '));
    return p.join('\n') || 'No CV data provided.';
  }

  _fallbackAnswer(question, cvData) {
    const name = cvData?.personalInfo?.fullName || 'the candidate';
    const title = cvData?.personalInfo?.jobTitle || 'the role';
    const skills = cvData?.skills?.slice(0, 5).join(', ') || 'relevant skills';
    const q = (question || '').toLowerCase();
    if (q.includes('tell me about yourself')) return `I'm ${name}, a ${title} with a strong track record of delivering results. My experience spans ${skills}, and I'm passionate about creating meaningful impact. I'm looking for an opportunity to continue growing while contributing to the team's success.`;
    if (q.includes('why') && q.includes('work at')) return `I'm drawn to this company because of its mission and the opportunity to apply my expertise in ${skills} to meaningful challenges. I've been following the company's growth and am excited about its direction.`;
    if (q.includes('strength')) return `My greatest strength is combining expertise in ${skills} with strong communication. I've consistently delivered results by bridging technical and business teams.`;
    if (q.includes('weakness')) return `I tend to be very detail-oriented, which can mean spending more time than necessary. I've learned to manage this with time limits and the 80/20 rule.`;
    if (q.includes('challenge') || q.includes('difficult')) return `In my role as ${title}, I faced a critical project falling behind. I broke down the work, reprioritized tasks, and coordinated with stakeholders. The project was delivered successfully.`;
    if (q.includes('leadership')) return `I've consistently stepped up to guide teams. As ${title}, I initiated knowledge-sharing sessions and mentored newer members, improving team velocity.`;
    if (q.includes('failed') || q.includes('mistake')) return `As ${title}, I underestimated a migration's complexity causing a delay. I took ownership, communicated transparently, and created an estimation template our team still uses.`;
    return `Based on my experience as ${title}, I draw on my work with ${skills}. I've consistently demonstrated the ability to learn quickly and deliver measurable results.`;
  }

  // ── DB CRUD ──

  createPrepSession(data) {
    const id = uuidv4();
    const stmt = this.db.prepare(
      `INSERT INTO interview_preps (id, company, position, cv_data, questions, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    );
    stmt.run(id, data.company, data.position, JSON.stringify(data.cvData || {}), JSON.stringify(data.questions || []));
    return id;
  }

  getPrepSession(id) {
    const stmt = this.db.prepare('SELECT * FROM interview_preps WHERE id = ?');
    const row = stmt.get(id);
    if (row) {
      row.cv_data = JSON.parse(row.cv_data);
      row.questions = JSON.parse(row.questions);
    }
    return row;
  }

  listPrepSessions(limit = 20) {
    const stmt = this.db.prepare('SELECT id, company, position, created_at, updated_at FROM interview_preps ORDER BY updated_at DESC LIMIT ?');
    return stmt.all(limit);
  }

  deletePrepSession(id) {
    const stmt = this.db.prepare('DELETE FROM interview_preps WHERE id = ?');
    return stmt.run(id).changes > 0;
  }

  updatePrepSession(id, data) {
    const fields = [];
    const values = [];
    if (data.company !== undefined) { fields.push('company = ?'); values.push(data.company); }
    if (data.position !== undefined) { fields.push('position = ?'); values.push(data.position); }
    if (data.cvData !== undefined) { fields.push('cv_data = ?'); values.push(JSON.stringify(data.cvData)); }
    if (data.questions !== undefined) { fields.push('questions = ?'); values.push(JSON.stringify(data.questions)); }
    if (fields.length === 0) return false;
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    const stmt = this.db.prepare(`UPDATE interview_preps SET ${fields.join(', ')} WHERE id = ?`);
    return stmt.run(...values).changes > 0;
  }
}

module.exports = new InterviewPrepService();
