const fs = require('fs');

let mainJs = fs.readFileSync('main.js', 'utf8');

// Update TitleMap
const oldTitleMap = `'search': 'Case Search',
    'entry': 'Data Entry (MLEF)',`;
const newTitleMap = `'clinical': 'Clinical Registry',
    'autopsy': 'Autopsy Registry',`;
mainJs = mainJs.replace(oldTitleMap, newTitleMap);

// Append new logic at the end of the DOMContentLoaded block
const endIdx = mainJs.lastIndexOf('})');

if (endIdx !== -1) {
  const newLogic = `

  // Lightbox Logic
  window.openLightbox = function(imgSrc) {
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImage');
    if (modal && img) {
      img.src = imgSrc;
      modal.classList.remove('hidden');
      setTimeout(() => modal.classList.remove('opacity-0'), 10);
    }
  };

  const closeLightbox = document.getElementById('closeLightbox');
  if (closeLightbox) {
    closeLightbox.addEventListener('click', () => {
      const modal = document.getElementById('lightboxModal');
      modal.classList.add('opacity-0');
      setTimeout(() => modal.classList.add('hidden'), 300);
    });
  }

  // Onboarding Modal Logic
  const addPatientBtn = document.getElementById('addPatientBtn');
  const onboardingModal = document.getElementById('onboardingModal');
  const closeOnboarding = document.getElementById('closeOnboarding');

  if (addPatientBtn && onboardingModal) {
    addPatientBtn.addEventListener('click', () => {
      // Reset Modal state
      document.getElementById('obStep1').classList.remove('hidden');
      document.getElementById('obStep2').classList.add('hidden');
      document.getElementById('obStep3').classList.add('hidden');
      document.querySelectorAll('input[name="obStatus"]').forEach(r => r.checked = false);
      document.getElementById('obInwardDetails').classList.add('hidden');
      document.getElementById('obNextTo3').disabled = true;
      document.getElementById('obPreviewContainer').classList.add('hidden');
      document.getElementById('obFinish').classList.add('hidden');
      
      onboardingModal.classList.remove('hidden');
      setTimeout(() => onboardingModal.classList.remove('opacity-0'), 10);
    });
  }

  if (closeOnboarding) {
    closeOnboarding.addEventListener('click', () => {
      onboardingModal.classList.add('opacity-0');
      setTimeout(() => onboardingModal.classList.add('hidden'), 300);
    });
  }

  // Onboarding Steps Navigation
  const obBtnClinical = document.getElementById('obBtnClinical');
  const obBtnAutopsy = document.getElementById('obBtnAutopsy');
  const obBackTo1 = document.getElementById('obBackTo1');
  const obBackTo2 = document.getElementById('obBackTo2');
  const obNextTo3 = document.getElementById('obNextTo3');
  const obStatusRadios = document.querySelectorAll('input[name="obStatus"]');
  const obInwardDetails = document.getElementById('obInwardDetails');
  const obFileInput = document.getElementById('obFileInput');
  const obDropzone = document.getElementById('obDropzone');
  const obPreviewContainer = document.getElementById('obPreviewContainer');
  const obPreviewImg = document.getElementById('obPreviewImg');
  const obFinish = document.getElementById('obFinish');

  if (obBtnClinical) {
    obBtnClinical.addEventListener('click', () => {
      document.getElementById('obStep1').classList.add('hidden');
      document.getElementById('obStep2').classList.remove('hidden');
    });
  }

  if (obBtnAutopsy) {
    obBtnAutopsy.addEventListener('click', () => {
      alert('Autopsy flow is under construction.');
    });
  }

  if (obBackTo1) {
    obBackTo1.addEventListener('click', () => {
      document.getElementById('obStep2').classList.add('hidden');
      document.getElementById('obStep1').classList.remove('hidden');
    });
  }

  if (obStatusRadios.length) {
    obStatusRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        obNextTo3.disabled = false;
        if (e.target.value === 'inward') {
          obInwardDetails.classList.remove('hidden');
        } else {
          obInwardDetails.classList.add('hidden');
        }
      });
    });
  }

  if (obNextTo3) {
    obNextTo3.addEventListener('click', () => {
      document.getElementById('obStep2').classList.add('hidden');
      document.getElementById('obStep3').classList.remove('hidden');
    });
  }

  if (obBackTo2) {
    obBackTo2.addEventListener('click', () => {
      document.getElementById('obStep3').classList.add('hidden');
      document.getElementById('obStep2').classList.remove('hidden');
    });
  }

  if (obDropzone && obFileInput) {
    obDropzone.addEventListener('click', (e) => {
      if (e.target !== obFileInput) obFileInput.click();
    });

    obFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        if (file.type.startsWith('image/')) {
          const objectUrl = URL.createObjectURL(file);
          obPreviewImg.src = objectUrl;
          obPreviewContainer.classList.remove('hidden');
          obFinish.classList.remove('hidden');
        }
      }
    });
  }

  if (obFinish) {
    obFinish.addEventListener('click', () => {
      // Close modal and navigate to Clinical Registry -> MLEF Template (Mocked by just showing view-clinical)
      onboardingModal.classList.add('opacity-0');
      setTimeout(() => onboardingModal.classList.add('hidden'), 300);
      
      // Update UI to show Inward or Outpatient
      const isInward = document.querySelector('input[name="obStatus"]:checked')?.value === 'inward';
      const mlefPatientStatus = document.getElementById('mlefPatientStatus');
      if (mlefPatientStatus) {
        if (isInward) {
          mlefPatientStatus.textContent = 'Inward';
          mlefPatientStatus.className = 'ml-4 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800';
        } else {
          mlefPatientStatus.textContent = 'Outpatient';
          mlefPatientStatus.className = 'ml-4 px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800';
        }
      }

      // Trigger navigation to view-clinical
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach(l => {
        l.classList.remove('active', 'bg-navy-800', 'text-white', 'border-l-4', 'border-primary-500');
        if (l.getAttribute('data-view') === 'clinical') {
          l.classList.add('active', 'bg-navy-800', 'text-white', 'border-l-4', 'border-primary-500');
        }
      });

      document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
      });
      const clinicalView = document.getElementById('view-clinical');
      if (clinicalView) clinicalView.classList.add('active');
      
      const pageTitle = document.getElementById('pageTitle');
      if (pageTitle) pageTitle.textContent = 'Clinical Registry (MLEF Data Entry)';
    });
  }

  // Add Report / Add Referral Mock Logic
  const addReportRowBtn = document.getElementById('addReportRowBtn');
  const reportsList = document.getElementById('reportsList');
  if (addReportRowBtn && reportsList) {
    addReportRowBtn.addEventListener('click', () => {
      const newRow = document.createElement('div');
      newRow.className = 'flex items-center gap-4 p-3 border border-slate-200 rounded-lg bg-white';
      newRow.innerHTML = \`
        <div class="w-1/3">
          <select class="block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white">
            <option disabled selected>Select Type</option>
            <option>Blood Report</option>
            <option>X-Ray</option>
            <option>Toxicology</option>
          </select>
        </div>
        <div class="flex-1 flex items-center">
          <label class="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 shadow-sm flex items-center cursor-pointer text-sm font-medium border border-slate-200">
            <i data-feather="upload" class="w-4 h-4 mr-2"></i> Upload Scan
            <input type='file' class="hidden" />
          </label>
        </div>
      \`;
      reportsList.appendChild(newRow);
      if (typeof feather !== 'undefined') feather.replace();
    });
  }

  const addReferralRowBtn = document.getElementById('addReferralRowBtn');
  const referralsList = document.getElementById('referralsList');
  if (addReferralRowBtn && referralsList) {
    addReferralRowBtn.addEventListener('click', () => {
      const newRow = document.createElement('div');
      newRow.className = 'flex items-center gap-4 p-3 border border-slate-200 rounded-lg bg-white';
      newRow.innerHTML = \`
        <div class="w-1/4">
          <input type="text" placeholder="Specialization" class="block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white">
        </div>
        <div class="w-1/3">
          <input type="text" placeholder="Doctor Name" class="block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white">
        </div>
        <div class="flex-1 flex items-center">
          <label class="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 shadow-sm flex items-center cursor-pointer text-sm font-medium border border-slate-200">
            <i data-feather="upload" class="w-4 h-4 mr-2"></i> Upload Referral
            <input type='file' class="hidden" />
          </label>
        </div>
      \`;
      referralsList.appendChild(newRow);
      if (typeof feather !== 'undefined') feather.replace();
    });
  }

`;
  mainJs = mainJs.slice(0, endIdx) + newLogic + mainJs.slice(endIdx);
  fs.writeFileSync('main.js', mainJs);
  console.log('main.js updated successfully.');
} else {
  console.log('Could not find the end of DOMContentLoaded block in main.js');
}
