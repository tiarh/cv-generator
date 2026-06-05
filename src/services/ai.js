/**
 * AI Generation Service v2
 * Smarter prompts, richer variations, impact-focused language
 */

const fetch = require('node-fetch');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.model = process.env.AI_MODEL || 'google/gemma-3-27b-it';
    this.enabled = !!this.apiKey;
    this.fallbackCache = new Map();
  }

  isEnabled() { return this.enabled; }

  async generateWithAI(prompt, maxTokens = 400) {
    if (!this.enabled) return null;
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'http://localhost:8083',
          'X-Title': 'CV Generator'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You are an expert CV/resume writer. Generate 2-4 sentences of job description text. ALWAYS use: strong action verbs (Led, Spearheaded, Drove, Optimized, Delivered, Architected, Orchestrated), quantified results (%, $, numbers), and business impact. Avoid generic filler. Write in first-person implied tone (past tense for completed roles). Keep it ATS-friendly without buzzwords.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: maxTokens,
          temperature: 0.75
        })
      });
      if (response.status === 429) { console.log('AI rate limited'); return null; }
      if (!response.ok) { console.log('AI error', response.status); return null; }
      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (e) { console.log('AI error', e.message); return null; }
  }

  async generateExperienceDescription(jobTitle, company, responsibilities, category = 'general') {
    const cacheKey = `${jobTitle}-${company}-${category}`;
    if (this.fallbackCache.has(cacheKey)) return this.fallbackCache.get(cacheKey);

    const aiResult = await this.generateWithAI(
`Role: ${jobTitle} at ${company}
Category: ${category}
Responsibilities hint: ${responsibilities || 'general duties'}

Write a professional 2-4 sentence CV bullet/description. Include quantifiable results and strong action verbs.`);
    if (aiResult) { this.fallbackCache.set(cacheKey, aiResult); return aiResult; }

    const result = this.getFallbackDescription(jobTitle, company, responsibilities, category);
    this.fallbackCache.set(cacheKey, result);
    return result;
  }

  async generateProfessionalSummary(data) {
    const { personalInfo, experience = [], skills = [] } = data;
    const prompt = `Write a 3-5 sentence professional summary for a CV.

Name: ${personalInfo?.fullName || 'Candidate'}
Title: ${personalInfo?.jobTitle || 'Professional'}
Experience count: ${experience.length} positions
Top skills: ${skills.slice(0, 6).join(', ') || 'relevant skills'}

Be specific, impactful, and avoid generic phrases like "hard worker" or "team player" without proof. Mention years of experience if >0.`;

    const aiResult = await this.generateWithAI(prompt, 350);
    if (aiResult) return aiResult;
    return this.getFallbackSummary(data);
  }

  getFallbackDescription(jobTitle, company, responsibilities, category) {
    const r = responsibilities ? responsibilities.toLowerCase() : '';
    const templates = {
      tech: [
        `Architected and deployed scalable ${jobTitle} solutions at ${company}, reducing system latency by 40% and improving reliability. Led cross-functional team of 5 engineers to deliver 3 major product releases ahead of schedule.`,
        `Spearheaded migration of legacy systems to modern cloud infrastructure at ${company}, cutting operational costs by 25% as ${jobTitle}. Implemented CI/CD pipelines that accelerated deployment frequency from bi-weekly to daily.`,
        `Drove development of customer-facing APIs handling 1M+ daily requests at ${company}. Optimized database queries reducing response time by 60%, directly improving user satisfaction scores.`,
        `Led ${jobTitle} initiatives at ${company}, establishing coding standards and review processes that reduced bug escape rate by 35%. Mentored 3 junior developers who were promoted within 12 months.`
      ],
      marketing: [
        `Orchestrated multi-channel marketing campaigns at ${company} generating $2.3M in pipeline revenue as ${jobTitle}. Increased organic traffic by 180% through SEO and content strategy optimization.`,
        `Built and managed a 50,000-subscriber email program at ${company} achieving 35% open rates (industry avg 18%). Launched brand awareness campaign that grew social following from 10K to 80K in 6 months.`,
        `Developed data-driven marketing strategy at ${company} lowering customer acquisition cost by 30% as ${jobTitle}. Managed $500K quarterly ad budget delivering consistent 4.2x ROAS across platforms.`
      ],
      sales: [
        `Exceeded annual sales quota by 145% at ${company}, closing $1.8M in new business as ${jobTitle}. Built relationships with C-suite executives at Fortune 500 companies resulting in 3 enterprise contracts.`,
        `Grew territory revenue from $800K to $2.4M within 18 months at ${company} through strategic account planning. Implemented consultative selling methodology that increased win rate from 22% to 41%.`,
        `Led sales team of 7 representatives at ${company} to achieve 128% of team target as ${jobTitle}. Developed sales playbook adopted company-wide, standardizing qualification process.`
      ],
      finance: [
        `Managed $5M annual budget at ${company} as ${jobTitle}, identifying cost savings of $340K through vendor renegotiations and process optimization. Reduced monthly close cycle from 8 days to 4 days.`,
        `Built financial forecasting model improving accuracy from 72% to 94% at ${company}. Presented quarterly board reports that informed strategic decisions leading to 23% revenue growth.`,
        `Led audit preparation at ${company} achieving clean opinion for 3 consecutive years as ${jobTitle}. Implemented internal controls that reduced compliance risk exposure by 60%.`
      ],
      hr: [
        `Reduced time-to-hire from 45 days to 18 days at ${company} while improving candidate quality scores by 28% as ${jobTitle}. Implemented structured interview process adopted across 4 departments.`,
        `Designed employee development program at ${company} that increased retention rate from 74% to 91%. Led performance management system redesign that clarified expectations for 200+ employees.`,
        `Streamlined HR operations at ${company}, digitizing 15 manual processes and saving 40 admin hours weekly as ${jobTitle}. Managed HRIS migration to cloud platform with zero downtime.`
      ],
      product: [
        `Defined and executed product roadmap at ${company} launching 4 features generating $3M ARR as ${jobTitle}. Led agile team of 8 delivering on 95% of committed sprint deliverables.`,
        `Conducted 200+ customer interviews at ${company} identifying key pain points that informed MVP development as ${jobTitle}. Pivoted product direction based on data, achieving PMF in 4 months.`
      ],
      operations: [
        `Optimized supply chain at ${company} reducing fulfillment time by 45% and logistics costs by $200K annually as ${jobTitle}. Implemented lean methodologies that increased throughput by 30%.`,
        `Managed daily operations for 3 facilities with 120+ staff at ${company}, maintaining 99.7% on-time delivery rate as ${jobTitle}. Standardized SOPs that reduced safety incidents by 55%.`
      ],
      design: [
        `Redesigned core user flows at ${company} increasing conversion rate by 35% and reducing support tickets by 42% as ${jobTitle}. Led design system creation adopted by 6 product teams.`,
        `Delivered 40+ design projects at ${company} from concept to final handoff with 98% stakeholder satisfaction as ${jobTitle}. Established UX research practice conducting 50+ usability tests.`
      ],
      general: [
        `Delivered measurable results at ${company} as ${jobTitle}, consistently exceeding performance targets and earning recognition for contributions to team objectives.`,
        `Managed key operational responsibilities at ${company}, streamlining workflows and improving outcomes through proactive problem-solving and attention to detail.`,
        `Contributed to organizational success at ${company} through effective ${jobTitle} execution, collaborating across departments to deliver projects on time and within scope.`
      ]
    };

    // Add responsibility-specific if r provided
    let specific = '';
    if (r.includes('manage') || r.includes('lead')) specific = ` Managed team performance and resource allocation, resulting in improved operational output.`;
    if (r.includes('develop') || r.includes('build')) specific = ` Utilized technical expertise to develop solutions that enhanced business capabilities.`;
    if (r.includes('analy')) specific = ` Applied analytical skills to derive insights that supported strategic planning.`;

    const pool = templates[category] || templates.general;
    const idx = Math.abs(this.hashString(jobTitle + company + category)) % pool.length;
    return pool[idx] + specific;
  }

  getFallbackSummary(data) {
    const { personalInfo, experience = [], skills = [] } = data;
    const name = personalInfo?.fullName || 'Professional';
    const title = personalInfo?.jobTitle || 'Professional';
    const skillText = skills.slice(0, 5).join(', ') || 'proven competencies';

    const templates = [
      `${name} is a results-driven ${title} with ${experience.length || 'extensive'} years of progressive experience. Combines deep expertise in ${skillText} with a track record of delivering measurable outcomes. Known for translating business challenges into practical solutions that increase efficiency and revenue.`,
      `A strategic ${title} skilled in ${skillText}, with a demonstrated history of driving operational excellence and business growth. Thrives in environments requiring rapid adaptation and cross-functional collaboration. Brings analytical rigor and creative problem-solving to every initiative.`,
      `${name} brings ${experience.length || 'strong'} years of specialized experience as a ${title}, with proven ability to lead teams, manage complex projects, and deliver results under pressure. Expertise spans ${skillText}, consistently adding value through innovative approaches and attention to detail.`,
      `An accomplished ${title} with hands-on experience across ${skillText}. Track record includes leading initiatives that reduced costs, increased revenue, and improved customer satisfaction. Combines technical depth with strong communication skills to align stakeholders and drive execution.`
    ];
    const idx = Math.abs(this.hashString(name + title)) % templates.length;
    return templates[idx];
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}

module.exports = new AIService();
