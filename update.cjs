const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Inject modals after loginOverlay
const modalHtml = `
    <!-- Lightbox Modal -->
    <div id="lightboxModal" class="fixed inset-0 z-[60] hidden flex items-center justify-center bg-navy-900 bg-opacity-95 backdrop-blur-sm transition-opacity duration-300">
      <button id="closeLightbox" class="absolute top-6 right-6 text-white hover:text-red-400">
        <i data-feather="x" class="w-8 h-8"></i>
      </button>
      <img id="lightboxImage" src="" class="max-h-[90vh] max-w-[90vw] object-contain rounded shadow-2xl" />
    </div>

    <!-- Onboarding Modal -->
    <div id="onboardingModal" class="fixed inset-0 z-[60] hidden flex items-center justify-center bg-navy-900 bg-opacity-90 backdrop-blur-sm transition-opacity duration-300">
      <div class="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h2 class="text-xl font-bold text-navy-900">Add Patient</h2>
          <button id="closeOnboarding" class="text-slate-400 hover:text-red-500 transition-colors">
            <i data-feather="x" class="w-6 h-6"></i>
          </button>
        </div>
        <div class="p-8">
          <!-- Step 1: Type -->
          <div id="obStep1" class="space-y-6">
            <h3 class="text-lg font-medium text-slate-800 text-center mb-6">Select Registry Type</h3>
            <div class="grid grid-cols-2 gap-4">
              <button id="obBtnClinical" class="flex flex-col items-center justify-center p-6 border-2 border-slate-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all">
                <i data-feather="activity" class="w-10 h-10 text-primary-500 mb-3"></i>
                <span class="font-semibold text-navy-900">Clinical</span>
              </button>
              <button id="obBtnAutopsy" class="flex flex-col items-center justify-center p-6 border-2 border-slate-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all">
                <i data-feather="user-x" class="w-10 h-10 text-amber-500 mb-3"></i>
                <span class="font-semibold text-navy-900">Autopsy</span>
              </button>
            </div>
          </div>

          <!-- Step 2: Clinical Status -->
          <div id="obStep2" class="hidden space-y-6">
            <button id="obBackTo1" class="text-sm text-slate-500 hover:text-primary-600 mb-2 flex items-center"><i data-feather="arrow-left" class="w-4 h-4 mr-1"></i> Back</button>
            <h3 class="text-lg font-medium text-slate-800">Clinical Status</h3>
            <div class="space-y-4">
              <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input type="radio" name="obStatus" value="inward" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300">
                <span class="ml-3 font-medium text-slate-800">Inward</span>
              </label>
              <div id="obInwardDetails" class="hidden pl-8 pr-4 space-y-4">
                 <div>
                   <label class="block text-sm font-medium text-slate-700">Hospital Registration / Bed No.</label>
                   <input type="text" id="obHospitalRegNo" class="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                 </div>
              </div>
              <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                <input type="radio" name="obStatus" value="outpatient" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300">
                <span class="ml-3 font-medium text-slate-800">Outpatient</span>
              </label>
            </div>
            <div class="mt-6 flex justify-end">
              <button id="obNextTo3" class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 shadow-sm disabled:opacity-50" disabled>Next</button>
            </div>
          </div>

          <!-- Step 3: Upload MLEF -->
          <div id="obStep3" class="hidden space-y-6">
            <button id="obBackTo2" class="text-sm text-slate-500 hover:text-primary-600 mb-2 flex items-center"><i data-feather="arrow-left" class="w-4 h-4 mr-1"></i> Back</button>
            <h3 class="text-lg font-medium text-slate-800">Upload Initial MLEF Form</h3>
            <div class="border-2 border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group" id="obDropzone">
              <i data-feather="upload-cloud" class="h-10 w-10 text-slate-400 group-hover:text-primary-500 transition-colors mb-2"></i>
              <p class="text-sm font-medium text-slate-700">Click to browse or drag and drop</p>
              <input type="file" id="obFileInput" class="hidden" accept="image/*">
            </div>
            <div id="obPreviewContainer" class="hidden mt-4 text-center">
              <img id="obPreviewImg" src="" class="max-h-48 mx-auto rounded shadow-sm border border-slate-200">
              <p class="text-xs text-slate-500 mt-2">Form parsed successfully.</p>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
              <button id="obFinish" class="hidden px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 shadow-sm flex items-center">
                <i data-feather="check" class="w-4 h-4 mr-2"></i> Confirm & Proceed
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
`;
html = html.replace('<!-- Main Application UI', modalHtml + '\n    <!-- Main Application UI');

// 2. Replace sidebar links
const oldSidebar = `<a href="#" data-view="search" class="nav-link group flex items-center px-3 py-2.5 text-sm font-medium rounded-md hover:bg-navy-800 hover:text-white transition-colors">
            <i data-feather="search" class="text-navy-400 group-hover:text-primary-400 mr-3 flex-shrink-0 h-5 w-5"></i>
            Case Search
          </a>
          <a href="#" data-view="entry" class="nav-link group flex items-center px-3 py-2.5 text-sm font-medium rounded-md hover:bg-navy-800 hover:text-white transition-colors">
            <i data-feather="file-text" class="text-navy-400 group-hover:text-primary-400 mr-3 flex-shrink-0 h-5 w-5"></i>
            Data Entry (MLEF)
          </a>`;
const newSidebar = `<a href="#" data-view="clinical" class="nav-link group flex items-center px-3 py-2.5 text-sm font-medium rounded-md hover:bg-navy-800 hover:text-white transition-colors">
            <i data-feather="activity" class="text-navy-400 group-hover:text-primary-400 mr-3 flex-shrink-0 h-5 w-5"></i>
            Clinical Registry
          </a>
          <a href="#" data-view="autopsy" class="nav-link group flex items-center px-3 py-2.5 text-sm font-medium rounded-md hover:bg-navy-800 hover:text-white transition-colors">
            <i data-feather="user-x" class="text-navy-400 group-hover:text-primary-400 mr-3 flex-shrink-0 h-5 w-5"></i>
            Autopsy Registry
          </a>`;
html = html.replace(oldSidebar, newSidebar);

// 3. Add Patient Button on dashboard header
const oldHeader = `<button class="text-slate-400 hover:text-slate-500 relative">`;
const newHeader = `<button id="addPatientBtn" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition-colors">
              <i data-feather="plus" class="mr-2 h-4 w-4"></i>
              Add Patient
            </button>
            <button class="text-slate-400 hover:text-slate-500 relative">`;
html = html.replace(oldHeader, newHeader);

// 4. Replace view-entry section
const lines = html.split('\\n');
const startIdx = lines.findIndex(l => l.includes('<!-- 3. DATA ENTRY VIEW (MLEF FORM) -->'));
const endIdx = lines.findIndex(l => l.includes('<!-- 4. Form SCANNING VIEW -->'));

if (startIdx !== -1 && endIdx !== -1) {
  const newClinicalView = `          <!-- 3. CLINICAL MLEF TEMPLATE VIEW -->
          <section id="view-clinical" class="view-section">
            <div class="bg-white shadow-sm rounded-lg border border-slate-200 p-8 max-w-5xl mx-auto space-y-8">
              
              <!-- Top Section: Patient Attributes -->
              <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-6 gap-4">
                <div>
                  <h2 class="text-2xl font-bold text-navy-900 flex items-center">
                    MLEF-4829
                    <span class="ml-4 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800" id="mlefPatientStatus">Inward</span>
                  </h2>
                  <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div><span class="text-slate-500">Patient Name:</span> <span class="font-medium text-slate-800">Saman Kumara</span></div>
                    <div><span class="text-slate-500">Patient ID:</span> <span class="font-medium text-slate-800">851234567V</span></div>
                    <div><span class="text-slate-500">Contact No:</span> <span class="font-medium text-slate-800">077-1234567</span></div>
                    <div><span class="text-slate-500">Address:</span> <span class="font-medium text-slate-800">12/4, Galle Road, Colombo 06</span></div>
                  </div>
                </div>
                <div class="flex-shrink-0 bg-slate-50 p-4 border border-slate-200 rounded-lg text-center cursor-pointer hover:border-primary-500 transition-colors" onclick="openLightbox('/mock_mlef_form_1779364013211.png')">
                  <div class="text-xs font-medium text-slate-500 mb-2">MLEF Form (Scanned)</div>
                  <i data-feather="file-text" class="w-10 h-10 text-slate-400 mx-auto"></i>
                  <div class="mt-2 text-xs text-primary-600 font-medium">Click to Enlarge</div>
                </div>
              </div>

              <!-- Photographs Section -->
              <div class="space-y-4">
                <h3 class="text-lg font-semibold text-slate-800 border-l-4 border-primary-500 pl-3">Photographs</h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4" id="photoGrid">
                  <div class="relative group cursor-pointer border border-slate-200 rounded-lg overflow-hidden bg-slate-100 aspect-square flex flex-col items-center justify-center" onclick="openLightbox('https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=500&q=80')">
                    <img src="https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=500&q=80" class="w-full h-full object-cover">
                    <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-[10px] p-1 text-center">2023-10-25 14:30</div>
                  </div>
                  <div class="relative group cursor-pointer border border-slate-200 rounded-lg overflow-hidden bg-slate-100 aspect-square flex flex-col items-center justify-center" onclick="openLightbox('https://images.unsplash.com/photo-1584036533827-45bce166ad94?w=500&q=80')">
                    <img src="https://images.unsplash.com/photo-1584036533827-45bce166ad94?w=500&q=80" class="w-full h-full object-cover">
                    <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-[10px] p-1 text-center">2023-10-25 14:35</div>
                  </div>
                  <button class="border-2 border-dashed border-slate-300 rounded-lg aspect-square flex flex-col items-center justify-center hover:border-primary-500 hover:bg-slate-50 transition-colors text-slate-500 hover:text-primary-600">
                    <i data-feather="plus" class="w-8 h-8 mb-2"></i>
                    <span class="text-sm font-medium">Add Photo</span>
                  </button>
                </div>
              </div>

              <!-- Reports Section -->
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <h3 class="text-lg font-semibold text-slate-800 border-l-4 border-amber-500 pl-3">Reports</h3>
                  <button id="addReportRowBtn" class="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
                    <i data-feather="plus" class="w-4 h-4 mr-1"></i> Add Report
                  </button>
                </div>
                <div class="space-y-3" id="reportsList">
                  <div class="flex items-center gap-4 p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <div class="w-1/3">
                      <select class="block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white" disabled>
                        <option selected>Blood Report</option>
                        <option>X-Ray</option>
                        <option>Toxicology</option>
                      </select>
                    </div>
                    <div class="flex-1">
                      <button class="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center" onclick="openLightbox('/mock_mlef_form_1779364013211.png')">
                        <i data-feather="file" class="w-4 h-4 mr-2"></i> View Scanned Copy
                      </button>
                    </div>
                    <span class="text-xs text-slate-500"><i data-feather="lock" class="w-3 h-3 inline"></i> Locked</span>
                  </div>
                </div>
              </div>

              <!-- Referrals Section -->
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <h3 class="text-lg font-semibold text-slate-800 border-l-4 border-emerald-500 pl-3">Referrals</h3>
                  <button id="addReferralRowBtn" class="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
                    <i data-feather="plus" class="w-4 h-4 mr-1"></i> Add Referral
                  </button>
                </div>
                <div class="space-y-3" id="referralsList">
                  <div class="flex items-center gap-4 p-3 border border-slate-200 rounded-lg bg-slate-50">
                    <div class="w-1/4">
                      <input type="text" value="Psychiatry" class="block w-full border-slate-300 rounded-md shadow-sm sm:text-sm bg-white" disabled>
                    </div>
                    <div class="w-1/3">
                      <input type="text" value="Dr. Perera" class="block w-full border-slate-300 rounded-md shadow-sm sm:text-sm bg-white" disabled>
                    </div>
                    <div class="flex-1">
                      <button class="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center" onclick="openLightbox('/mock_mlef_form_1779364013211.png')">
                        <i data-feather="file" class="w-4 h-4 mr-2"></i> View Referral
                      </button>
                    </div>
                    <span class="text-xs text-slate-500"><i data-feather="lock" class="w-3 h-3 inline"></i> Locked</span>
                  </div>
                </div>
              </div>

              <!-- Court Summons Section -->
              <div class="space-y-4 border-t border-slate-200 pt-6">
                <h3 class="text-lg font-semibold text-slate-800 border-l-4 border-purple-500 pl-3">Court Summons</h3>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700">Date</label>
                    <input type="date" class="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700">Summons No (Yomu Ankaya)</label>
                    <input type="text" class="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                  </div>
                  <div class="flex items-end">
                    <label class="flex-1 flex flex-col items-center justify-center px-4 py-2 bg-white text-primary-600 rounded-lg shadow-sm tracking-wide border border-primary-500 cursor-pointer hover:bg-primary-50 transition-colors">
                        <i data-feather="upload" class="w-5 h-5"></i>
                        <span class="mt-1 text-xs font-medium leading-normal">Upload Scanned Copy</span>
                        <input type='file' class="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <!-- MLR Section -->
              <div class="space-y-4 border-t border-slate-200 pt-6">
                <h3 class="text-lg font-semibold text-slate-800 border-l-4 border-indigo-500 pl-3">MLR (Medico-Legal Report)</h3>
                <div class="flex space-x-4">
                  <button class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm flex items-center font-medium">
                    <i data-feather="file-text" class="w-4 h-4 mr-2"></i> Generate Report
                  </button>
                  <label class="px-6 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-md hover:bg-indigo-50 shadow-sm flex items-center cursor-pointer font-medium">
                    <i data-feather="upload" class="w-4 h-4 mr-2"></i> Add physical report
                    <input type='file' class="hidden" />
                  </label>
                </div>
              </div>

              <!-- Certificate of Receipt -->
              <div class="space-y-4 border-t border-slate-200 pt-6">
                <h3 class="text-lg font-semibold text-slate-800 border-l-4 border-teal-500 pl-3">Certificate of Receipt</h3>
                <div class="w-full sm:w-1/3">
                  <label class="flex w-full flex-col items-center justify-center px-4 py-4 bg-white text-teal-600 rounded-lg shadow-sm tracking-wide border border-teal-500 cursor-pointer hover:bg-teal-50 transition-colors">
                      <i data-feather="check-circle" class="w-6 h-6 mb-2"></i>
                      <span class="text-sm font-medium leading-normal">Upload Acknowledgment</span>
                      <input type='file' class="hidden" />
                  </label>
                </div>
              </div>

            </div>
          </section>
`;
  
  lines.splice(startIdx, endIdx - startIdx, newClinicalView);
}

fs.writeFileSync('index.html', lines.join('\\n'));
console.log('index.html updated successfully.');
