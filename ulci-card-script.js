// =============================================
// ULCI REPORT CARD - COMPLETE JAVASCRIPT
// Omniversal Nexus Civilization Framework
// Version 2.0.0 - Quantum Blockchain Edition
// =============================================

// ===== UTILITY FUNCTIONS =====
const $ = (id) => document.getElementById(id);

// ===== GLOBAL VARIABLES =====
let photoData = null;
let signatureData = null;
let drawing = false;

// ===== SIGNATURE PAD SETUP =====
const sigCanvas = $('sigPad');
const sigCtx = sigCanvas.getContext('2d');

function setupSignaturePad() {
  const rect = sigCanvas.getBoundingClientRect();
  sigCanvas.width = rect.width * window.devicePixelRatio;
  sigCanvas.height = rect.height * window.devicePixelRatio;
  sigCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
  sigCtx.strokeStyle = '#00FFFF';
  sigCtx.lineWidth = 2.5;
  sigCtx.lineCap = 'round';
  sigCtx.lineJoin = 'round';
}

setupSignaturePad();
window.addEventListener('resize', setupSignaturePad);

function startDrawing(e) {
  drawing = true;
  const rect = sigCanvas.getBoundingClientRect();
  const x = (e.clientX || e.touches[0].clientX) - rect.left;
  const y = (e.clientY || e.touches[0].clientY) - rect.top;
  sigCtx.beginPath();
  sigCtx.moveTo(x, y);
}

function draw(e) {
  if (!drawing) return;
  e.preventDefault();
  const rect = sigCanvas.getBoundingClientRect();
  const x = (e.clientX || e.touches[0].clientX) - rect.left;
  const y = (e.clientY || e.touches[0].clientY) - rect.top;
  sigCtx.lineTo(x, y);
  sigCtx.stroke();
}

function stopDrawing() {
  if (drawing) {
    drawing = false;
    signatureData = sigCanvas.toDataURL('image/png');
  }
}

// Mouse events
sigCanvas.addEventListener('mousedown', startDrawing);
sigCanvas.addEventListener('mousemove', draw);
sigCanvas.addEventListener('mouseup', stopDrawing);
sigCanvas.addEventListener('mouseout', stopDrawing);

// Touch events for mobile
sigCanvas.addEventListener('touchstart', startDrawing);
sigCanvas.addEventListener('touchmove', draw);
sigCanvas.addEventListener('touchend', stopDrawing);

// Clear signature button
$('clearSig').addEventListener('click', () => {
  sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
  signatureData = null;
  updateStatus('Signature cleared', '#FFD700');
});

// ===== PHOTO UPLOAD =====
$('photoInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('⚠️ Please upload an image file!');
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('⚠️ Image size should be less than 5MB!');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    photoData = event.target.result;
    $('photoPreview').innerHTML = `<img src="${photoData}" alt="photo">`;
    $('rcPhoto').innerHTML = `<img src="${photoData}" alt="photo">`;
    updateStatus('Photo uploaded successfully', '#00FF00');
  };
  reader.onerror = () => {
    alert('❌ Error reading file!');
  };
  reader.readAsDataURL(file);
});

// ===== QR CODE GENERATION =====
function generateQRCode(text) {
  // Generate QR for report card
  const qrElement = $('rcQr');
  qrElement.innerHTML = '';
  
  QRCode.toCanvas(text, {
    width: 120,
    margin: 1,
    color: {
      dark: '#00FFFF',
      light: '#021b1a'
    }
  }, (err, canvas) => {
    if (err) {
      console.error('QR Error:', err);
      qrElement.innerHTML = '<div style="color:#00FFFF;font-size:10px;padding:20px;text-align:center;">QR Generation Error</div>';
      return;
    }
    qrElement.appendChild(canvas);
  });

  // Generate QR preview in form
  const qrPreview = $('qrPreview');
  qrPreview.innerHTML = '';
  QRCode.toCanvas(text, {
    width: 130,
    margin: 1,
    color: {
      dark: '#00FFFF',
      light: '#0A192F'
    }
  }, (err, canvas) => {
    if (!err) qrPreview.appendChild(canvas);
  });
}

// ===== ULCI CALCULATION =====
function calculateULCI(scores) {
  const E = Number(scores.E) || 0;
  const S = Number(scores.S) || 0;
  const C = Number(scores.C) || 0;
  const H = Number(scores.H) || 0;
  const I = Number(scores.I) || 0;
  
  // Default weights: Environmental=25%, Social=20%, Cultural=15%, Health=20%, Innovation=20%
  const ulci = (E * 0.25 + S * 0.20 + C * 0.15 + H * 0.20 + I * 0.20);
  return Math.round(ulci * 10) / 10; // Round to 1 decimal place
}

// ===== COLLECT FORM DATA =====
function collectFormData() {
  const data = {
    name: $('name').value.trim(),
    ulciId: $('ulciId').value.trim() || 'ULCI-' + Date.now().toString().slice(-6),
    ulpId: $('ulpId').value.trim() || 'ULP-' + Date.now().toString().slice(-8),
    tokenId: $('tokenId').value.trim() || 'TOKEN-' + Date.now().toString().slice(-8),
    email: $('email').value.trim(),
    mobile: $('mobile').value.trim(),
    address: $('address').value.trim(),
    photo: photoData,
    signature: signatureData,
    scores: {
      E: Number($('scoreE').value) || 0,
      S: Number($('scoreS').value) || 0,
      C: Number($('scoreC').value) || 0,
      H: Number($('scoreH').value) || 0,
      I: Number($('scoreI').value) || 0
    },
    notes: $('sectorNotes').value.trim(),
    timestamp: new Date().toISOString()
  };

  data.ulci = calculateULCI(data.scores);
  return data;
}

// ===== UPDATE REPORT CARD =====
function updateReportCard(data) {
  // Update personal information
  $('rcName').textContent = data.name || 'Full Name';
  $('rcIds').textContent = `${data.ulciId} • ${data.ulpId} • ${data.tokenId}`;
  $('rcContact').textContent = `${data.email || '—'} • ${data.mobile || '—'}`;

  // Update photo
  if (data.photo) {
    $('rcPhoto').innerHTML = `<img src="${data.photo}" alt="photo">`;
  } else {
    $('rcPhoto').innerHTML = '📷';
  }

  // Update scores
  $('valE').textContent = data.scores.E;
  $('valS').textContent = data.scores.S;
  $('valC').textContent = data.scores.C;
  $('valH').textContent = data.scores.H;
  $('valI').textContent = data.scores.I;
  $('valULCI').textContent = data.ulci;

  // Update sector details
  $('detailE').textContent = `Score: ${data.scores.E}/100 - Environmental contributions and sustainability activities`;
  $('detailS').textContent = `Score: ${data.scores.S}/100 - Social engagement, community service, and civic participation`;
  $('detailC').textContent = `Score: ${data.scores.C}/100 - Cultural preservation, artistic work, and heritage documentation`;
  $('detailH').textContent = `Score: ${data.scores.H}/100 - Health initiatives, wellness programs, and medical contributions`;
  $('detailI').textContent = `Score: ${data.scores.I}/100 - Innovation, ethics, technology advancement, and scientific work`;
  $('rcNotes').textContent = data.notes || 'No additional notes provided';

  // Generate QR code with all data
  const qrText = `ULCI:${data.ulciId}|ULP:${data.ulpId}|NAME:${data.name}|SCORE:${data.ulci}|DATE:${new Date(data.timestamp).toLocaleDateString()}`;
  generateQRCode(qrText);

  // Update timestamp
  $('generatedAt').textContent = `Generated: ${new Date(data.timestamp).toLocaleString('en-IN', { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  })}`;
}

// ===== SAVE TO LOCALSTORAGE =====
function saveToLocalStorage(data) {
  try {
    // Save current record
    localStorage.setItem('ulci_current', JSON.stringify(data));

    // Save to history
    let history = JSON.parse(localStorage.getItem('ulci_history') || '[]');
    history.unshift(data);
    
    // Keep only last 50 records
    if (history.length > 50) {
      history = history.slice(0, 50);
    }
    
    localStorage.setItem('ulci_history', JSON.stringify(history));
    
    console.log('✅ Data saved to localStorage');
    return true;
  } catch (error) {
    console.error('❌ LocalStorage error:', error);
    alert('⚠️ Error saving data: ' + error.message);
    return false;
  }
}

// ===== LOAD FROM LOCALSTORAGE =====
function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('ulci_current');
    if (!saved) {
      console.log('No saved data found');
      return false;
    }

    const data = JSON.parse(saved);
    
    // Fill form fields
    $('name').value = data.name || '';
    $('ulciId').value = data.ulciId || '';
    $('ulpId').value = data.ulpId || '';
    $('tokenId').value = data.tokenId || '';
    $('email').value = data.email || '';
    $('mobile').value = data.mobile || '';
    $('address').value = data.address || '';
    $('scoreE').value = data.scores?.E || 80;
    $('scoreS').value = data.scores?.S || 75;
    $('scoreC').value = data.scores?.C || 70;
    $('scoreH').value = data.scores?.H || 85;
    $('scoreI').value = data.scores?.I || 72;
    $('sectorNotes').value = data.notes || '';

    // Restore photo
    if (data.photo) {
      photoData = data.photo;
      $('photoPreview').innerHTML = `<img src="${data.photo}" alt="photo">`;
    }

    // Restore signature
    if (data.signature) {
      signatureData = data.signature;
      const img = new Image();
      img.onload = () => {
        sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
        sigCtx.drawImage(img, 0, 0, sigCanvas.width / window.devicePixelRatio, sigCanvas.height / window.devicePixelRatio);
      };
      img.src = data.signature;
    }

    // Update report card
    updateReportCard(data);
    
    console.log('✅ Data loaded from localStorage');
    updateStatus('Previous data loaded', '#00FFFF');
    return true;
  } catch (error) {
    console.error('❌ Load error:', error);
    return false;
  }
}

// ===== PDF GENERATION =====
async function generatePDF(data) {
  try {
    updateStatus('Generating PDF... Please wait', '#FFD700');

    // Wait for everything to render
    await new Promise(resolve => setTimeout(resolve, 300));

    // Capture the report card
    const reportCard = $('reportCard');
    const canvas = await html2canvas(reportCard, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Create PDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
      unit: 'px',
      format: [imgWidth, imgHeight]
    });

    // Add main image
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Generate filename
    const sanitizedName = data.name.replace(/[^a-z0-9]/gi, '_');
    const timestamp = Date.now();
    const fileName = `${sanitizedName}_ULCI_Report_${timestamp}.pdf`;

    // Save PDF
    pdf.save(fileName);

    updateStatus(`✅ PDF Downloaded: ${fileName}`, '#00FF00');

    // Reset status after 4 seconds
    setTimeout(() => {
      updateStatus('Ready for next operation', '#00FFFF');
    }, 4000);

    console.log('✅ PDF generated successfully:', fileName);
    return true;
  } catch (error) {
    console.error('❌ PDF Generation Error:', error);
    updateStatus('❌ PDF generation failed: ' + error.message, '#FF6B6B');
    alert('Error generating PDF: ' + error.message);
    return false;
  }
}

// ===== UPDATE STATUS =====
function updateStatus(message, color = '#00FFFF') {
  const statusLine = $('statusLine');
  statusLine.textContent = message;
  statusLine.style.color = color;
}

// ===== SEND TO GOOGLE SHEETS (OPTIONAL) =====
async function sendToGoogleSheets(data) {
  const webhook = $('gsWebhook').value.trim();
  if (!webhook) {
    return false;
  }

  try {
    updateStatus('Sending to Google Sheets...', '#FFD700');
    
    const response = await fetch(webhook, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...data,
        photo: data.photo ? 'Photo attached' : 'No photo',
        signature: data.signature ? 'Signature attached' : 'No signature'
      })
    });

    console.log('✅ Data sent to Google Sheets');
    updateStatus('Data sent to Google Sheets', '#00FF00');
    return true;
  } catch (error) {
    console.warn('⚠️ Google Sheets error:', error);
    updateStatus('Google Sheets: ' + error.message, '#FF6B6B');
    return false;
  }
}

// ===== SAVE BUTTON EVENT =====
$('btnSave').addEventListener('click', async () => {
  const data = collectFormData();
  
  // Validation
  if (!data.name) {
    alert('⚠️ Please enter your name!');
    $('name').focus();
    return;
  }

  // Save to localStorage
  const saved = saveToLocalStorage(data);
  
  if (saved) {
    // Update report card
    updateReportCard(data);
    
    // Send to Google Sheets (optional)
    await sendToGoogleSheets(data);
    
    updateStatus('✅ Data saved successfully!', '#00FF00');
    
    setTimeout(() => {
      updateStatus('Ready', '#00FFFF');
    }, 2000);
  } else {
    updateStatus('❌ Failed to save data', '#FF6B6B');
  }
});

// ===== DOWNLOAD PDF BUTTON EVENT =====
$('btnDownload').addEventListener('click', async () => {
  const data = collectFormData();
  
  // Validation
  if (!data.name) {
    alert('⚠️ Please enter your name before downloading!');
    $('name').focus();
    return;
  }

  // Save data first
  saveToLocalStorage(data);
  updateReportCard(data);

  // Wait for rendering
  await new Promise(resolve => setTimeout(resolve, 500));

  // Generate and download PDF
  await generatePDF(data);
});

// ===== REAL-TIME SCORE UPDATES =====
['scoreE', 'scoreS', 'scoreC', 'scoreH', 'scoreI'].forEach(id => {
  $(id).addEventListener('input', () => {
    const data = collectFormData();
    $('valE').textContent = data.scores.E;
    $('valS').textContent = data.scores.S;
    $('valC').textContent = data.scores.C;
    $('valH').textContent = data.scores.H;
    $('valI').textContent = data.scores.I;
    $('valULCI').textContent = data.ulci;
  });
});

// ===== FORM VALIDATION =====
$('ulciForm').addEventListener('submit', (e) => {
  e.preventDefault();
  $('btnSave').click();
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S to save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    $('btnSave').click();
  }
  
  // Ctrl/Cmd + D to download
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault();
    $('btnDownload').click();
  }
});

// ===== INITIALIZE ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
  console.log('%c🌍 ULCI Report Card System Initialized', 'color: #00FFFF; font-size: 18px; font-weight: bold;');
  console.log('%cVersion 2.0.0 - Quantum Blockchain Edition', 'color: #8A2BE2; font-size: 14px;');
  console.log('%cOmniversal Nexus Civilization Framework', 'color: #CBD5E1; font-size: 12px;');
  
  // Load saved data if exists
  loadFromLocalStorage();

  // Set initial timestamp
  $('generatedAt').textContent = `Generated: ${new Date().toLocaleString('en-IN', { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  })}`;

  // Generate initial QR code
  generateQRCode('ULCI:NEW|Awaiting data input');

  updateStatus('System ready - Enter data to begin', '#00FFFF');
});

// ===== PUBLIC API FOR CONSOLE ACCESS =====
window.ulciSystem = {
  version: '2.0.0',
  
  // Get current form data
  getData: () => {
    const data = collectFormData();
    console.log('Current Data:', data);
    return data;
  },
  
  // Save data manually
  saveData: (customData) => {
    const data = customData || collectFormData();
    saveToLocalStorage(data);
    updateReportCard(data);
    console.log('✅ Data saved');
  },
  
  // Load saved data
  loadData: () => {
    loadFromLocalStorage();
    console.log('✅ Data loaded');
  },
  
  // Generate PDF manually
  generatePDF: async () => {
    const data = collectFormData();
    await generatePDF(data);
  },
  
  // Get history
  getHistory: () => {
    const history = JSON.parse(localStorage.getItem('ulci_history') || '[]');
    console.log(`History (${history.length} records):`, history);
    return history;
  },
  
  // Clear all history
  clearHistory: () => {
    if (confirm('⚠️ Clear all history? This cannot be undone!')) {
      localStorage.removeItem('ulci_history');
      console.log('✅ History cleared');
    }
  },
  
  // Clear current data
  clearCurrent: () => {
    if (confirm('⚠️ Clear current data?')) {
      localStorage.removeItem('ulci_current');
      location.reload();
    }
  },
  
  // Export data as JSON
  exportJSON: () => {
    const data = collectFormData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ULCI_Data_${Date.now()}.json`;
    a.click();
    console.log('✅ JSON exported');
  },
  
  // Help
  help: () => {
    console.log(`
%cULCI System Commands:
%c
ulciSystem.getData()        - Get current form data
ulciSystem.saveData()       - Save current data
ulciSystem.loadData()       - Load saved data
ulciSystem.generatePDF()    - Generate PDF
ulciSystem.getHistory()     - View all records
ulciSystem.clearHistory()   - Clear history
ulciSystem.clearCurrent()   - Clear current data
ulciSystem.exportJSON()     - Export as JSON
ulciSystem.help()           - Show this help

%cKeyboard Shortcuts:
%c
Ctrl/Cmd + S  - Save data
Ctrl/Cmd + D  - Download PDF
    `, 'color: #00FFFF; font-size: 16px; font-weight: bold;', 
       'color: #8A2BE2; font-size: 13px;',
       'color: #00FFFF; font-size: 14px; font-weight: bold;',
       'color: #CBD5E1; font-size: 13px;');
  }
};

// Show help on first load
console.log('%cType ulciSystem.help() for available commands', 'color: #FFD700; font-size: 12px;');

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
  console.error('❌ Global Error:', e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('❌ Unhandled Promise Rejection:', e.reason);
});

// ===== END OF SCRIPT =====
console.log('✅ All systems operational');


