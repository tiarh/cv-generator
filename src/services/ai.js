/**
 * AI Generation Service
 * Uses OpenRouter API with fallback to pre-written templates
 */

const fetch = require('node-fetch');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.model = process.env.AI_MODEL || 'google/gemma-3-27b-it';
    this.enabled = !!this.apiKey;
  }

  isEnabled() {
    return this.enabled;
  }

  async generateWithAI(prompt, maxTokens = 300) {
    if (!this.enabled) {
      return null;
    }

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
            {
              role: 'system',
              content: 'You are a professional CV writer. Generate concise, impactful professional descriptions. Use action verbs, quantify achievements when possible. Keep it 2-3 sentences max.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature: 0.7
        })
      });

      if (response.status === 429) {
        console.log('AI rate limited, using fallback');
        return null;
      }

      if (!response.ok) {
        const error = await response.text();
        console.log('AI API error:', response.status, error);
        return null;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (error) {
      console.log('AI service error:', error.message);
      return null;
    }
  }

  async generateExperienceDescription(jobTitle, company, responsibilities, category = 'general') {
    // Try AI first
    const aiResult = await this.generateWithAI(
      `Generate a professional work description for a CV.
      
Job Title: ${jobTitle}
Company: ${company}
Key Responsibilities: ${responsibilities || 'Various tasks and responsibilities'}

Write 2-3 impactful sentences using action verbs. Focus on achievements and impact.`
    );

    if (aiResult) return aiResult;

    // Fallback to template based on category
    return this.getFallbackDescription(jobTitle, company, responsibilities, category);
  }

  async generateProfessionalSummary(data) {
    const { personalInfo, experience = [], skills = [] } = data;

    // Try AI first
    const aiResult = await this.generateWithAI(
      `Generate a professional summary for a CV.
      
Name: ${personalInfo?.fullName || 'Professional'}
Title: ${personalInfo?.jobTitle || 'Professional'}
Experience: ${experience.length} position(s)
Skills: ${skills.slice(0, 5).join(', ') || 'Various skills'}

Write 3-4 sentences highlighting key strengths and value proposition.`
    );

    if (aiResult) return aiResult;

    // Fallback to template
    return this.getFallbackSummary(data);
  }

  getFallbackDescription(jobTitle, company, responsibilities, category) {
    const templates = {
      tech: [
        `Developed and maintained ${jobTitle} solutions at ${company}, focusing on scalable architecture and performance optimization.`,
        `Led technical initiatives at ${company} as ${jobTitle}, delivering high-quality software solutions that improved system efficiency.`,
        `Spearheaded key development projects at ${company}, implementing best practices and modern technologies as ${jobTitle}.`
      ],
      marketing: [
        `Executed marketing strategies at ${company} as ${jobTitle}, driving brand awareness and customer engagement through targeted campaigns.`,
        `Managed marketing operations at ${company}, analyzing performance metrics and optimizing campaigns for maximum ROI.`,
        `Developed and implemented marketing initiatives at ${company}, contributing to measurable growth in audience reach.`
      ],
      sales: [
        `Achieved sales targets at ${company} as ${jobTitle}, building strong client relationships and driving revenue growth.`,
        `Expanded client portfolio at ${company} through strategic ${jobTitle} activities and consultative selling approaches.`,
        `Delivered exceptional sales performance at ${company}, consistently exceeding quarterly targets through effective pipeline management.`
      ],
      finance: [
        `Managed financial operations at ${company} as ${jobTitle}, ensuring compliance and optimizing fiscal performance.`,
        `Analyzed financial data and prepared reports at ${company}, providing actionable insights for strategic decision-making.`,
        `Executed financial planning and analysis at ${company}, improving forecasting accuracy and budget management.`
      ],
      hr: [
        `Managed HR operations at ${company} as ${jobTitle}, fostering positive workplace culture and employee development.`,
        `Led recruitment and talent acquisition initiatives at ${company}, building high-performing teams.`,
        `Streamlined HR processes at ${company}, improving employee satisfaction and operational efficiency.`
      ],
      general: [
        `Demonstrated professional expertise at ${company} as ${jobTitle}, delivering consistent results and driving operational excellence.`,
        `Contributed to ${company}'s success through effective ${jobTitle} responsibilities, maintaining high performance standards.`,
        `Managed key operations at ${company} with excellence as ${jobTitle}, focusing on quality and efficiency.`
      ]
    };

    const categoryTemplates = templates[category] || templates.general;
    const index = Math.abs(this.hashString(jobTitle + company)) % categoryTemplates.length;
    let description = categoryTemplates[index];

    if (responsibilities) {
      description += ` Key achievements include ${responsibilities.toLowerCase()}.`;
    }

    return description;
  }

  getFallbackSummary(data) {
    const { personalInfo, experience = [], skills = [] } = data;
    const name = personalInfo?.fullName || 'Professional';
    const title = personalInfo?.jobTitle || 'Professional';
    const years = experience.length;

    const skillList = skills.slice(0, 4).join(', ') || 'various skills';

    const summaries = [
      `${name} is a results-driven ${title} with ${years > 0 ? years + '+ years' : 'extensive'} experience delivering impactful results. Proficient in ${skillList}, with a track record of driving growth and operational excellence.`,

      `A dedicated ${title} with proven expertise in ${skillList}. Known for strategic thinking and commitment to delivering measurable outcomes. Seeking to leverage experience to drive organizational success.`,

      `${name} brings strong ${skillList} capabilities to the ${title} role, with demonstrated success in fast-paced environments. Focused on continuous improvement and stakeholder satisfaction.`
    ];

    const index = Math.abs(this.hashString(name + title)) % summaries.length;
    return summaries[index];
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }
}

module.exports = new AIService();