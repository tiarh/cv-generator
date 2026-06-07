/**
 * Import Service
 * Parse JSON (CVForge format) and LinkedIn PDF (basic text extraction)
 */

const fs = require('fs');
const path = require('path');

class ImportService {
  /**
   * Parse JSON data into CVForge format
   * Accepts both CVForge format and JSON Resume schema
   * @param {string|Object} input - JSON string or object
   * @returns {Object} Normalized CV data
   */
  parseJSON(input) {
    let raw;
    try {
      raw = typeof input === 'string' ? JSON.parse(input) : input;
    } catch (e) {
      throw new Error('Invalid JSON format: ' + e.message);
    }

    // Check if CVForge format (has data property)
    if (raw.data && raw.data.personalInfo) {
      return this._normalizeCVForge(raw.data);
    }

    // Check if JSON Resume schema (has basics property)
    if (raw.basics) {
      return this._parseJSONResume(raw);
    }

    // Try to extract useful data from arbitrary structure
    return this._parseArbitraryJSON(raw);
  }

  /**
   * Parse text extracted from LinkedIn PDF
   * @param {string} text - Raw text from PDF
   * @returns {Object} CV data
   */
  parseLinkedInPDF(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('No text content provided for parsing');
    }

    const data = {
      personalInfo: {},
      summary: '',
      experience: [],
      education: [],
      skills: []
    };

    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    // LinkedIn PDF typically has the name as the first non-empty line
    if (lines.length > 0) {
      data.personalInfo.fullName = lines[0];
    }

    // Look for job title (usually second line or near name)
    if (lines.length > 1) {
      data.personalInfo.jobTitle = lines[1];
    }

    // Find email
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      data.personalInfo.email = emailMatch[0];
    }

    // Find phone
    const phoneMatch = text.match(/(\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4,}/);
    if (phoneMatch) {
      data.personalInfo.phone = phoneMatch[0];
    }

    // Find LinkedIn URL
    const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[\w-]+/i);
    if (linkedinMatch) {
      data.personalInfo.linkedin = linkedinMatch[0];
    }

    // Parse experience section
    const expIndex = this._findSectionIndex(lines, ['experience', 'pengalaman']);
    const eduIndex = this._findSectionIndex(lines, ['education', 'pendidikan']);
    const skillsIndex = this._findSectionIndex(lines, ['skills', 'keahlian']);

    if (expIndex >= 0) {
      const endIdx = eduIndex > expIndex ? eduIndex : (skillsIndex > expIndex ? skillsIndex : lines.length);
      const expLines = lines.slice(expIndex + 1, endIdx);
      data.experience = this._parseLinkedInExperience(expLines);
    }

    if (eduIndex >= 0) {
      const endIdx = skillsIndex > eduIndex ? skillsIndex : lines.length;
      const eduLines = lines.slice(eduIndex + 1, endIdx);
      data.education = this._parseLinkedInEducation(eduLines);
    }

    if (skillsIndex >= 0) {
      const skillLines = lines.slice(skillsIndex + 1);
      // Skills in LinkedIn PDF are often comma-separated or on individual lines
      const skillsText = skillLines.join(', ');
      data.skills = skillsText.split(/[,\n•]/).map(s => s.trim()).filter(s => s && s.length < 50).slice(0, 20);
    }

    // Try to find summary
    const summaryIndex = this._findSectionIndex(lines, ['summary', 'profil', 'about']);
    if (summaryIndex >= 0) {
      const endIdx = expIndex > summaryIndex ? expIndex : (eduIndex > summaryIndex ? eduIndex : lines.length);
      data.summary = lines.slice(summaryIndex + 1, endIdx).join(' ').trim();
    }

    return data;
  }

  /**
   * Extract text from a PDF buffer using basic text extraction
   * (Requires pdf-parse package)
   * @param {Buffer} buffer - PDF file buffer
   * @returns {string} Extracted text
   */
  async extractPDFText(buffer) {
    try {
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(buffer);
      return result.text;
    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        throw new Error('PDF import requires the "pdf-parse" package. Install with: npm install pdf-parse');
      }
      throw new Error('Failed to extract text from PDF: ' + err.message);
    }
  }

  _normalizeCVForge(data) {
    return {
      personalInfo: {
        fullName: data.personalInfo?.fullName || '',
        jobTitle: data.personalInfo?.jobTitle || '',
        email: data.personalInfo?.email || '',
        phone: data.personalInfo?.phone || '',
        location: data.personalInfo?.location || '',
        linkedin: data.personalInfo?.linkedin || ''
      },
      summary: data.summary || '',
      experience: Array.isArray(data.experience) ? data.experience.map(e => ({
        jobTitle: e.jobTitle || '',
        company: e.company || '',
        startDate: e.startDate || '',
        endDate: e.endDate || '',
        category: e.category || 'general',
        description: e.description || ''
      })) : [],
      education: Array.isArray(data.education) ? data.education.map(e => ({
        degree: e.degree || '',
        institution: e.institution || '',
        year: e.year || '',
        description: e.description || ''
      })) : [],
      skills: Array.isArray(data.skills) ? data.skills : []
    };
  }

  _parseJSONResume(resume) {
    const basics = resume.basics || {};
    return {
      personalInfo: {
        fullName: basics.name || '',
        jobTitle: basics.label || '',
        email: basics.email || '',
        phone: basics.phone || '',
        location: [basics.location?.city, basics.location?.region, basics.location?.countryCode].filter(Boolean).join(', '),
        linkedin: (basics.profiles || []).find(p => p.network?.toLowerCase() === 'linkedin')?.url || basics.website || ''
      },
      summary: basics.summary || '',
      experience: (resume.work || []).map(w => ({
        jobTitle: w.position || '',
        company: w.name || '',
        startDate: w.startDate || '',
        endDate: w.endDate || '',
        category: 'general',
        description: w.summary || w.highlights?.join('\n') || ''
      })),
      education: (resume.education || []).map(e => ({
        degree: [e.studyType, e.area].filter(Boolean).join(' in '),
        institution: e.institution || '',
        year: [e.startDate, e.endDate].filter(Boolean).join(' - '),
        description: e.courses?.join(', ') || ''
      })),
      skills: (resume.skills || []).map(s => s.name || s).flat()
    };
  }

  _parseArbitraryJSON(raw) {
    // Best-effort extraction from unknown JSON structure
    const data = {
      personalInfo: {},
      summary: '',
      experience: [],
      education: [],
      skills: []
    };

    // Try common field names
    data.personalInfo.fullName = raw.name || raw.fullName || raw.full_name || '';
    data.personalInfo.jobTitle = raw.title || raw.jobTitle || raw.job_title || raw.role || '';
    data.personalInfo.email = raw.email || '';
    data.personalInfo.phone = raw.phone || raw.telephone || '';
    data.summary = raw.summary || raw.objective || raw.profile || raw.about || '';

    // Look for arrays that might be experience/education/skills
    Object.keys(raw).forEach(key => {
      if (Array.isArray(raw[key])) {
        const lower = key.toLowerCase();
        if (lower.includes('exp') || lower.includes('work')) {
          data.experience = raw[key].map(e => ({
            jobTitle: e.position || e.title || e.jobTitle || e.role || '',
            company: e.company || e.organization || e.employer || '',
            startDate: e.startDate || e.start || e.from || '',
            endDate: e.endDate || e.end || e.to || '',
            category: 'general',
            description: e.description || e.summary || e.responsibilities || ''
          }));
        }
        if (lower.includes('edu') || lower.includes('acad')) {
          data.education = raw[key].map(e => ({
            degree: e.degree || equalification || e.studyType || '',
            institution: e.institution || e.school || e.university || '',
            year: e.year || e.graduation || [e.startDate, e.endDate].filter(Boolean).join(' - '),
            description: e.description || ''
          }));
        }
        if (lower.includes('skill')) {
          data.skills = raw[key].map(s => typeof s === 'string' ? s : s.name || s.skill || '').filter(Boolean);
        }
      }
    });

    return data;
  }

  _findSectionIndex(lines, keywords) {
    for (let i = 0; i < lines.length; i++) {
      const lower = lines[i].toLowerCase().trim();
      if (keywords.some(kw => lower === kw || lower.startsWith(kw) || lower.endsWith(kw))) {
        return i;
      }
    }
    return -1;
  }

  _parseLinkedInExperience(lines) {
    const experiences = [];
    let current = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Heuristic: lines that look like job titles (not too long, no date patterns)
      const isDateLine = /\d{4}|present|current/i.test(line) && line.length < 40;
      const isCompanyLine = !isDateLine && line.length < 60 && line.length > 2 && !line.startsWith('•');

      if (isCompanyLine && !current) {
        current = { jobTitle: line, company: '', startDate: '', endDate: '', category: 'general', description: '' };
        continue;
      }

      if (current) {
        if (isDateLine && !current.startDate) {
          const parts = line.split(/[-–—]/).map(s => s.trim());
          current.startDate = parts[0] || '';
          current.endDate = parts[1] || '';
          continue;
        }

        if (isCompanyLine && current.jobTitle && !current.company) {
          current.company = line;
          continue;
        }

        // Description line
        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
          current.description += (current.description ? '\n' : '') + line.replace(/^[•\-\*]\s*/, '').trim();
          continue;
        }

        // If we hit another potential job title, save current and start new
        if (isCompanyLine && current.jobTitle && current.company) {
          experiences.push(current);
          current = { jobTitle: line, company: '', startDate: '', endDate: '', category: 'general', description: '' };
        }
      }
    }

    if (current && current.jobTitle) {
      experiences.push(current);
    }

    return experiences;
  }

  _parseLinkedInEducation(lines) {
    const educations = [];
    let current = null;

    for (const line of lines) {
      if (line.length < 3) continue;

      if (!current) {
        current = { degree: line, institution: '', year: '', description: '' };
        continue;
      }

      if (!current.institution && line.length < 80) {
        current.institution = line;
        continue;
      }

      if (!current.year && /\d{4}/.test(line) && line.length < 30) {
        current.year = line;
        continue;
      }

      // New education entry
      if (current.degree) {
        educations.push(current);
        current = { degree: line, institution: '', year: '', description: '' };
      }
    }

    if (current && current.degree) {
      educations.push(current);
    }

    return educations;
  }
}

module.exports = new ImportService();
