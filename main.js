import './style.css'

// ─── Feather icons ────────────────────────────────────────────────────────────
function initFeather() {
  if (typeof feather !== 'undefined') feather.replace()
}
initFeather()

document.addEventListener('DOMContentLoaded', () => {

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function showModal(el) {
    el.classList.remove('hidden')
    el.classList.add('flex')
  }
  function hideModal(el) {
    el.classList.add('hidden')
    el.classList.remove('flex')
  }

  // ─── Lightbox ────────────────────────────────────────────────────────────────
  const lightboxModal = document.getElementById('lightboxModal')
  const lightboxImage = document.getElementById('lightboxImage')
  const closeLightbox = document.getElementById('closeLightbox')

  window.openLightbox = function (src) {
    if (!lightboxModal || !src) return
    lightboxImage.src = src
    showModal(lightboxModal)
  }

  if (closeLightbox) {
    closeLightbox.addEventListener('click', () => hideModal(lightboxModal))
  }
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) hideModal(lightboxModal)
    })
  }

  // ─── Login ───────────────────────────────────────────────────────────────────
  const loginForm = document.getElementById('loginForm')
  const loginOverlay = document.getElementById('loginOverlay')
  const appContainer = document.getElementById('appContainer')
  const logoutBtn = document.getElementById('logoutBtn')

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault()
    loginOverlay.classList.add('opacity-0', 'pointer-events-none')
    setTimeout(() => {
      loginOverlay.classList.add('hidden')
      appContainer.classList.remove('opacity-0', 'pointer-events-none')
      initFeather()
    }, 300)
  })

  logoutBtn.addEventListener('click', () => {
    appContainer.classList.add('opacity-0', 'pointer-events-none')
    loginOverlay.classList.remove('hidden')
    setTimeout(() => loginOverlay.classList.remove('opacity-0', 'pointer-events-none'), 50)
  })

  // ─── Navigation ──────────────────────────────────────────────────────────────
  const navLinks = document.querySelectorAll('.nav-link')
  const viewSections = document.querySelectorAll('.view-section')
  const pageTitle = document.getElementById('pageTitle')

  const titleMap = {
    dashboard: 'Dashboard',
    clinical: 'Clinical Registry',
    autopsy: 'Post-Mortem Registry',
    scanning: 'Form Scanning',
    court: 'Court Tracking',
    dispatched: 'Dispatched Reports',
  }

  function navigateTo(viewId) {
    navLinks.forEach((l) => {
      l.classList.remove('active', 'bg-navy-800', 'text-white', 'border-l-4', 'border-primary-500')
      if (l.getAttribute('data-view') === viewId) {
        l.classList.add('active', 'bg-navy-800', 'text-white', 'border-l-4', 'border-primary-500')
      }
    })
    viewSections.forEach((s) => {
      s.classList.remove('active')
      if (s.id === `view-${viewId}`) s.classList.add('active')
    })
    if (titleMap[viewId]) pageTitle.textContent = titleMap[viewId]
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const viewId = link.getAttribute('data-view')
      // When navigating to clinical via sidebar always show the list
      if (viewId === 'clinical') {
        showClinicalList()
      }
      navigateTo(viewId)
    })
  })

  // ─── Clinical Registry state ──────────────────────────────────────────────────
  // In-memory "DB" for demo — each entry = { id, name, nic, contact, address,
  //   status ('Inward'|'Outpatient'), hospitalReg, formSrc }
  const clinicalPatients = []
  let mlefCounter = 1

  function generateMlefNo() {
    return `MLEF-${String(mlefCounter).padStart(4, '0')}`
  }

  function showClinicalList() {
    document.getElementById('clinicalList').classList.remove('hidden')
    document.getElementById('clinicalPatientView').classList.add('hidden')
  }

  function openPatientRecord(patient) {
    document.getElementById('clinicalList').classList.add('hidden')
    const view = document.getElementById('clinicalPatientView')
    view.classList.remove('hidden')

    // Populate header
    document.getElementById('mlefTitle').textContent = patient.id
    document.getElementById('mlefPatientStatus').textContent = patient.status
    document.getElementById('mlefPatientStatus').className =
      patient.status === 'Inward'
        ? 'px-3 py-1 text-xs font-bold rounded-full bg-primary-500 text-white'
        : 'px-3 py-1 text-xs font-bold rounded-full bg-amber-400 text-white'
    document.getElementById('mlefName').textContent = patient.name
    document.getElementById('mlefId').textContent = patient.nic
    document.getElementById('mlefContact').textContent = patient.contact
    document.getElementById('mlefAddress').textContent = patient.address

    // MLEF form thumbnail click
    const thumb = document.getElementById('mlefFormThumb')
    thumb.onclick = () => openLightbox(patient.formSrc)

    // Reset dynamic sections
    document.getElementById('photoGrid').innerHTML = `
      <label class="border-2 border-dashed border-slate-300 rounded-xl aspect-square flex flex-col items-center justify-center hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer text-slate-400 hover:text-primary-500 group">
        <i data-feather="plus" class="w-7 h-7 mb-1 group-hover:scale-110 transition-transform"></i>
        <span class="text-xs font-medium">Add Photo</span>
        <input type="file" class="hidden" accept="image/*" id="photoFileInput">
      </label>`
    document.getElementById('reportsList').innerHTML = ''
    document.getElementById('referralsList').innerHTML = ''
    document.getElementById('courtSummonsList').innerHTML = ''

    initFeather()
    // Scroll to top of patient view
    view.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function addPatientToRegistry(patient) {
    clinicalPatients.push(patient)
    const tbody = document.getElementById('clinicalTableBody')
    // Remove empty-state row if present
    const emptyRow = document.getElementById('clinicalEmptyRow')
    if (emptyRow) emptyRow.remove()

    const tr = document.createElement('tr')
    tr.className = 'hover:bg-slate-50 cursor-pointer transition-colors'
    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-navy-900">${patient.id}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-800">${patient.name}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.status === 'Inward' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}">
          ${patient.status}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Clinical</td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button class="text-primary-600 hover:text-primary-800 font-semibold open-patient-btn">Open →</button>
      </td>`
    tbody.appendChild(tr)

    tr.querySelector('.open-patient-btn').addEventListener('click', () => {
      openPatientRecord(patient)
    })

    initFeather()
  }

  // Back to list
  const backToListBtn = document.getElementById('backToListBtn')
  if (backToListBtn) {
    backToListBtn.addEventListener('click', () => showClinicalList())
  }

  // ─── Onboarding Modal ─────────────────────────────────────────────────────────
  const onboardingModal = document.getElementById('onboardingModal')
  const closeOnboarding = document.getElementById('closeOnboarding')

  // Steps
  const obStep1 = document.getElementById('obStep1')
  const obStep2 = document.getElementById('obStep2')
  const obStep3 = document.getElementById('obStep3')
  const obStepLabel = document.getElementById('obStepLabel')
  const obProgressBar = document.getElementById('obProgress')

  function setObStep(n) {
    obStep1.classList.add('hidden')
    obStep2.classList.add('hidden')
    obStep3.classList.add('hidden')
    if (n === 1) {
      obStep1.classList.remove('hidden')
      obStepLabel.textContent = 'Step 1 of 3 — Select Registry Type'
      obProgressBar.style.width = '33.3%'
    } else if (n === 2) {
      obStep2.classList.remove('hidden')
      obStepLabel.textContent = 'Step 2 of 3 — Clinical Status'
      obProgressBar.style.width = '66.6%'
    } else if (n === 3) {
      obStep3.classList.remove('hidden')
      obStepLabel.textContent = 'Step 3 of 3 — Upload & Preview MLEF Form'
      obProgressBar.style.width = '100%'
    }
    initFeather()
  }

  function resetOnboardingModal() {
    setObStep(1)
    // Reset step 2 radios
    document.querySelectorAll('input[name="obStatus"]').forEach((r) => (r.checked = false))
    document.getElementById('obInwardDetails').classList.add('hidden')
    document.getElementById('obHospitalRegNo').value = ''
    document.getElementById('obNextTo3').disabled = true
    // Reset step 3
    resetObStep3()
  }

  function resetObStep3() {
    const dropzone = document.getElementById('obDropzone')
    const processing = document.getElementById('obProcessing')
    const preview = document.getElementById('obPreview')
    dropzone.classList.remove('hidden')
    processing.classList.add('hidden')
    preview.classList.add('hidden')
    document.getElementById('obFileInput').value = ''
    document.getElementById('obProgressBar').style.width = '0%'
  }

  function openOnboarding() {
    resetOnboardingModal()
    showModal(onboardingModal)
    initFeather()
  }

  // Bind Add Patient buttons (header + clinical list page)
  document.getElementById('addPatientBtn').addEventListener('click', openOnboarding)
  const addPatientBtn2 = document.getElementById('addPatientBtn2')
  if (addPatientBtn2) addPatientBtn2.addEventListener('click', openOnboarding)

  closeOnboarding.addEventListener('click', () => hideModal(onboardingModal))
  onboardingModal.addEventListener('click', (e) => {
    if (e.target === onboardingModal) hideModal(onboardingModal)
  })

  // Step 1 → 2
  document.getElementById('obBtnClinical').addEventListener('click', () => setObStep(2))
  document.getElementById('obBtnAutopsy').addEventListener('click', () => {
    hideModal(onboardingModal)
    navigateTo('autopsy')
  })

  // Step 2 radio changes
  document.querySelectorAll('input[name="obStatus"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      document.getElementById('obNextTo3').disabled = false
      const inwardDetails = document.getElementById('obInwardDetails')
      if (e.target.value === 'inward') {
        inwardDetails.classList.remove('hidden')
      } else {
        inwardDetails.classList.add('hidden')
      }
    })
  })

  // Step 2 back / next
  document.getElementById('obBackTo1').addEventListener('click', () => setObStep(1))
  document.getElementById('obNextTo3').addEventListener('click', () => {
    resetObStep3()
    setObStep(3)
  })

  // Step 3 back
  document.getElementById('obBackTo2').addEventListener('click', () => setObStep(2))

  // ─── Step 3: Upload → Parse → Preview ────────────────────────────────────────
  const obDropzone = document.getElementById('obDropzone')
  const obFileInput = document.getElementById('obFileInput')

  obDropzone.addEventListener('click', (e) => {
    if (e.target !== obFileInput) obFileInput.click()
  })
  obDropzone.addEventListener('dragover', (e) => {
    e.preventDefault()
    obDropzone.classList.add('border-primary-400', 'bg-primary-50')
  })
  obDropzone.addEventListener('dragleave', () => {
    obDropzone.classList.remove('border-primary-400', 'bg-primary-50')
  })
  obDropzone.addEventListener('drop', (e) => {
    e.preventDefault()
    obDropzone.classList.remove('border-primary-400', 'bg-primary-50')
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) startObProcessing(file)
  })

  obFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) startObProcessing(file)
  })

  let uploadedFormSrc = ''

  function startObProcessing(file) {
    uploadedFormSrc = URL.createObjectURL(file)

    // Show processing state
    obDropzone.classList.add('hidden')
    const processing = document.getElementById('obProcessing')
    const progressBar = document.getElementById('obProgressBar')
    const processingText = document.getElementById('obProcessingText')
    processing.classList.remove('hidden')
    processing.classList.add('flex')

    let pct = 0
    const messages = [
      'Analysing document layout…',
      'Parsing handwritten fields (OCR)…',
      'Mapping to MLEF template…',
      'Verifying clinical context…',
    ]
    let msgIdx = 0
    const interval = setInterval(() => {
      pct += Math.random() * 18
      if (pct >= 100) pct = 100
      progressBar.style.width = pct + '%'
      const newIdx = Math.floor((pct / 100) * messages.length)
      if (newIdx !== msgIdx && newIdx < messages.length) {
        msgIdx = newIdx
        processingText.textContent = messages[msgIdx]
      }
      if (pct >= 100) {
        clearInterval(interval)
        setTimeout(() => {
          processing.classList.add('hidden')
          processing.classList.remove('flex')
          showObPreview()
        }, 400)
      }
    }, 300)
  }

  function showObPreview() {
    // Set scanned image
    document.getElementById('obPreviewImg').src = uploadedFormSrc
    // Show preview section
    const preview = document.getElementById('obPreview')
    preview.classList.remove('hidden')
    initFeather()
  }

  // Confirm & Register
  document.getElementById('obConfirmSave').addEventListener('click', () => {
    const statusRadio = document.querySelector('input[name="obStatus"]:checked')
    if (!statusRadio) return

    const status = statusRadio.value === 'inward' ? 'Inward' : 'Outpatient'
    const hospitalReg = document.getElementById('obHospitalRegNo').value.trim()

    const patient = {
      id: generateMlefNo(),
      name: document.getElementById('prevName').value.trim() || 'Unknown',
      nic: document.getElementById('prevId').value.trim(),
      contact: document.getElementById('prevContact').value.trim(),
      address: document.getElementById('prevAddress').value.trim(),
      policeStation: document.getElementById('prevPoliceStation').value.trim(),
      status,
      hospitalReg,
      formSrc: uploadedFormSrc,
    }

    mlefCounter++
    addPatientToRegistry(patient)
    hideModal(onboardingModal)

    // Navigate to Clinical Registry and open this patient's record
    navigateTo('clinical')
    openPatientRecord(patient)
  })

  // ─── Dynamic Photo Upload ─────────────────────────────────────────────────────
  document.getElementById('photoGrid')?.addEventListener('change', (e) => {
    if (e.target.type !== 'file') return
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) return
    const src = URL.createObjectURL(file)
    const now = new Date()
    const ts = now.toISOString().slice(0, 16).replace('T', ' ')
    const grid = document.getElementById('photoGrid')
    const addBtn = grid.querySelector('label:last-child')

    const photoCard = document.createElement('div')
    photoCard.className =
      'relative cursor-pointer border border-slate-200 rounded-xl overflow-hidden bg-slate-100 aspect-square'
    photoCard.innerHTML = `
      <img src="${src}" class="w-full h-full object-cover">
      <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-[10px] px-1 py-0.5 text-center">${ts}</div>`
    photoCard.addEventListener('click', () => openLightbox(src))
    grid.insertBefore(photoCard, addBtn)
    e.target.value = ''
  })

  // ─── Add Report row ───────────────────────────────────────────────────────────
  const addReportRowBtn = document.getElementById('addReportRowBtn')
  if (addReportRowBtn) {
    addReportRowBtn.addEventListener('click', () => {
      const list = document.getElementById('reportsList')
      const row = document.createElement('div')
      row.className =
        'flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-white shadow-sm'
      row.innerHTML = `
        <div class="w-1/3">
          <select class="block w-full border-slate-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 py-2">
            <option disabled selected>Select type…</option>
            <option>Blood Report</option>
            <option>X-Ray</option>
            <option>Toxicology</option>
            <option>Histology</option>
            <option>CT Scan</option>
            <option>Urine Analysis</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer hover:bg-primary-50 hover:border-primary-300 transition-all font-medium">
            <i data-feather="upload" class="w-4 h-4"></i> Upload Scan
            <input type="file" class="hidden" accept="image/*,application/pdf">
          </label>
        </div>
        <button class="text-slate-300 hover:text-red-400 transition-colors remove-row-btn" title="Remove">
          <i data-feather="x" class="w-4 h-4"></i>
        </button>`

      // File upload → lock row
      row.querySelector('input[type="file"]').addEventListener('change', (e) => {
        const file = e.target.files[0]
        if (!file) return
        const uploadLabel = row.querySelector('label')
        uploadLabel.innerHTML = `<i data-feather="file" class="w-4 h-4 text-emerald-500"></i> <span class="text-emerald-700 font-medium">${file.name}</span>`
        row.querySelector('select').disabled = true
        row.querySelector('.remove-row-btn').remove()
        const lock = document.createElement('span')
        lock.className = 'text-xs text-slate-400 flex items-center gap-1'
        lock.innerHTML = '<i data-feather="lock" class="w-3 h-3"></i> Locked'
        row.appendChild(lock)
        initFeather()
      })

      row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove())
      list.appendChild(row)
      initFeather()
    })
  }

  // ─── Add Referral row ─────────────────────────────────────────────────────────
  const addReferralRowBtn = document.getElementById('addReferralRowBtn')
  if (addReferralRowBtn) {
    addReferralRowBtn.addEventListener('click', () => {
      const list = document.getElementById('referralsList')
      const row = document.createElement('div')
      row.className =
        'flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-white shadow-sm'
      row.innerHTML = `
        <div class="flex-col flex gap-0.5 w-1/3">
          <input type="text" placeholder="Specialization (e.g. Psychiatry)" class="block w-full border-slate-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 py-1.5 font-medium">
          <input type="text" placeholder="Doctor's Name" class="block w-full border-slate-300 rounded-lg text-xs focus:ring-primary-500 focus:border-primary-500 py-1.5 text-slate-500">
        </div>
        <div class="flex-1">
          <label class="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer hover:bg-primary-50 hover:border-primary-300 transition-all font-medium">
            <i data-feather="upload" class="w-4 h-4"></i> Upload Referral
            <input type="file" class="hidden" accept="image/*,application/pdf">
          </label>
        </div>
        <button class="text-slate-300 hover:text-red-400 transition-colors remove-row-btn" title="Remove">
          <i data-feather="x" class="w-4 h-4"></i>
        </button>`

      // File upload → lock row
      row.querySelector('input[type="file"]').addEventListener('change', (e) => {
        const file = e.target.files[0]
        if (!file) return
        const uploadLabel = row.querySelector('label')
        uploadLabel.innerHTML = `<i data-feather="file" class="w-4 h-4 text-emerald-500"></i> <span class="text-emerald-700 font-medium">${file.name}</span>`
        row.querySelectorAll('input[type="text"]').forEach((i) => (i.disabled = true))
        row.querySelector('.remove-row-btn').remove()
        const lock = document.createElement('span')
        lock.className = 'text-xs text-slate-400 flex items-center gap-1'
        lock.innerHTML = '<i data-feather="lock" class="w-3 h-3"></i> Locked'
        row.appendChild(lock)
        initFeather()
      })

      row.querySelector('.remove-row-btn').addEventListener('click', () => row.remove())
      list.appendChild(row)
      initFeather()
    })
  }

  // ─── Add Court Summons ────────────────────────────────────────────────────────
  const addCourtSummonsBtn = document.getElementById('addCourtSummonsBtn')
  if (addCourtSummonsBtn) {
    addCourtSummonsBtn.addEventListener('click', () => {
      const list = document.getElementById('courtSummonsList')
      // Only one court summons per patient for now
      if (list.querySelector('.court-row')) return
      addCourtSummonsBtn.disabled = true
      addCourtSummonsBtn.classList.add('opacity-40', 'cursor-not-allowed')

      const row = document.createElement('div')
      row.className =
        'court-row flex flex-wrap items-end gap-4 p-4 border border-slate-200 rounded-xl bg-white shadow-sm'
      row.innerHTML = `
        <div>
          <label class="block text-xs font-medium text-slate-600 mb-1">Date</label>
          <input type="date" class="block border-slate-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 py-1.5">
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-xs font-medium text-slate-600 mb-1">Summons No (Yomu Ankaya)</label>
          <input type="text" placeholder="e.g. CS-2023-4892" class="block w-full border-slate-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 py-1.5">
        </div>
        <div>
          <label class="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-pointer hover:bg-primary-50 hover:border-primary-300 transition-all font-medium">
            <i data-feather="upload" class="w-4 h-4"></i> Upload Scanned Copy
            <input type="file" class="hidden" accept="image/*,application/pdf">
          </label>
        </div>`

      // File upload → lock row (court summons locks everything once uploaded)
      row.querySelector('input[type="file"]').addEventListener('change', (e) => {
        const file = e.target.files[0]
        if (!file) return
        const uploadLabel = row.querySelector('label')
        uploadLabel.innerHTML = `<i data-feather="file" class="w-4 h-4 text-emerald-500"></i> <span class="text-emerald-700 font-medium">${file.name}</span>`
        row.querySelectorAll('input[type="text"], input[type="date"]').forEach((i) => (i.disabled = true))
        const lock = document.createElement('span')
        lock.className = 'text-xs text-slate-400 flex items-center gap-1 mt-2'
        lock.innerHTML = '<i data-feather="lock" class="w-3 h-3"></i> Summons locked'
        row.appendChild(lock)
        initFeather()
      })

      list.appendChild(row)
      initFeather()
    })
  }

  // ─── Existing: tabs, canvases, scan view ─────────────────────────────────────
  // Tabs Logic for remaining views
  const tabBtns = document.querySelectorAll('.tab-btn')
  const tabPanes = document.querySelectorAll('.tab-pane')
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target')
      tabBtns.forEach((b) => {
        b.classList.remove('active', 'border-primary-500', 'text-primary-600')
        b.classList.add('border-transparent', 'text-slate-500')
      })
      btn.classList.add('active', 'border-primary-500', 'text-primary-600')
      btn.classList.remove('border-transparent', 'text-slate-500')
      tabPanes.forEach((pane) => {
        pane.classList.remove('active')
        if (pane.id === target) pane.classList.add('active')
      })
    })
  })

  // Canvas setup
  function setupCanvas(canvasId, clearBtnId, strokeColor, lineWidth) {
    const canvas = document.getElementById(canvasId)
    const clearBtn = document.getElementById(clearBtnId)
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let isDrawing = false
    const rect2 = canvas.parentElement.getBoundingClientRect()
    if (rect2.width && rect2.height) {
      canvas.width = rect2.width
      canvas.height = rect2.height
    }
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    function getCoords(e) {
      const r = canvas.getBoundingClientRect()
      return {
        x: (e.touches ? e.touches[0].clientX : e.clientX) - r.left,
        y: (e.touches ? e.touches[0].clientY : e.clientY) - r.top,
      }
    }
    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true
      const c = getCoords(e)
      ctx.beginPath()
      ctx.moveTo(c.x, c.y)
    })
    canvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return
      const c = getCoords(e)
      ctx.lineTo(c.x, c.y)
      ctx.stroke()
    })
    canvas.addEventListener('mouseup', () => (isDrawing = false))
    canvas.addEventListener('mouseout', () => (isDrawing = false))
    canvas.addEventListener('touchstart', (e) => {
      isDrawing = true
      const c = getCoords(e)
      ctx.beginPath()
      ctx.moveTo(c.x, c.y)
    }, { passive: true })
    canvas.addEventListener('touchmove', (e) => {
      if (!isDrawing) return
      const c = getCoords(e)
      ctx.lineTo(c.x, c.y)
      ctx.stroke()
      if (e.cancelable) e.preventDefault()
    }, { passive: false })
    canvas.addEventListener('touchend', () => (isDrawing = false))
    if (clearBtn) clearBtn.addEventListener('click', () => ctx.clearRect(0, 0, canvas.width, canvas.height))
  }
  setTimeout(() => {
    setupCanvas('bodyCanvas', 'clearBodyCanvasBtn', '#ef4444', 3)
    setupCanvas('signatureCanvas', 'clearSignatureBtn', '#0f172a', 2)
  }, 100)

  // Scan view logic
  const scanDropzone = document.getElementById('scan-dropzone')
  const scanFileInput = document.getElementById('scan-file-input')
  const scanDocumentPreview = document.getElementById('scan-document-preview')
  const scanProcessing = document.getElementById('scan-processing')
  const scanProgressBar = document.getElementById('scan-progress-bar')
  const scanProgressText = document.getElementById('scan-progress-text')
  const scanWorkspace = document.getElementById('scan-workspace')
  const scanFooter = document.getElementById('scan-footer')
  const scanTopPanel = document.getElementById('scan-top-panel')
  const scanDiscardBtn = document.getElementById('scan-discard-btn')
  const scanFormType = document.getElementById('scan-form-type')

  let currentZoom = 1
  let currentRotation = 0
  const scanImageContainer = document.getElementById('scan-image-container')

  function applyImageTransform() {
    if (scanImageContainer) {
      scanImageContainer.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`
    }
  }

  if (scanDropzone && scanFileInput) {
    scanDropzone.addEventListener('click', (e) => {
      if (e.target !== scanFileInput) scanFileInput.click()
    })
    scanFileInput.addEventListener('change', (e) => {
      if (e.target.files?.length > 0) handleScanUpload(e.target.files[0])
    })
    scanDropzone.addEventListener('dragover', (e) => {
      e.preventDefault()
      scanDropzone.classList.add('bg-slate-100', 'border-primary-500')
    })
    scanDropzone.addEventListener('dragleave', () =>
      scanDropzone.classList.remove('bg-slate-100', 'border-primary-500')
    )
    scanDropzone.addEventListener('drop', (e) => {
      e.preventDefault()
      scanDropzone.classList.remove('bg-slate-100', 'border-primary-500')
      if (e.dataTransfer.files?.length > 0) handleScanUpload(e.dataTransfer.files[0])
    })
  }

  function handleScanUpload(file) {
    if (!file.type.startsWith('image/')) return alert('Please upload a valid image.')
    scanDocumentPreview.src = URL.createObjectURL(file)
    scanDropzone.classList.add('hidden')
    if (scanFormType) scanFormType.parentElement.classList.add('hidden')
    scanProcessing.classList.remove('hidden')
    scanProgressBar.style.width = '0%'
    let p = 0
    const iv = setInterval(() => {
      p += Math.random() * 15
      if (p >= 100) p = 100
      scanProgressBar.style.width = p + '%'
      if (p > 30 && p < 70) scanProgressText.textContent = 'Parsing handwritten fields (OCR)…'
      else if (p >= 70) scanProgressText.textContent = 'Verifying clinical context…'
      if (p >= 100) {
        clearInterval(iv)
        setTimeout(() => {
          scanTopPanel.classList.add('hidden')
          scanWorkspace.classList.remove('hidden')
          scanFooter.classList.remove('hidden')
        }, 500)
      }
    }, 400)
  }

  if (scanDiscardBtn) {
    scanDiscardBtn.addEventListener('click', () => {
      scanWorkspace.classList.add('hidden')
      scanFooter.classList.add('hidden')
      scanTopPanel.classList.remove('hidden')
      scanProcessing.classList.add('hidden')
      scanDropzone.classList.remove('hidden')
      if (scanFormType) scanFormType.parentElement.classList.remove('hidden')
      scanProgressBar.style.width = '0%'
      scanProgressText.textContent = 'AI Core is analysing document layout grid…'
      if (scanFileInput) scanFileInput.value = ''
      currentZoom = 1
      currentRotation = 0
      applyImageTransform()
    })
  }

  const scanZoomIn = document.getElementById('scan-zoom-in')
  const scanZoomOut = document.getElementById('scan-zoom-out')
  const scanRotate = document.getElementById('scan-rotate')
  const scanResetView = document.getElementById('scan-reset-view')

  scanZoomIn?.addEventListener('click', () => { currentZoom = Math.min(currentZoom + 0.25, 3); applyImageTransform() })
  scanZoomOut?.addEventListener('click', () => { currentZoom = Math.max(currentZoom - 0.25, 0.5); applyImageTransform() })
  scanRotate?.addEventListener('click', () => { currentRotation = (currentRotation + 90) % 360; applyImageTransform() })
  scanResetView?.addEventListener('click', () => { currentZoom = 1; currentRotation = 0; applyImageTransform() })

  // PDF generation buttons
  document.querySelectorAll('.generatePdfBtn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const orig = btn.innerHTML
      btn.innerHTML = '<i data-feather="loader" class="mr-2 h-4 w-4 animate-spin"></i> Generating…'
      btn.disabled = true
      initFeather()
      setTimeout(() => {
        btn.innerHTML = '<i data-feather="check" class="mr-2 h-4 w-4"></i> Report Generated'
        btn.classList.replace('bg-blue-600', 'bg-green-600')
        initFeather()
        setTimeout(() => {
          btn.innerHTML = orig
          btn.classList.replace('bg-green-600', 'bg-blue-600')
          btn.disabled = false
          initFeather()
          alert('Official PDF Report has been generated and saved to the case file.')
        }, 2000)
      }, 1500)
    })
  })

  // Final feather pass after all DOM setup
  initFeather()
})
