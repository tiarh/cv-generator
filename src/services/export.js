/**
 * Export Service
 * PDF (existing via puppeteer), DOCX (via docx.js), JSON export
 */

const fs = require('fs');
const path = require('path');

class ExportService {
  /**
   * Export CV data as JSON
   * @param {Object} data - CV data
   * @param {string} template - Template name
   * @returns {string} JSON string
   */
  exportJSON(data, template) {
    return JSON.stringify({
      version: '1.0',
      generator: 'CVForge',
      exportedAt: new Date().toISOString(),
      template: template || 'ats-modern',
      data: data
    }, null, 2);
  }

  /**
   * Export CV as DOCX
   * Uses docx library to build a Word document
   * @param {Object} data - CV data
   * @returns {Buffer} DOCX file buffer
   */
  async exportDOCX(data) {
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = require('docx');

      const sections = [];

      // Header - Name
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: data.personalInfo?.fullName || 'Your Name',
              bold: true,
              size: 48,
              font: 'Calibri'
            })
          ],
          spacing: { after: 100 }
        })
      );

      // Title
      if (data.personalInfo?.jobTitle) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: data.personalInfo.jobTitle,
                size: 28,
                color: '2563EB',
                font: 'Calibri'
              })
            ],
            spacing: { after: 100 }
          })
        );
      }

      // Contact info
      const contactParts = [];
      if (data.personalInfo?.email) contactParts.push(data.personalInfo.email);
      if (data.personalInfo?.phone) contactParts.push(data.personalInfo.phone);
      if (data.personalInfo?.location) contactParts.push(data.personalInfo.location);
      if (data.personalInfo?.linkedin) contactParts.push(data.personalInfo.linkedin);

      if (contactParts.length > 0) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: contactParts.join(' | '),
                size: 20,
                color: '666666',
                font: 'Calibri'
              })
            ],
            spacing: { after: 200 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 6, color: '2563EB' }
            }
          })
        );
      }

      // Summary
      if (data.summary) {
        sections.push(
          new Paragraph({
            text: 'PROFESSIONAL SUMMARY',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 3, color: 'E5E7EB' }
            }
          })
        );
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: data.summary,
                size: 22,
                font: 'Calibri'
              })
            ],
            spacing: { after: 200 }
          })
        );
      }

      // Experience
      if (data.experience && data.experience.length > 0) {
        sections.push(
          new Paragraph({
            text: 'PROFESSIONAL EXPERIENCE',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 3, color: 'E5E7EB' }
            }
          })
        );

        data.experience.forEach(exp => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.jobTitle || 'Position',
                  bold: true,
                  size: 22,
                  font: 'Calibri'
                }),
                new TextRun({
                  text: exp.company ? ` — ${exp.company}` : '',
                  size: 22,
                  font: 'Calibri'
                })
              ],
              spacing: { before: 100 }
            })
          );

          if (exp.startDate || exp.endDate) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${exp.startDate || ''} — ${exp.endDate || 'Present'}`,
                    italics: true,
                    size: 20,
                    color: '6B7280',
                    font: 'Calibri'
                  })
                ],
                spacing: { after: 50 }
              })
            );
          }

          if (exp.description) {
            // Split by bullet points or newlines
            const bullets = exp.description.split(/\n/).filter(l => l.trim());
            bullets.forEach(line => {
              const cleaned = line.replace(/^[•\-\*]\s*/, '').trim();
              if (cleaned) {
                sections.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `• ${cleaned}`,
                        size: 20,
                        font: 'Calibri'
                      })
                    ],
                    spacing: { after: 40 },
                    indent: { left: 360 }
                  })
                );
              }
            });
          }
        });
      }

      // Education
      if (data.education && data.education.length > 0) {
        sections.push(
          new Paragraph({
            text: 'EDUCATION',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 3, color: 'E5E7EB' }
            }
          })
        );

        data.education.forEach(edu => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.degree || 'Degree',
                  bold: true,
                  size: 22,
                  font: 'Calibri'
                }),
                new TextRun({
                  text: edu.institution ? ` — ${edu.institution}` : '',
                  size: 22,
                  font: 'Calibri'
                })
              ],
              spacing: { before: 80 }
            })
          );

          if (edu.year) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: edu.year,
                    italics: true,
                    size: 20,
                    color: '6B7280',
                    font: 'Calibri'
                  })
                ],
                spacing: { after: 40 }
              })
            );
          }

          if (edu.description) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: edu.description,
                    size: 20,
                    font: 'Calibri'
                  })
                ],
                spacing: { after: 40 },
                indent: { left: 360 }
              })
            );
          }
        });
      }

      // Skills
      if (data.skills && data.skills.length > 0) {
        sections.push(
          new Paragraph({
            text: 'SKILLS',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 3, color: 'E5E7EB' }
            }
          })
        );
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: data.skills.join('  •  '),
                size: 20,
                font: 'Calibri'
              })
            ],
            spacing: { after: 200 }
          })
        );
      }

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720
              }
            }
          },
          children: sections
        }]
      });

      return await Packer.toBuffer(doc);
    } catch (err) {
      // If docx library not installed, throw meaningful error
      if (err.code === 'MODULE_NOT_FOUND') {
        throw new Error('DOCX export requires the "docx" package. Install with: npm install docx');
      }
      throw err;
    }
  }
}

module.exports = new ExportService();
