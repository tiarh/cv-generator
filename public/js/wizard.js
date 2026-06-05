// CV Generator - Wizard Controller
let currentStep = 1;
const totalSteps = 5;
const formData = { personalInfo: {}, experience: [], education: [], skills: [], summary: '' };

// Init
function init() {
  const savedData = document.getElementById('savedData');
  if (savedData && savedData.value) {
    try { Object.assign(formData, JSON.parse(savedData.value)); } catch(e) {}
  }
  loadStep(1);
  document.getElementById('skillsInput')?.addEventListener('input', updateSkillsPreview);
}

function loadStep(n) {
  document.querySelectorAll('.wizard-step').forEach(el => el.classList.add('hidden'));
  document.getElementById(`step-${n}`)?.classList.remove('hidden');
  
  document.querySelectorAll('.step-item [data-step]').forEach(el => {
    const stepNum = parseInt(el.closest('.step-item').dataset.step);
    const circle = el;
    if (stepNum === n) {
      circle.className = 'w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm border-2 border-blue-400';
      circle.nextElementSibling.className = 'text-blue-300 text-xs mt-1 block text-center';
    } else if (stepNum < n) {
      circle.className = 'w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold text-sm border-2 border-green-400';
      circle.innerHTML = '✓';
      circle.nextElementSibling.className = 'text-gray-500 text-xs mt-1 block text-center';
    } else {
      circle.className = 'w-10 h-10 rounded-full bg-gray-700 text-gray-400 flex items-center justify-center font-semibold text-sm border-2 border-gray-600';
      circle.innerHTML = stepNum;
      circle.nextElementSibling.className = 'text-gray-500 text-xs mt-1 block text-center';
    }
  });

  document.getElementById('prevBtn').classList.toggle('hidden', n === 1);
  document.getElementById('nextBtn').textContent = n === totalSteps ? 'Finish' : 'Next →';
  currentStep = n;
}

function nextStep() {
  if (currentStep === 1) {
    formData.personalInfo = {
      fullName: document.getElementById('fullName').value,
      jobTitle: document.getElementById('jobTitle').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      location: document.getElementById('location').value,
      linkedin: document.getElementById('linkedin').value
    };
    formData.summary = document.getElementById('summary').value;
  }
  
  if (currentStep < totalSteps) {
    loadStep(currentStep + 1);
    if (currentStep === 2 && formData.experience.length === 0) addExperience();
    if (currentStep === 3 && formData.education.length === 0) addEducation();
  }
}

function prevStep() {
  if (currentStep > 1) loadStep(currentStep - 1);
}

function addExperience() {
  const id = Date.now();
  const div = document.createElement('div');
  div.className = 'bg-gray-50 rounded-lg p-4 border border-gray-200';
  div.dataset.expId = id;
  div.innerHTML = `
    <div class="grid md:grid-cols-2 gap-4 mb-3">
      <input type="text" class="exp-job-title w-full px-3 py-2 rounded border border-gray-300 focus:border-blue-500 outline-none" placeholder="Job Title *" value="">
      <input type="text" class="exp-company w-full px-3 py-2 rounded border border-gray-300 focus:border-blue-500 outline-none" placeholder="Company *" value="">
    </div>
    <div class="grid md:grid-cols-3 gap-4 mb-3">
      <input type="month" class="exp-start w-full px-3 py-2 rounded border border-gray-300 focus:border-blue-500 outline-none">
      <input type="month" class="exp-end w-full px-3 py-2 rounded border border-gray-300 focus:border-blue-500 outline-none">
      <select class="exp-category w-full px-3 py-2 rounded border border-gray-300 focus:border-blue-500 outline-none">
        <option value="general">Role Category</option>
        <option value="tech">Technology</option>
        <option value="marketing">Marketing</option>
        <option value="sales">Sales</option>
        <option value="finance">Finance</option>
        <option value="hr">HR / People</option>
      </select>
    </div>
    <div class="relative">
      <textarea class="exp-desc w-full px-3 py-2 rounded border border-gray-300 focus:border-blue-500 outline-none resize-none" rows="3" placeholder="Describe your responsibilities and achievements..."></textarea>
      <button onclick="generateExperienceDesc(${id})" class="absolute bottom-2 right-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-1 rounded text-xs font-medium hover:shadow transition flex items-center gap-1">
        <span>✨</span> AI
      </button>
    </div>
    <button onclick="removeExperience(${id})" class="mt-2 text-red-500 text-sm hover:underline">Remove</button>
  `;
  document.getElementById('experienceList').appendChild(div);
}

function removeExperience(id) {
  document.querySelector(`[data-exp-id="${id}"]`)?.remove();
}

async function generateExperienceDesc(id) {
  const el = document.querySelector(`[data-exp-id="${id}"]`);
  const jobTitle = el.querySelector('.exp-job-title').value;
  const company = el.querySelector('.exp-company').value;
  const category = el.querySelector('.exp-category').value;
  
  if (!jobTitle || !company) { alert('Enter job title and company first'); return; }
  
  const btn = el.querySelector('button[onclick^="generateExperienceDesc"]');
  btn.disabled = true; btn.innerHTML = '⏳';
  
  try {
    const res = await fetch('/api/generate/experience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobTitle, company, category })
    });
    const data = await res.json();
    if (data.success) {
      el.querySelector('.exp-desc').value = data.description;
      btn.innerHTML = '<span>✓</span> Done';
      setTimeout(() => btn.innerHTML = '<span>✨</span> AI', 2000);
    } else { throw new Error(); }
  } catch(e) {
    btn.innerHTML = '<span>✨</span> AI';
    alert('AI generation failed. Try again.');
  }
  btn.disabled = false;
}

function addEducation() {
  const id = Date.now();
  const div = document.createElement('div');
  div.className = 'bg-gray-50 rounded-lg p-4 border border-gray-200';
  div.dataset.eduId = id;
  div.innerHTML = `
    <div class="grid md:grid-cols-2 gap-4 mb-3">
      <input type="text" class="edu-degree w-full px-3 py-2 rounded border border-gray-300 focus:border-blue-500 outline-none" placeholder="Degree (e.g. Bachelor of Science)" value="">
      <input type="text" class="edu-institution w-full px-3 py-2 rounded border border-gray-300 focus:border-blue-500 outline-none" placeholder="Institution" value="">
    </div>
    <input type="text" class="edu-year w-full px-3 py-2 rounded border border-gray-300 focus:border-blue-500 outline-none" placeholder="Year (e.g. 2018 - 2022)" value="">
    <button onclick="removeEducation(${id})" class="mt-2 text-red-500 text-sm hover:underline">Remove</button>
  `;
  document.getElementById('educationList').appendChild(div);
}

function removeEducation(id) {
  document.querySelector(`[data-edu-id="${id}"]`)?.remove();
}

function updateSkillsPreview() {
  const val = document.getElementById('skillsInput').value;
  const skills = val.split(/[,\n]+/).map(s => s.trim()).filter(s => s);
  const preview = document.getElementById('skillsPreview');
  preview.innerHTML = skills.map(s => `<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">${s}</span>`).join('');
}

async function generateSummary() {
  const fullName = document.getElementById('fullName').value;
  const jobTitle = document.getElementById('jobTitle').value;
  const btn = document.querySelector('button[onclick="generateSummary()"]');
  
  if (!fullName || !jobTitle) { alert('Enter name and job title first'); return; }
  
  btn.disabled = true; btn.innerHTML = '⏳ Generating...';
  
  try {
    const res = await fetch('/api/generate/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personalInfo: { fullName, jobTitle }, experience: [], skills: [] })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('summary').value = data.summary;
      btn.innerHTML = '<span>✓</span> Generated!';
      setTimeout(() => btn.innerHTML = '<span>✨</span> Generate AI', 2000);
    } else { throw new Error(); }
  } catch(e) {
    btn.innerHTML = '<span>✨</span> Generate AI';
    alert('Generation failed.');
  }
  btn.disabled = false;
}

function collectData() {
  const exps = [];
  document.querySelectorAll('#experienceList > div').forEach(el => {
    exps.push({
      jobTitle: el.querySelector('.exp-job-title')?.value || '',
      company: el.querySelector('.exp-company')?.value || '',
      startDate: el.querySelector('.exp-start')?.value || '',
      endDate: el.querySelector('.exp-end')?.value || '',
      category: el.querySelector('.exp-category')?.value || 'general',
      description: el.querySelector('.exp-desc')?.value || ''
    });
  });
  
  const edus = [];
  document.querySelectorAll('#educationList > div').forEach(el => {
    edus.push({
      degree: el.querySelector('.edu-degree')?.value || '',
      institution: el.querySelector('.edu-institution')?.value || '',
      year: el.querySelector('.edu-year')?.value || ''
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

async function saveDraft() {
  const data = collectData();
  const template = document.getElementById('template').value;
  const draftId = document.getElementById('draftId').value;
  
  try {
    const url = draftId ? `/api/draft/${draftId}` : '/api/draft';
    const method = draftId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, template })
    });
    const resp = await res.json();
    if (resp.success) {
      alert(`Draft ${draftId ? 'updated' : 'saved'}!`);
      if (!draftId) document.getElementById('draftId').value = resp.id;
    } else { throw new Error(); }
  } catch(e) { alert('Save failed.'); }
}

async function previewCV() {
  const data = collectData();
  const template = document.getElementById('template').value;
  
  try {
    const res = await fetch('/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, template })
    });
    const html = await res.text();
    const container = document.getElementById('previewContainer');
    const frame = document.getElementById('previewFrame');
    container.classList.remove('hidden');
    frame.srcdoc = html;
  } catch(e) { alert('Preview failed'); }
}

async function downloadCV() {
  const data = collectData();
  const template = document.getElementById('template').value;
  
  try {
    const res = await fetch('/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, template })
    });
    
    if (!res.ok) throw new Error();
    
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.personalInfo.fullName || 'CV').replace(/\s+/g, '_')}_Resume.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch(e) { alert('Download failed. Make sure all required fields are filled.'); }
}

window.addEventListener('DOMContentLoaded', init);
