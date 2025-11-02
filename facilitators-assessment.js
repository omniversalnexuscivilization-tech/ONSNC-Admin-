// Global Variables
let qrCodeInstance = null;
let signatureCanvas = null;
let signatureCtx = null;
let isDrawing = false;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Setup Event Listeners
    setupFormListeners();
    setupSliders();
    setupButtons();
    setupSignaturePad();
    
    // Generate Initial QR Code
    generateQRCode();
    
    // Update Report Preview
    updateReportPreview();
}

// Setup Form Listeners
function setupFormListeners() {
    const formFields = ['facilitatorName', 'uhanId', 'ulpToken', 'ulciId', 'email', 'contact', 'institution', 'address', 'facilitatorComments'];
    
    formFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.addEventListener('input', updateReportPreview);
        }
    });
    
    // Photo Upload
    document.getElementById('photoUpload').addEventListener('change', handlePhotoUpload);
}

// Setup Sliders
function setupSliders() {
    const sliders = ['engagement', 'udl', 'pedagogy', 'feedback', 'ethics'];
    
    sliders.forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        if (slider) {
            updateSliderValue(sliderId, slider.value);
            slider.addEventListener('input', function() {
                updateSliderValue(sliderId, this.value);
                calculateULCI();
                updateReportPreview();
            });
        }
    });
    
    // Calculate initial ULCI
    calculateULCI();
}

// Update Slider Value Display
function updateSliderValue(sliderId, value) {
    const valueDisplay = document.getElementById(sliderId + 'Value');
    const fillBar = document.getElementById(sliderId + 'Fill');
    
    if (valueDisplay) valueDisplay.textContent = value;
    if (fillBar) fillBar.style.width = (value * 20) + '%';
}

// Calculate ULCI Score
function calculateULCI() {
    const engagement = parseInt(document.getElementById('engagement').value);
    const udl = parseInt(document.getElementById('udl').value);
    const pedagogy = parseInt(document.getElementById('pedagogy').value);
    const feedback = parseInt(document.getElementById('feedback').value);
    const ethics = parseInt(document.getElementById('ethics').value);
    
    const totalScore = engagement + udl + pedagogy + feedback + ethics;
    const percentage = (totalScore / 25) * 100;
    
    // Update ULCI Total Display
    document.getElementById('ulciTotalValue').textContent = totalScore + '/25';
    document.getElementById('ulciTotalFill').style.width = percentage + '%';
    document.getElementById('ulciPercentage').textContent = percentage.toFixed(1) + '%';
    
    return { totalScore, percentage };
}

// Handle Photo Upload
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
        showToast('Please select a valid image file', 'error');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const photoPreview = document.getElementById('photoPreview');
        photoPreview.innerHTML = '<img src="' + e.target.result + '" alt="Profile Photo">';
        updateReportPreview();
        showToast('Photo uploaded successfully!');
    };
    reader.readAsDataURL(file);
}

// Setup Signature Pad
function setupSignaturePad() {
    const signatureBtn = document.getElementById('signatureBtn');
    const modal = document.getElementById('signatureModal');
    const saveBtn = document.getElementById('saveSignature');
    const clearBtn = document.getElementById('clearSignature');
    const cancelBtn = document.getElementById('cancelSignature');
    
    signatureCanvas = document.getElementById('signaturePad');
    signatureCtx = signatureCanvas.getContext('2d');
    
    // Configure canvas
    signatureCtx.strokeStyle = '#000';
    signatureCtx.lineWidth = 2;
    signatureCtx.lineCap = 'round';
    signatureCtx.lineJoin = 'round';
    
    // Open modal
    signatureBtn.addEventListener('click', function() {
        modal.classList.add('active');
        clearSignatureCanvas();
    });
    
    // Canvas drawing events
    signatureCanvas.addEventListener('mousedown', startDrawing);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', stopDrawing);
    signatureCanvas.addEventListener('mouseleave', stopDrawing);
    
    // Touch events for mobile
    signatureCanvas.addEventListener('touchstart', handleTouchStart);
    signatureCanvas.addEventListener('touchmove', handleTouchMove);
    signatureCanvas.addEventListener('touchend', stopDrawing);
    
    // Save signature
    saveBtn.addEventListener('click', function() {
        const signatureData = signatureCanvas.toDataURL();
        const signaturePreview = document.getElementById('signaturePreview');
        signaturePreview.innerHTML = '<img src="' + signatureData + '" alt="Signature">';
        signaturePreview.dataset.signature = signatureData;
        modal.classList.remove('active');
        updateReportPreview();
        showToast('Signature saved successfully!');
    });
    
    // Clear signature
    clearBtn.addEventListener('click', clearSignatureCanvas);
    
    // Cancel
    cancelBtn.addEventListener('click', function() {
        modal.classList.remove('active');
    });
}

// Drawing Functions
function startDrawing(e) {
    isDrawing = true;
    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    signatureCtx.beginPath();
    signatureCtx.moveTo(x, y);
}

function draw(e) {
    if (!isDrawing) return;
    const rect = signatureCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    signatureCtx.lineTo(x, y);
    signatureCtx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = signatureCanvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    isDrawing = true;
    signatureCtx.beginPath();
    signatureCtx.moveTo(x, y);
}

function handleTouchMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = signatureCanvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    signatureCtx.lineTo(x, y);
    signatureCtx.stroke();
}

function clearSignatureCanvas() {
    signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
}

// Setup Buttons
function setupButtons() {
    document.getElementById('saveBtn').addEventListener('click', saveAssessment);
    document.getElementById('loadBtn').addEventListener('click', loadAssessment);
    document.getElementById('downloadPdfBtn').addEventListener('click', downloadPDF);
}

// Save Assessment
function saveAssessment() {
    if (!validateForm()) {
        showToast('Please fill all required fields (Name, UHAN ID, Email)', 'error');
        return;
    }
    
    const photoPreview = document.getElementById('photoPreview');
    const photoImg = photoPreview.querySelector('img');
    
    const signaturePreview = document.getElementById('signaturePreview');
    
    const data = {
        name: document.getElementById('facilitatorName').value,
        uhanId: document.getElementById('uhanId').value,
        ulpToken: document.getElementById('ulpToken').value,
        ulciId: document.getElementById('ulciId').value,
        email: document.getElementById('email').value,
        contact: document.getElementById('contact').value,
        institution: document.getElementById('institution').value,
        address: document.getElementById('address').value,
        engagement: document.getElementById('engagement').value,
        udl: document.getElementById('udl').value,
        pedagogy: document.getElementById('pedagogy').value,
        feedback: document.getElementById('feedback').value,
        ethics: document.getElementById('ethics').value,
        comments: document.getElementById('facilitatorComments').value,
        photo: photoImg ? photoImg.src : '',
        signature: signaturePreview.dataset.signature || '',
        timestamp: new Date().toISOString()
    };
    
    try {
        localStorage.setItem('facilitatorAssessment', JSON.stringify(data));
        showToast('✅ Assessment saved successfully!');
        generateQRCode();
    } catch (error) {
        showToast('Error saving assessment', 'error');
        console.error('Save error:', error);
    }
}

// Load Assessment
function loadAssessment() {
    try {
        const savedData = localStorage.getItem('facilitatorAssessment');
        if (!savedData) {
            showToast('No saved assessment found', 'warning');
            return;
        }
        
        const data = JSON.parse(savedData);
        
        // Populate form fields
        document.getElementById('facilitatorName').value = data.name || '';
        document.getElementById('uhanId').value = data.uhanId || '';
        document.getElementById('ulpToken').value = data.ulpToken || '';
        document.getElementById('ulciId').value = data.ulciId || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('contact').value = data.contact || '';
        document.getElementById('institution').value = data.institution || '';
        document.getElementById('address').value = data.address || '';
        document.getElementById('facilitatorComments').value = data.comments || '';
        
        // Update sliders
        document.getElementById('engagement').value = data.engagement || 3;
        document.getElementById('udl').value = data.udl || 3;
        document.getElementById('pedagogy').value = data.pedagogy || 3;
        document.getElementById('feedback').value = data.feedback || 3;
        document.getElementById('ethics').value = data.ethics || 3;
        
        // Update slider displays
        updateSliderValue('engagement', data.engagement || 3);
        updateSliderValue('udl', data.udl || 3);
        updateSliderValue('pedagogy', data.pedagogy || 3);
        updateSliderValue('feedback', data.feedback || 3);
        updateSliderValue('ethics', data.ethics || 3);
        
        // Load photo
        if (data.photo) {
            document.getElementById('photoPreview').innerHTML = '<img src="' + data.photo + '" alt="Profile Photo">';
        }
        
        // Load signature
        if (data.signature) {
            document.getElementById('signaturePreview').innerHTML = '<img src="' + data.signature + '" alt="Signature">';
            document.getElementById('signaturePreview').dataset.signature = data.signature;
        }
        
        calculateULCI();
        updateReportPreview();
        generateQRCode();
        showToast('✅ Assessment loaded successfully!');
    } catch (error) {
        showToast('Error loading assessment', 'error');
        console.error('Load error:', error);
    }
}

// Validate Form
function validateForm() {
    const name = document.getElementById('facilitatorName').value.trim();
    const uhanId = document.getElementById('uhanId').value.trim();
    const email = document.getElementById('email').value.trim();
    
    return name && uhanId && email;
}

// Update Report Preview
function updateReportPreview() {
    // Update personal info
    document.getElementById('reportName').textContent = document.getElementById('facilitatorName').value || 'Facilitator Name';
    document.getElementById('reportInstitution').textContent = document.getElementById('institution').value || 'Institution';
    document.getElementById('reportUhanId').textContent = document.getElementById('uhanId').value || 'N/A';
    document.getElementById('reportUlpId').textContent = document.getElementById('ulpToken').value || 'N/A';
    document.getElementById('reportUlciId').textContent = document.getElementById('ulciId').value || 'N/A';
    document.getElementById('reportEmail').textContent = document.getElementById('email').value || 'N/A';
    document.getElementById('reportContact').textContent = document.getElementById('contact').value || 'N/A';
    
    // Update photo
    const photoPreview = document.getElementById('photoPreview');
    const photoImg = photoPreview.querySelector('img');
    const reportPhoto = document.getElementById('reportPhoto');
    
    if (photoImg) {
        reportPhoto.innerHTML = '<img src="' + photoImg.src + '" alt="Profile Photo">';
    } else {
        reportPhoto.innerHTML = '<i class="fas fa-user fa-3x"></i>';
    }
    
    // Update signature
    const signaturePreview = document.getElementById('signaturePreview');
    const signatureData = signaturePreview.dataset.signature;
    const reportSignature = document.getElementById('reportSignature');
    
    if (signatureData) {
        reportSignature.innerHTML = '<img src="' + signatureData + '" alt="Signature">';
    } else {
        reportSignature.innerHTML = '<i class="fas fa-signature fa-2x"></i>';
    }
    
    // Update assessment scores
    const engagement = document.getElementById('engagement').value;
    const udl = document.getElementById('udl').value;
    const pedagogy = document.getElementById('pedagogy').value;
    const feedback = document.getElementById('feedback').value;
    const ethics = document.getElementById('ethics').value;
    
    document.getElementById('reportEngagement').textContent = engagement + '/5';
    document.getElementById('reportUdl').textContent = udl + '/5';
    document.getElementById('reportPedagogy').textContent = pedagogy + '/5';
    document.getElementById('reportFeedback').textContent = feedback + '/5';
    document.getElementById('reportEthics').textContent = ethics + '/5';
    
    // Update formula values
    document.getElementById('formulaEngagement').textContent = engagement;
    document.getElementById('formulaUdl').textContent = udl;
    document.getElementById('formulaPedagogy').textContent = pedagogy;
    document.getElementById('formulaFeedback').textContent = feedback;
    document.getElementById('formulaEthics').textContent = ethics;
    
    // Update ULCI total
    const ulciData = calculateULCI();
    document.getElementById('reportUlciTotal').textContent = ulciData.totalScore + '/25 (' + ulciData.percentage.toFixed(1) + '%)';
    document.getElementById('formulaTotal').textContent = ulciData.totalScore + '/25';
    document.getElementById('formulaPercentage').textContent = ulciData.percentage.toFixed(1) + '%';
    
    // Update gauge
    document.getElementById('gaugeFill').style.height = ulciData.percentage + '%';
    document.getElementById('gaugePercentage').textContent = ulciData.percentage.toFixed(1) + '%';
    
    // Update comments
    const comments = document.getElementById('facilitatorComments').value;
    document.getElementById('reportComments').textContent = comments || 'No comments provided.';
    
    // Update QR Code
    generateQRCode();
}

// Generate QR Code
function generateQRCode() {
    const qrContainer = document.getElementById('qrCode');
    qrContainer.innerHTML = '';
    
    const qrData = {
        name: document.getElementById('facilitatorName').value || 'Facilitator',
        uhanId: document.getElementById('uhanId').value || 'UHAN-ID',
        ulciScore: calculateULCI().totalScore,
        percentage: calculateULCI().percentage.toFixed(1),
        timestamp: new Date().toISOString()
    };
    
    try {
        qrCodeInstance = new QRCode(qrContainer, {
            text: JSON.stringify(qrData),
            width: 120,
            height: 120,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (error) {
        console.error('QR Code generation error:', error);
        qrContainer.innerHTML = '<div style="width:120px;height:120px;background:white;display:flex;align-items:center;justify-content:center;border-radius:8px;color:#000;font-size:0.7rem;text-align:center;">QR Code<br/>' + (document.getElementById('uhanId').value || 'ID') + '</div>';
    }
}

// Download PDF
function downloadPDF() {
    showToast('🔄 PDF generation feature requires backend integration', 'info');
    // In production, this would call a backend API to generate PDF
    // For now, users can use browser's Print to PDF feature
    setTimeout(function() {
        window.print();
    }, 500);
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    
    setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);
}

// Performance Optimization - Debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize report updates
const debouncedUpdateReport = debounce(updateReportPreview, 300);

// Replace direct calls with debounced version for better performance
document.querySelectorAll('input, textarea').forEach(element => {
    element.addEventListener('input', debouncedUpdateReport);
});
