// CV Generator Wizard v2
let currentStep = 1;
const totalSteps = 5;
let hasChanges = false;
let autoSaveTimer = null;

function showToast(message, type = 'success') {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    loading: 'bg-gray-700'
  };
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium animate__animated animate__fadeInRight`;
  toast.innerHTML = `<span>${type === 'loading' ? '⏳' : type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('animate__fadeInRight');
    toast.classList.add('animate__fadeOutRight');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function markChanged() {
  hasChanges = true;
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => { if (hasChanges) autoSaveDraft(); }, 2000);
}

async function autoSaveDraft() {
  if (!hasChanges) return;
  try {
    const data = collectData();
    const template = document.getElementById('template')?.value || 'ats-modern';
    const draftId = document.getElementById('draftId')?.value;
    if (!data.personalInfo?.fullName) return;
    const url = draftId ? `/api/draft/${draftId}` : '/api/draft';
    const method = draftId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data, template }) });
    const resp = await res.json();
    if (resp.success) {
      if (!draftId) document.getElementById('draftId').value = resp.id;
      hasChanges = false;
      const el = document.getElementById('autoSaveIndicator');
      if (el) { el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2000); }
    }
  } catch (e) {}
}

function init() {
  const raw = document.getElementById('savedData');
  let saved = {};
  if (raw && raw.value) try { saved = JSON.parse(raw.value); } catch(e) {}
  if (saved.personalInfo) {
    const p = saved.personalInfo;
    if (p.fullName) document.getElementById('fullName').value = p.fullName;
    if (p.jobTitle) document.getElementById('jobTitle').value = p.jobTitle;
    if (p.email) document.getElementById('email').value = p.email;
    if (p.phone) document.getElementById('phone').value = p.phone;
    if (p.location) document.getElementById('location').value = p.location;
    if (p.linkedin) document.getElementById('linkedin').value = p.linkedin;
  }
  if (saved.summary) document.getElementById('summary').value = saved.summary;
  if (saved.skills && Array.isArray(saved.skills)) {
    document.getElementById('skillsInput').value = saved.skills.join(', ');
    updateSkillsPreview();
  }
  if (saved.experience && saved.experience.length > 0) {
    saved.experience.forEach(exp => {
      addExperience(exp.jobTitle, exp.company, exp.startDate, exp.endDate, exp.category, exp.description);
    });
  } else addExperience();
  if (saved.education && saved.education.length > 0) {
    saved.education.forEach(edu => addEducation(edu.degree, edu.institution, edu.year, edu.description));
  } else addEducation();
  loadStep(1);
  document.getElementById('skillsInput').addEventListener('input', updateSkillsPreview);
  // Init skills if present
  updateSkillsPreview();
}

function collectData() {
  const exps = [];
  document.querySelectorAll('#experienceList > div[data-item]').forEach(el => {
    const jt = el.querySelector('[data-field="jobTitle"]')?.value || '';
    if (!jt) return;
    exps.push({
      jobTitle: jt,
      company: el.querySelector('[data-field="company"]')?.value || '',
      startDate: el.querySelector('[data-field="start"]')?.value || '',
      endDate: el.querySelector('[data-field="end"]')?.value || '',
      category: el.querySelector('[data-field="category"]')?.value || 'general',
      description: el.querySelector('[data-field="desc"]')?.value || ''
    });
  });
  const edus = [];
  document.querySelectorAll('#educationList > div[data-item]').forEach(el => {
    const deg = el.querySelector('[data-field="degree"]')?.value || '';
    if (!deg) return;
    edus.push({
      degree: deg,
      institution: el.querySelector('[data-field="institution"]')?.value || '',
      year: el.querySelector('[data-field="year"]')?.value || '',
      description: el.querySelector('[data-field="desc"]')?.value || ''
    });
  });
  const skills = document.getElementById('skillsInput').value.split(/[,\n]+/).map(s => s.trim()).filter(s => s);
  return {
    personalInfo: {
      fullName: document.getElementById('fullName').value,
      jobTitle: document.getElementById('jobTitle').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      location: document.getElementById('location').value,
      linkedin: document.getElementById('linkedin').value
    },
    summary: document.getElementById('summary').value,
    experience: exps,
    education: edus,
    skills: skills
  };
}

function loadStep(n) {
  document.querySelectorAll('.wizard-step').forEach(el => el.classList.add('hidden'));
  const target = document.getElementById(`step-${n}`);
  if (target) { target.classList.remove('hidden'); target.classList.add('animate__fadeInUp'); }
  
  document.querySelectorAll('.step-item').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.remove('active', 'completed');
    const circle = el.querySelector('.step-circle');
    if (s === n) { el.classList.add('active'); circle.innerHTML = s; }
    else if (s < n) { el.classList.add('completed'); circle.innerHTML = '✓'; }
    else { circle.innerHTML = s; }
  });
  
  const lines = document.querySelectorAll('.line-connector');
  lines.forEach((line, i) => {
    line.className = `w-3 md:w-8 h-0.5 ${i < n - 1 ? 'bg-green-500' : 'bg-gray-600'} line-connector transition-colors`;
  });

  document.getElementById('prevBtn').classList.toggle('hidden', n === 1);
  const nextBtn = document.getElementById('nextBtn');
  if (n === totalSteps) {
    nextBtn.innerHTML = 'Finish 🎉';
    nextBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    nextBtn.classList.add('bg-green-600', 'hover:bg-green-700');
  } else {
    nextBtn.innerHTML = `Next <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`;
    nextBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
    nextBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
  }
  
  const pct = Math.round((n / totalSteps) * 100);
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressPercent').textContent = pct + '%';
  document.getElementById('progressText').textContent = `Step ${n} of ${totalSteps}`;
  currentStep = n;
}

function validateStep(n) {
  if (n === 1) {
    const name = document.getElementById('fullName').value.trim();
    const title = document.getElementById('jobTitle').value.trim();
    const email = document.getElementById('email').value.trim();
    if (!name) { showToast('Please enter your full name', 'error'); return false; }
    if (!title) { showToast('Please enter your job title', 'error'); return false; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Please enter a valid email', 'error'); return false; }
  }
  return true;
}

function nextStep() {
  if (!validateStep(currentStep)) return;
  if (currentStep < totalSteps) {
    loadStep(currentStep + 1);
    if (currentStep === 2 && document.querySelectorAll('#experienceList > div[data-item]').length === 0) addExperience();
    if (currentStep === 3 && document.querySelectorAll('#educationList > div[data-item]').length === 0) addEducation();
    autoSaveDraft();
  }
}

function prevStep() {
  if (currentStep > 1) loadStep(currentStep - 1);
}

function addExperience(jobTitle = '', company = '', start = '', end = '', category = 'general', desc = '') {
  const id = Date.now() + Math.random();
  const div = document.createElement('div');
  div.className = 'bg-gray-50 rounded-xl p-5 border border-gray-200';
  div.dataset.item = id;
  div.innerHTML = `
    <div class="flex justify-between items-start mb-4">
      <div class="flex items-center gap-2 text-blue-600 font-semibold text-sm"><span class="w-2 h-2 bg-blue-500 rounded-full"></span>New Position</div>
      <button onclick="removeItem('experience', '${id}')" class="text-red-400 hover:text-red-600 p-1 transition" title="Remove"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
    </div>
    <div class="grid md:grid-cols-2 gap-4 mb-4">
      <div>
        <label class="text-xs font-semibold text-gray-600 mb-1 block">Job Title *</label>
        <input type="text" data-field="jobTitle" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm" placeholder="Software Engineer" value="${jobTitle}" required oninput="markChanged()">
      </div>
      <div>
        <label class="text-xs font-semibold text-gray-600 mb-1 block">Company *</label>
        <input type="text" data-field="company" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm" placeholder="Acme Corp" value="${company}" required oninput="markChanged()">
      </div>
    </div>
    <div class="grid md:grid-cols-3 gap-4 mb-4">
      <div>
        <label class="text-xs font-semibold text-gray-600 mb-1 block">Start Date</label>
        <input type="month" data-field="start" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm" value="${start}" oninput="markChanged()">
      </div>
      <div>
        <label class="text-xs font-semibold text-gray-600 mb-1 block">End Date</label>
        <div class="flex items-center gap-2">
          <input type="month" data-field="end" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm" value="${end}" oninput="markChanged()">
        </div>
        <label class="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
          <input type="checkbox" data-present class="w-3.5 h-3.5 text-blue-600 rounded" onchange="togglePresent(this)"> Current position
        </label>
      </div>
      <div>
        <label class="text-xs font-semibold text-gray-600 mb-1 block">Category</label>
        <select data-field="category" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-white">
          <option value="general" ${category === 'general' ? 'selected' : ''}>General</option>
          <option value="tech" ${category === 'tech' ? 'selected' : ''}>👨‍💻 Technology</option>
          <option value="marketing" ${category === 'marketing' ? 'selected' : ''}>📈 Marketing</option>
          <option value="sales" ${category === 'sales' ? 'selected' : ''}>💰 Sales</option>
          <option value="finance" ${category === 'finance' ? 'selected' : ''}>💵 Finance</option>
          <option value="hr" ${category === 'hr' ? 'selected' : ''}>👥 HR / People</option>
          <option value="product" ${category === 'product' ? 'selected' : ''}>📱 Product</option>
          <option value="operations" ${category === 'operations' ? 'selected' : ''}>⚙️ Operations</option>
          <option value="design" ${category === 'design' ? 'selected' : ''}>🎨 Design</option>
        </select>
      </div>
    </div>
    <div class="relative">
      <label class="text-xs font-semibold text-gray-600 mb-1 block">Job Description</label>
      <textarea data-field="desc" rows="3" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none text-sm" placeholder="Describe your key responsibilities and achievements..." oninput="markChanged()">${desc}</textarea>
      <button onclick="generateExpDesc('${id}')" class="absolute bottom-2 right-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium hover:shadow-lg transition flex items-center gap-1" id="btn-ai-${id}">
        <span>✨</span> AI
      </button>
    </div>
  `;
  document.getElementById('experienceList').appendChild(div);
}

function togglePresent(checkbox) {
  const endInput = checkbox.closest('div').previousElementSibling?.querySelector('[data-field="end"]');
  if (endInput) {
    if (checkbox.checked) { endInput.value = ''; endInput.disabled = true; }
    else { endInput.disabled = false; }
  }
}

function addEducation(degree = '', institution = '', year = '', desc = '') {
  const id = Date.now() + Math.random();
  const div = document.createElement('div');
  div.className = 'bg-gray-50 rounded-xl p-5 border border-gray-200';
  div.dataset.item = id;
  div.innerHTML = `
    <div class="flex justify-between items-start mb-4">
      <div class="flex items-center gap-2 text-indigo-600 font-semibold text-sm"><span class="w-2 h-2 bg-indigo-500 rounded-full"></span>Education</div>
      <button onclick="removeItem('education', '${id}')" class="text-red-400 hover:text-red-600 p-1 transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
    </div>
    <div class="grid md:grid-cols-2 gap-4 mb-3">
      <div>
        <label class="text-xs font-semibold text-gray-600 mb-1 block">Degree</label>
        <input type="text" data-field="degree" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm" placeholder="Bachelor of Science" value="${degree}" oninput="markChanged()">
      </div>
      <div>
        <label class="text-xs font-semibold text-gray-600 mb-1 block">Institution</label>
        <input type="text" data-field="institution" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm" placeholder="University Name" value="${institution}" oninput="markChanged()">
      </div>
    </div>
    <div class="mb-3">
      <label class="text-xs font-semibold text-gray-600 mb-1 block">Year</label>
      <input type="text" data-field="year" class="w-full md:w-1/2 px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm" placeholder="2020 - 2024" value="${year}" oninput="markChanged()">
    </div>
    <div>
      <label class="text-xs font-semibold text-gray-600 mb-1 block">Description (optional)</label>
      <textarea data-field="desc" rows="2" class="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none text-sm" placeholder="GPA, honors, relevant coursework..." oninput="markChanged()">${desc}</textarea>
    </div>
  `;
  document.getElementById('educationList').appendChild(div);
}

function removeItem(type, id) {
  const el = document.querySelector(`#${type}List > div[data-item="${id}"]`);
  if (el) { el.style.opacity = '0'; setTimeout(() => el.remove(), 200); }
}

function addSkill(name) {
  const input = document.getElementById('skillsInput');
  const current = input.value.split(',').map(s => s.trim()).filter(s => s);
  if (!current.includes(name)) {
    input.value = current.length > 0 ? current.join(', ') + ', ' + name : name;
    updateSkillsPreview();
    markChanged();
  }
}

function updateSkillsPreview() {
  const val = document.getElementById('skillsInput').value;
  const skills = val.split(/[,\n]+/).map(s => s.trim()).filter(s => s);
  const preview = document.getElementById('skillsPreview');
  preview.innerHTML = skills.map(s => `<span class="skill-chip bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-sm font-medium">${s}</span>`).join('');
}

async function generateExpDesc(id) {
  const el = document.querySelector(`div[data-item="${id}"]`);
  const title = el.querySelector('[data-field="jobTitle"]').value;
  const company = el.querySelector('[data-field="company"]').value;
  const cat = el.querySelector('[data-field="category"]').value;
  if (!title || !company) { showToast('Fill in job title & company first', 'error'); return; }
  const btn = document.getElementById(`btn-ai-${id}`);
  btn.classList.add('btn-loading'); btn.disabled = true;
  try {
    const res = await fetch('/api/generate/experience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobTitle: title, company, category: cat })
    });
    const data = await res.json();
    if (data.success) {
      el.querySelector('[data-field="desc"]').value = data.description;
      showToast('AI generated professional description!', 'success');
      markChanged();
    } else { throw new Error(data.error || 'Failed'); }
  } catch(e) { showToast('AI generation failed: ' + e.message, 'error'); }
  btn.classList.remove('btn-loading'); btn.disabled = false;
}

async function generateSummary() {
  const name = document.getElementById('fullName').value;
  const title = document.getElementById('jobTitle').value;
  const btn = document.getElementById('summaryBtn');
  if (!title) { showToast('Enter job title first', 'error'); return; }
  btn.classList.add('btn-loading'); btn.disabled = true;
  try {
    const skills = document.getElementById('skillsInput').value.split(/[,\n]+/).map(s => s.trim()).filter(s => s);
    const res = await fetch('/api/generate/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalInfo: { fullName: name, jobTitle: title },
        experience: [],
        skills
      })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('summary').value = data.summary;
      showToast('Professional summary generated!', 'success');
      markChanged();
    } else { throw new Error(data.error || 'Failed'); }
  } catch(e) { showToast('Generation failed: ' + e.message, 'error'); }
  btn.classList.remove('btn-loading'); btn.disabled = false;
}

async function saveDraftManual() {
  const btn = document.getElementById('saveBtn');
  btn.classList.add('btn-loading'); btn.disabled = true;
  try {
    await autoSaveDraft();
    showToast('Draft saved successfully!', 'success');
  } catch(e) { showToast('Save failed', 'error'); }
  btn.classList.remove('btn-loading'); btn.disabled = false;
}

async function previewCV() {
  const btn = document.getElementById('previewBtn');
  btn.classList.add('btn-loading');
  try {
    const data = collectData();
    const template = document.getElementById('template').value;
    const res = await fetch('/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data, template }) });
    if (!res.ok) throw new Error();
    const html = await res.text();
    document.getElementById('previewContainer').classList.remove('hidden');
    document.getElementById('previewFrame').srcdoc = html;
    document.getElementById('previewContainer').scrollIntoView({ behavior: 'smooth' });
  } catch(e) { showToast('Preview failed', 'error'); }
  btn.classList.remove('btn-loading');
}

async function downloadCV() {
  const btn = document.getElementById('downloadBtn');
  btn.classList.add('btn-loading');
  try {
    const data = collectData();
    const template = document.getElementById('template').value;
    if (!data.personalInfo.fullName || !data.personalInfo.jobTitle) { showToast('Fill in name and job title first', 'error'); throw new Error(); }
    const res = await fetch('/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data, template }) });
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${(data.personalInfo.fullName).replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('CV downloaded!', 'success');
  } catch(e) { showToast('Download failed', 'error'); }
  btn.classList.remove('btn-loading');
}

window.addEventListener('DOMContentLoaded', init);
