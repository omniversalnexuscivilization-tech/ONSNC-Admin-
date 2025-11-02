// DOM Elements - Form Fields
const form = {
  parentName: document.getElementById('parentName'),
  ulpID: document.getElementById('ulpID'),
  contactNumber: document.getElementById('contactNumber'),
  emailID: document.getElementById('emailID'),
  address: document.getElementById('address'),
  linkedLearners: document.getElementById('linkedLearners'),
  communityHub: document.getElementById('communityHub'),
  emotionalSupport: document.getElementById('emotionalSupport'),
  communication: document.getElementById('communication'),
  environment: document.getElementById('environment'),
  ethics: document.getElementById('ethics'),
  parentReflection: document.getElementById('parentReflection'),
  mentorFeedback: document.getElementById('mentorFeedback'),
  learnerFeedback: document.getElementById('learnerFeedback'),
  profilePhoto: document.getElementById('profilePhoto'),
  signature: document.getElementById('signature')
};

// DOM Elements - Report Preview
const report = {
  parentName: document.getElementById('rpParentName'),
  ulpID: document.getElementById('rpUlpID'),
  contact: document.getElementById('rpContact'),
  email: document.getElementById('rpEmail'),
  address: document.getElementById('rpAddress'),
  learners: document.getElementById('rpLearners'),
  hub: document.getElementById('rpHub'),
  date: document.getElementById('rpDate'),
  emotional: document.getElementById('rpEmotional'),
  communication: document.getElementById('rpCommunication'),
  environment: document.getElementById('rpEnvironment'),
  ethics: document.getElementById('rpEthics'),
  fei: document.getElementById('rpFEI'),
  parentRef: document.getElementById('rpParentRef'),
  mentorRef: document.getElementById('rpMentorRef'),
  learnerRef: document.getElementById('rpLearnerRef'),
  timestamp: document.getElementById('rpTimestamp'),
  profilePic: document.getElementById('reportProfilePic'),
  signature: document.getElementById('reportSignature')
};

// Other DOM Elements
const feiScore = document.getElementById('feiScore');
const statusMsg = document.getElementById('statusMsg');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const calculateBtn = document.getElementById('calculateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');

// State Management
let profilePhotoData = '';
let signatureData = '';
let currentFEI = 0;

// Initialize
function init() {
  setupEventListeners();
  updateReport();
  setInitialDates();
}

// Setup All Event Listeners
function setupEventListeners() {
  // Live update listeners for all form fields
  Object.values(form).forEach(field => {
    if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
      field.addEventListener('input', updateReport);
      field.addEventListener('change', updateReport);
    }
  });

  // File upload listeners
  form.profilePhoto.addEventListener('change', handleProfilePhotoUpload);
  form.signature.addEventListener('change', handleSignatureUpload);

  // Button listeners
  calculateBtn.addEventListener('click', calculateFEI);
  downloadBtn.addEventListener('click', downloadPDF);
  clearBtn.addEventListener('click', clearForm);
}

// Live Update Report Preview
function updateReport() {
  // Basic Information
  report.parentName.textContent = form.parentName.value || '—';
  report.ulpID.textContent = form.ulpID.value || '—';
  report.contact.textContent = form.contactNumber.value || '—';
  report.email.textContent = form.emailID.value || '—';
  report.address.textContent = form.address.value || '—';
  report.learners.textContent = form.linkedLearners.value || '—';
  report.hub.textContent = form.communityHub.value || '—';

  // Scores
  report.emotional.textContent = form.emotionalSupport.value || '—';
  report.communication.textContent = form.communication.value || '—';
  report.environment.textContent = form.environment.value || '—';
  report.ethics.textContent = form.ethics.value || '—';

  // Reflections
  report.parentRef.textContent = form.parentReflection.value || '—';
  report.mentorRef.textContent = form.mentorFeedback.value || '—';
  report.learnerRef.textContent = form.learnerFeedback.value || '—';

  // Update timestamp
  report.timestamp.textContent = new Date().toLocaleString();
}

// Handle Profile Photo Upload
function handleProfilePhotoUpload(e) {
  const file = e.target.files[0];
  if (file) {
    if (!file.type.startsWith('image/')) {
      showStatus('Please select a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      profilePhotoData = event.target.result;
      
      // Update preview
      const preview = document.getElementById('profilePreview');
      preview.src = profilePhotoData;
      preview.classList.add('show');
      
      // Update report
      report.profilePic.src = profilePhotoData;
      
      showStatus('Profile photo uploaded successfully', 'success');
    };
    reader.onerror = function() {
      showStatus('Error reading profile photo', 'error');
    };
    reader.readAsDataURL(file);
  }
}

// Handle Signature Upload
function handleSignatureUpload(e) {
  const file = e.target.files[0];
  if (file) {
    if (!file.type.startsWith('image/')) {
      showStatus('Please select a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      signatureData = event.target.result;
      
      // Update preview
      const preview = document.getElementById('signaturePreview');
      preview.src = signatureData;
      preview.classList.add('show');
      
      // Update report
      report.signature.src = signatureData;
      
      showStatus('Signature uploaded successfully', 'success');
    };
    reader.onerror = function() {
      showStatus('Error reading signature', 'error');
    };
    reader.readAsDataURL(file);
  }
}

// Calculate FEI Score
function calculateFEI() {
  // Validate scores
  const scores = [
    parseInt(form.emotionalSupport.value) || 0,
    parseInt(form.communication.value) || 0,
    parseInt(form.environment.value) || 0,
    parseInt(form.ethics.value) || 0
  ];

  // Check if all scores are valid
  const allScoresValid = scores.every(score => score >= 1 && score <= 4);
  
  if (!allScoresValid) {
    showStatus('Please enter valid scores (1-4) for all dimensions', 'error');
    return;
  }

  // Calculate FEI: (sum of scores / max possible score) * 100
  const sum = scores.reduce((a, b) => a + b, 0);
  const maxScore = 16; // 4 dimensions × 4 max score
  const fei = ((sum / maxScore) * 100).toFixed(1);

  // Update FEI displays
  currentFEI = fei;
  feiScore.textContent = fei;
  report.fei.textContent = fei;

  // Generate QR Code
  generateQRCode(fei);

  showStatus('FEI calculated successfully!', 'success');
}

// Generate QR Code
function generateQRCode(fei) {
  // Clear existing QR code
  qrCodeContainer.innerHTML = '';

  // Create QR data string
  const qrData = `UHAN-360-PARENTS|ULP:${form.ulpID.value || 'N/A'}|Name:${form.parentName.value || 'N/A'}|FEI:${fei}|Date:${new Date().toLocaleDateString()}`;

  // Generate QR code
  try {
    new QRCode(qrCodeContainer, {
      text: qrData,
      width: 80,
      height: 80,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    showStatus('Error generating QR code', 'error');
  }
}

// Download Report as PDF
async function downloadPDF() {
  // Validate that FEI has been calculated
  if (currentFEI === 0) {
    showStatus('Please calculate FEI before downloading PDF', 'error');
    return;
  }

  showStatus('Generating PDF... Please wait', 'success');

  try {
    const reportCard = document.getElementById('reportCard');
    
    // Generate canvas from report card
    const canvas = await html2canvas(reportCard, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: reportCard.scrollWidth,
      windowHeight: reportCard.scrollHeight
    });

    // Convert to image
    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Calculate dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // Add image to PDF
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
    
    // Add additional pages if content is longer
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    
    // Generate filename
    const filename = `UHAN-Parents-Report-${form.ulpID.value || 'assessment'}-${Date.now()}.pdf`;
    
    // Save PDF
    pdf.save(filename);
    
    showStatus('PDF downloaded successfully!', 'success');
  } catch (error) {
    console.error('Error generating PDF:', error);
    showStatus('Error generating PDF. Please try again.', 'error');
  }
}

// Clear Form
function clearForm() {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    // Reset text and number inputs
    Object.values(form).forEach(field => {
      if (field.tagName === 'INPUT') {
        if (field.type === 'number') {
          field.value = 1;
        } else if (field.type === 'file') {
          field.value = '';
        } else {
          field.value = '';
        }
      } else if (field.tagName === 'TEXTAREA') {
        field.value = '';
      }
    });

    // Clear image previews
    document.getElementById('profilePreview').classList.remove('show');
    document.getElementById('signaturePreview').classList.remove('show');
    
    // Reset image data
    profilePhotoData = '';
    signatureData = '';
    report.profilePic.src = '';
    report.signature.src = '';
    
    // Reset FEI
    currentFEI = 0;
    feiScore.textContent = '—';
    report.fei.textContent = '—';
    
    // Clear QR code
    qrCodeContainer.innerHTML = '';
    
    // Update report
    updateReport();
    
    showStatus('Form cleared successfully', 'success');
  }
}

// Show Status Message
function showStatus(message, type) {
  statusMsg.textContent = message;
  statusMsg.className = `status show ${type}`;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusMsg.classList.remove('show');
  }, 3000);
}

// Set Initial Dates
function setInitialDates() {
  const currentDate = new Date().toLocaleDateString();
  const currentDateTime = new Date().toLocaleString();
  
  report.date.textContent = currentDate;
  report.timestamp.textContent = currentDateTime;
}

// Validate Form Data
function validateForm() {
  const requiredFields = [
    { field: form.parentName, name: 'Parent Name' },
    { field: form.ulpID, name: 'ULP ID' },
    { field: form.contactNumber, name: 'Contact Number' },
    { field: form.emailID, name: 'Email ID' }
  ];

  for (let item of requiredFields) {
    if (!item.field.value.trim()) {
      showStatus(`${item.name} is required`, 'error');
      item.field.focus();
      return false;
    }
  }

  return true;
}

// Export/Save Data to JSON
function exportData() {
  const data = {
    parentName: form.parentName.value,
    ulpID: form.ulpID.value,
    contactNumber: form.contactNumber.value,
    emailID: form.emailID.value,
    address: form.address.value,
    linkedLearners: form.linkedLearners.value,
    communityHub: form.communityHub.value,
    scores: {
      emotionalSupport: form.emotionalSupport.value,
      communication: form.communication.value,
      environment: form.environment.value,
      ethics: form.ethics.value
    },
    reflections: {
      parent: form.parentReflection.value,
      mentor: form.mentorFeedback.value,
      learner: form.learnerFeedback.value
    },
    fei: currentFEI,
    profilePhoto: profilePhotoData,
    signature: signatureData,
    timestamp: new Date().toISOString()
  };

  return data;
}

// Load Data from JSON
function loadData(data) {
  if (!data) return;

  form.parentName.value = data.parentName || '';
  form.ulpID.value = data.ulpID || '';
  form.contactNumber.value = data.contactNumber || '';
  form.emailID.value = data.emailID || '';
  form.address.value = data.address || '';
  form.linkedLearners.value = data.linkedLearners || '';
  form.communityHub.value = data.communityHub || '';

  if (data.scores) {
    form.emotionalSupport.value = data.scores.emotionalSupport || 1;
    form.communication.value = data.scores.communication || 1;
    form.environment.value = data.scores.environment || 1;
    form.ethics.value = data.scores.ethics || 1;
  }

  if (data.reflections) {
    form.parentReflection.value = data.reflections.parent || '';
    form.mentorFeedback.value = data.reflections.mentor || '';
    form.learnerFeedback.value = data.reflections.learner || '';
  }

  if (data.profilePhoto) {
    profilePhotoData = data.profilePhoto;
    document.getElementById('profilePreview').src = profilePhotoData;
    document.getElementById('profilePreview').classList.add('show');
    report.profilePic.src = profilePhotoData;
  }

  if (data.signature) {
    signatureData = data.signature;
    document.getElementById('signaturePreview').src = signatureData;
    document.getElementById('signaturePreview').classList.add('show');
    report.signature.src = signatureData;
  }

  updateReport();
  
  if (data.fei) {
    currentFEI = data.fei;
    feiScore.textContent = data.fei;
    report.fei.textContent = data.fei;
    generateQRCode(data.fei);
  }

  showStatus('Data loaded successfully', 'success');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);

// Prevent form submission on Enter key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
  }
});

// Auto-save to localStorage (optional)
function autoSave() {
  try {
    const data = exportData();
    localStorage.setItem('uhan_parents_assessment', JSON.stringify(data));
  } catch (error) {
    console.error('Error auto-saving:', error);
  }
}

// Auto-load from localStorage on startup (optional)
function autoLoad() {
  try {
    const savedData = localStorage.getItem('uhan_parents_assessment');
    if (savedData) {
      const data = JSON.parse(savedData);
      // Optionally prompt user if they want to load saved data
      if (confirm('Found saved data. Would you like to load it?')) {
        loadData(data);
      }
    }
  } catch (error) {
    console.error('Error auto-loading:', error);
  }
}

// Optional: Enable auto-save every 30 seconds
// setInterval(autoSave, 30000);

// Optional: Load saved data on startup
// autoLoad();
