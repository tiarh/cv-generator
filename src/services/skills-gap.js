/**
 * Skills Gap Analysis Service
 * Compares user skills vs job requirements, suggests courses
 */

const { v4: uuidv4 } = require('uuid');

class SkillsGapService {
  constructor() { this.db = null; }
  initialize(db) { this.db = db; }

  analyzeSkills(currentSkills, targetJob) {
    const job = (targetJob || '').toLowerCase();
    const required = this._getRequiredSkills(job);
    const current = (currentSkills || []).map(s => s.toLowerCase().trim());

    const matching = required.filter(r =>
      current.some(c => c === r || c.includes(r) || r.includes(c))
    );
    const missing = required.filter(r =>
      !current.some(c => c === r || c.includes(r) || r.includes(c))
    );
    const extra = current.filter(c =>
      !required.some(r => r === c || c.includes(r) || r.includes(c))
    );
    const toDevelop = missing.map(skill => ({
      skill,
      resources: this._getResources(skill, job),
      priority: this._getPriority(skill, job)
    }));

    const matchPercent = required.length > 0 ? Math.round((matching.length / required.length) * 100) : 0;

    return { matching, missing, extra, toDevelop, matchPercent, required };
  }

  _getRequiredSkills(job) {
    const skillSets = {
      'frontend developer': ['javascript', 'html', 'css', 'react', 'typescript', 'git', 'responsive design', 'rest api', 'webpack', 'testing'],
      'frontend engineer': ['javascript', 'html', 'css', 'react', 'typescript', 'git', 'responsive design', 'rest api', 'webpack', 'testing'],
      'backend developer': ['node.js', 'python', 'sql', 'rest api', 'git', 'docker', 'linux', 'database design', 'authentication', 'caching'],
      'backend engineer': ['node.js', 'python', 'sql', 'rest api', 'git', 'docker', 'linux', 'database design', 'authentication', 'caching'],
      'fullstack developer': ['javascript', 'react', 'node.js', 'sql', 'html', 'css', 'git', 'docker', 'rest api', 'typescript'],
      'full-stack developer': ['javascript', 'react', 'node.js', 'sql', 'html', 'css', 'git', 'docker', 'rest api', 'typescript'],
      'software engineer': ['data structures', 'algorithms', 'system design', 'git', 'testing', 'sql', 'python', 'java', 'design patterns', 'rest api'],
      'data analyst': ['sql', 'python', 'excel', 'data visualization', 'statistics', 'tableau', 'pandas', 'communication', 'critical thinking', 'power bi'],
      'data scientist': ['python', 'machine learning', 'statistics', 'sql', 'pandas', 'tensorflow', 'data visualization', 'deep learning', 'feature engineering', 'jupyter'],
      'product manager': ['user research', 'data analysis', 'roadmapping', 'agile', 'communication', 'stakeholder management', 'prioritization', 'metrics', 'wireframing', 'competitive analysis'],
      'devops engineer': ['linux', 'docker', 'kubernetes', 'ci/cd', 'aws', 'terraform', 'monitoring', 'shell scripting', 'networking', 'security'],
      'ux designer': ['user research', 'wireframing', 'prototyping', 'figma', 'usability testing', 'information architecture', 'interaction design', 'visual design', 'accessibility', 'design thinking'],
      'ui designer': ['figma', 'visual design', 'typography', 'color theory', 'responsive design', 'prototyping', 'design systems', 'accessibility', 'illustration', 'adobe creative suite'],
      'project manager': ['agile', 'scrum', 'communication', 'risk management', 'budgeting', 'stakeholder management', 'ms project', 'jira', 'leadership', 'problem solving'],
      'mobile developer': ['react native', 'swift', 'kotlin', 'mobile ui', 'rest api', 'git', 'firebase', 'push notifications', 'app store deployment', 'testing'],
      'cybersecurity analyst': ['network security', 'siem', 'incident response', 'vulnerability assessment', 'python', 'linux', 'firewalls', 'encryption', 'compliance', 'penetration testing'],
      'marketing manager': ['digital marketing', 'seo', 'content strategy', 'analytics', 'social media', 'email marketing', 'brand management', 'campaign management', 'google ads', 'copywriting'],
      'sales manager': ['crm', 'negotiation', 'pipeline management', 'communication', 'forecasting', 'coaching', 'data analysis', 'relationship building', 'presentation', 'objection handling']
    };

    // Find best match
    for (const [key, skills] of Object.entries(skillSets)) {
      if (job.includes(key) || key.includes(job)) return skills;
    }

    // Partial matches
    for (const [key, skills] of Object.entries(skillSets)) {
      const words = key.split(/[\s-]+/);
      if (words.some(w => job.includes(w) && w.length > 3)) return skills;
    }

    // Default generic skills
    return ['communication', 'problem solving', 'teamwork', 'time management', 'critical thinking', 'adaptability', 'leadership', 'technical writing', 'project management', 'data analysis'];
  }

  _getResources(skill, job) {
    const resources = {
      'javascript': [
        { title: 'JavaScript: The Good Parts', type: 'book', url: 'https://www.oreilly.com/library/view/javascript-the-good/9780596517748/' },
        { title: 'JavaScript30', type: 'course', url: 'https://javascript30.com' },
        { title: 'MDN Web Docs', type: 'docs', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' }
      ],
      'react': [
        { title: 'React Official Tutorial', type: 'course', url: 'https://react.dev/learn' },
        { title: 'Egghead React Course', type: 'course', url: 'https://egghead.io/q/react' }
      ],
      'typescript': [
        { title: 'TypeScript Handbook', type: 'docs', url: 'https://www.typescriptlang.org/docs/handbook/' },
        { title: 'Total TypeScript', type: 'course', url: 'https://totaltypescript.com' }
      ],
      'python': [
        { title: 'Python for Everybody', type: 'course', url: 'https://www.py4e.com' },
        { title: 'Automate the Boring Stuff', type: 'book', url: 'https://automatetheboringstuff.com' }
      ],
      'sql': [
        { title: 'SQLBolt', type: 'interactive', url: 'https://sqlbolt.com' },
        { title: 'Mode SQL Tutorial', type: 'course', url: 'https://mode.com/sql-tutorial' }
      ],
      'docker': [
        { title: 'Docker Getting Started', type: 'docs', url: 'https://docs.docker.com/get-started/' },
        { title: 'Docker Deep Dive', type: 'book', url: 'https://www.amazon.com/Docker-Deep-Dive-Nigel-Poulton/dp/1521822808' }
      ],
      'kubernetes': [
        { title: 'Kubernetes Basics', type: 'docs', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/' },
        { title: 'KodeKloud K8s', type: 'course', url: 'https://kodekloud.com/courses/kubernetes/' }
      ],
      'aws': [
        { title: 'AWS Free Tier', type: 'hands-on', url: 'https://aws.amazon.com/free/' },
        { title: 'A Cloud Guru', type: 'course', url: 'https://acloudguru.com' }
      ],
      'machine learning': [
        { title: 'Andrew Ng ML Course', type: 'course', url: 'https://www.coursera.org/learn/machine-learning' },
        { title: 'Fast.ai', type: 'course', url: 'https://www.fast.ai' }
      ],
      'figma': [
        { title: 'Figma Academy', type: 'course', url: 'https://www.figma.com/resources/learn-design/' },
        { title: 'Figma UI Design', type: 'course', url: 'https://www.youtube.com/watch?v=FT30RLsR0sY' }
      ],
      'agile': [
        { title: 'Scrum Guide', type: 'docs', url: 'https://scrumguides.org' },
        { title: 'Agile Crash Course', type: 'course', url: 'https://www.udemy.com/course/agile-crash-course/' }
      ],
      'git': [
        { title: 'Git Immersion', type: 'interactive', url: 'https://gitimmersion.com' },
        { title: 'Learn Git Branching', type: 'interactive', url: 'https://learngitbranching.js.org' }
      ],
      'data structures': [
        { title: 'Grokking Algorithms', type: 'book', url: 'https://www.manning.com/books/grokking-algorithms' },
        { title: 'NeetCode', type: 'practice', url: 'https://neetcode.io' }
      ],
      'algorithms': [
        { title: 'LeetCode', type: 'practice', url: 'https://leetcode.com' },
        { title: 'HackerRank', type: 'practice', url: 'https://www.hackerrank.com' }
      ],
      'system design': [
        { title: 'System Design Primer', type: 'docs', url: 'https://github.com/donnemartin/system-design-primer' },
        { title: 'Designing Data-Intensive Apps', type: 'book', url: 'https://dataintensive.net' }
      ]
    };

    const s = skill.toLowerCase();
    for (const [key, res] of Object.entries(resources)) {
      if (s === key || s.includes(key) || key.includes(s)) return res;
    }
    return [{ title: 'Search Coursera', type: 'search', url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}` }, { title: 'Search Udemy', type: 'search', url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(skill)}` }];
  }

  _getPriority(skill, job) {
    const highPriority = {
      'frontend developer': ['javascript', 'react', 'css', 'html'],
      'backend developer': ['node.js', 'python', 'sql', 'rest api'],
      'fullstack developer': ['javascript', 'react', 'node.js', 'sql'],
      'data analyst': ['sql', 'python', 'excel'],
      'data scientist': ['python', 'machine learning', 'statistics'],
      'devops engineer': ['docker', 'kubernetes', 'ci/cd', 'linux'],
      'product manager': ['user research', 'data analysis', 'agile'],
      'ux designer': ['user research', 'figma', 'wireframing'],
      'software engineer': ['data structures', 'algorithms', 'system design']
    };
    const s = skill.toLowerCase();
    for (const [key, skills] of Object.entries(highPriority)) {
      if (job.includes(key) || key.includes(job)) {
        return skills.includes(s) ? 'high' : 'medium';
      }
    }
    return 'medium';
  }

  // ── DB CRUD ──

  createAnalysis(data) {
    const id = uuidv4();
    const stmt = this.db.prepare(
      `INSERT INTO skills_gap_analyses (id, target_job, current_skills, analysis_result, created_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
    );
    stmt.run(id, data.targetJob, JSON.stringify(data.currentSkills || []), JSON.stringify(data.analysisResult || {}));
    return id;
  }

  getAnalysis(id) {
    const stmt = this.db.prepare('SELECT * FROM skills_gap_analyses WHERE id = ?');
    const row = stmt.get(id);
    if (row) {
      row.current_skills = JSON.parse(row.current_skills);
      row.analysis_result = JSON.parse(row.analysis_result);
    }
    return row;
  }

  listAnalyses(limit = 20) {
    const stmt = this.db.prepare('SELECT id, target_job, created_at FROM skills_gap_analyses ORDER BY created_at DESC LIMIT ?');
    return stmt.all(limit);
  }

  deleteAnalysis(id) {
    const stmt = this.db.prepare('DELETE FROM skills_gap_analyses WHERE id = ?');
    return stmt.run(id).changes > 0;
  }
}

module.exports = new SkillsGapService();
