// Global variables
let signaturePad = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Generate initial QR code
    updateQRCode();
    
    // Initialize slider value displays
    document.querySelectorAll("input[type='range']").forEach(slider => {
        updateSliderValue(slider.id, slider.value);
        slider.addEventListener("input", () => {
            updateSliderValue(slider.id, slider.value);
            calculateULCITotal();
        });
    });
    
    // Setup photo upload
    document.getElementById('photoUpload').addEventListener('change', handlePhotoUpload);
    
    // Setup signature functionality
    document.getElementById('signatureBtn').addEventListener('click', openSignaturePad);
    
    // Setup buttons
    document.getElementById('saveBtn').addEventListener('click', saveAssessment);
    document.getElementById('loadBtn').addEventListener('click', loadAssessment);
    document.getElementById('generateReportBtn').addEventListener('click', generateReport);
    document.getElementById('downloadPdfBtn').addEventListener('click', downloadPdf);
    document.getElementById('closeReportBtn').addEventListener('click', closeReport);
    document.getElementById('saveToDriveBtn').addEventListener('click', saveToGoogleDrive);
    
    // Calculate initial ULCI Total Score
    calculateULCITotal();
    
    // Simulate blockchain status updates
    setInterval(updateBlockchainStatus, 5000);
    
    // Initialize Google Drive API
    initGoogleDrive();
}

function updateSliderValue(sliderId, value) {
    document.getElementById(sliderId + 'Value').textContent = value;
    document.getElementById(sliderId + 'Fill').style.width = (value * 20) + '%';
}

function calculateULCITotal() {
    const engagement = parseInt(document.getElementById('engagement').value);
    const udl = parseInt(document.getElementById('udl').value);
    const pedagogy = parseInt(document.getElementById('pedagogy').value);
    const feedback = parseInt(document.getElementById('feedback').value);
    const ethics = parseInt(document.getElementById('ethics').value);
    
    const totalScore = engagement + udl + pedagogy + feedback + ethics;
    const percentage = (totalScore / 25) * 100;
    
    document.getElementById('ulciTotalValue').textContent = `${totalScore}/25`;
    document.getElementById('ulciTotalFill').style.width = `${percentage}%`;
    document.getElementById('ulciPercentage').textContent = `${percentage.toFixed(1)}%`;
    
    return { totalScore, percentage };
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
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
            photoPreview.innerHTML = `<img src="${e.target.result}" alt="Profile Photo">`;
        };
        reader.readAsDataURL(file);
    }
}

function openSignaturePad() {
    // Create modal for signature
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 200;
    canvas.style.cssText = `
        background: white;
        border-radius: 8px;
        cursor: crosshair;
    `;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        margin-top: 20px;
        display: flex;
        gap: 10px;
    `;
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Signature';
    saveBtn.onclick = function() {
        const signatureDataUrl = canvas.toDataURL();
        const signaturePreview = document.getElementById('signaturePreview');
        signaturePreview.innerHTML = `<img src="${signatureDataUrl}" alt="Signature">`;
        signaturePreview.dataset.signature = signatureDataUrl;
        document.body.removeChild(modal);
    };
    
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.className = 'secondary';
    clearBtn.onclick = function() {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'secondary';
    cancelBtn.onclick = function() {
        document.body.removeChild(modal);
    };
    
    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(clearBtn);
    buttonContainer.appendChild(cancelBtn);
    
    modal.appendChild(canvas);
    modal.appendChild(buttonContainer);
    document.body.appendChild(modal);
    
    // Initialize signature drawing
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile devices
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
    
    function handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        if (e.type === 'touchstart') {
            startDrawing(mouseEvent);
        } else if (e.type === 'touchmove') {
            draw(mouseEvent);
        }
    }
    
    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }
    
    function draw(e) {
        if (!isDrawing) return;
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
}

function updateQRCode() {
    const qrContainer = document.getElementById('qrCode');
    qrContainer.innerHTML = '';
    
    // Generate QR code with assessment data
    const assessmentData = {
        name: document.getElementById('facilitatorName').value || 'Facilitator Name',
        uhanId: document.getElementById('uhanId').value || 'UHAN12345',
        ulpToken: document.getElementById('ulpToken').value || 'ULP67890',
        timestamp: new Date().toISOString()
    };
    
    const qrText = JSON.stringify(assessmentData);
    new QRCode(qrContainer, {
        text: qrText,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

function saveAssessment() {
    // Validate required fields
    if (!validateForm()) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
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
        ulciTotal: calculateULCITotal().totalScore,
        comments: document.getElementById('facilitatorComments').value,
        photo: document.getElementById('photoPreview').querySelector('img')?.src || '',
        signature: document.getElementById('signaturePreview').dataset.signature || '',
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('facilitatorAssessment', JSON.stringify(data));
    showToast("✅ Facilitator Assessment Saved Successfully!");
    
    // Update QR code with new data
    updateQRCode();
    
    // Update last sync time
    document.getElementById('lastSync').textContent = new Date().toLocaleTimeString();
}

function validateForm() {
    const requiredFields = [
        'facilitatorName', 'uhanId', 'ulpToken', 'ulciId', 
        'email', 'contact', 'institution'
    ];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.focus();
            return false;
        }
    }
    
    return true;
}

function loadAssessment() {
    const data = JSON.parse(localStorage.getItem('facilitatorAssessment'));
    
    if (data) {
        document.getElementById('facilitatorName').value = data.name || '';
        document.getElementById('uhanId').value = data.uhanId || '';
        document.getElementById('ulpToken').value = data.ulpToken || '';
        document.getElementById('ulciId').value = data.ulciId || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('contact').value = data.contact || '';
        document.getElementById('institution').value = data.institution || '';
        document.getElementById('address').value = data.address || '';
        document.getElementById('engagement').value = data.engagement || 3;
        document.getElementById('udl').value = data.udl || 3;
        document.getElementById('pedagogy').value = data.pedagogy || 3;
        document.getElementById('feedback').value = data.feedback || 3;
        document.getElementById('ethics').value = data.ethics || 3;
        document.getElementById('facilitatorComments').value = data.comments || '';
        
        // Update slider values display
        updateSliderValue('engagement', data.engagement || 3);
        updateSliderValue('udl', data.udl || 3);
        updateSliderValue('pedagogy', data.pedagogy || 3);
        updateSliderValue('feedback', data.feedback || 3);
        updateSliderValue('ethics', data.ethics || 3);
        
        // Update ULCI Total Score
        calculateULCITotal();
        
        // Update photo if available
        if (data.photo) {
            document.getElementById('photoPreview').innerHTML = `<img src="${data.photo}" alt="Profile Photo">`;
        }
        
        // Update signature if available
        if (data.signature) {
            document.getElementById('signaturePreview').innerHTML = `<img src="${data.signature}" alt="Signature">`;
            document.getElementById('signaturePreview').dataset.signature = data.signature;
        }
        
        showToast("✅ Assessment Data Loaded Successfully!");
        
        // Update QR code with loaded data
        updateQRCode();
    } else {
        showToast("❌ No saved assessment found.", "error");
    }
}

function generateReport() {
    // Validate form before generating report
    if (!validateForm()) {
        showToast('Please fill all required fields before generating report', 'error');
        return;
    }
    
    // Populate report with current data
    document.getElementById('reportName').textContent = document.getElementById('facilitatorName').value;
    document.getElementById('reportInstitution').textContent = document.getElementById('institution').value;
    document.getElementById('reportUhanId').textContent = document.getElementById('uhanId').value;
    document.getElementById('reportUlpId').textContent = document.getElementById('ulpToken').value;
    document.getElementById('reportUlciId').textContent = document.getElementById('ulciId').value;
    document.getElementById('reportEmail').textContent = document.getElementById('email').value;
    document.getElementById('reportContact').textContent = document.getElementById('contact').value;
    
    // Set photo in report
    const photoImg = document.getElementById('photoPreview').querySelector('img');
    if (photoImg) {
        document.getElementById('reportPhoto').src = photoImg.src;
    } else {
        document.getElementById('reportPhoto').src = '';
    }
    
    // Set signature in report
    const signatureData = document.getElementById('signaturePreview').dataset.signature;
    if (signatureData) {
        document.getElementById('reportSignature').src = signatureData;
    } else {
        document.getElementById('reportSignature').src = '';
    }
    
    // Set assessment results
    document.getElementById('reportEngagement').textContent = document.getElementById('engagement').value + '/5';
    document.getElementById('reportUdl').textContent = document.getElementById('udl').value + '/5';
    document.getElementById('reportPedagogy').textContent = document.getElementById('pedagogy').value + '/5';
    document.getElementById('reportFeedback').textContent = document.getElementById('feedback').value + '/5';
    document.getElementById('reportEthics').textContent = document.getElementById('ethics').value + '/5';
    
    // Calculate and set ULCI Total Score
    const ulciData = calculateULCITotal();
    document.getElementById('reportUlciTotal').textContent = ulciData.totalScore + '/25';
    
    // Update gauge visualization
    const gaugeFill = document.getElementById('gaugeFill');
    const gaugePercentage = document.getElementById('gaugePercentage');
    gaugeFill.style.height = `${ulciData.percentage}%`;
    gaugePercentage.textContent = `${ulciData.percentage.toFixed(1)}%`;
    
    // Set comments
    document.getElementById('reportComments').textContent = document.getElementById('facilitatorComments').value || 'No comments provided.';
    
    // Generate QR code for report
    const reportQrContainer = document.getElementById('reportQrCode');
    reportQrContainer.innerHTML = '';
    
    const reportData = {
        name: document.getElementById('facilitatorName').value,
        uhanId: document.getElementById('uhanId').value,
        overallScore: ulciData.percentage.toFixed(1),
        timestamp: new Date().toISOString()
    };
    
    const qrText = JSON.stringify(reportData);
    new QRCode(reportQrContainer, {
        text: qrText,
        width: 120,
        height: 120,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Show the report card
    document.getElementById('reportCard').style.display = 'block';
    
    // Scroll to report
    document.getElementById('reportCard').scrollIntoView({ behavior: 'smooth' });
    
    showToast("📊 Report Generated Successfully!");
}

function downloadPdf() {
    showToast("🔄 Generating PDF Report...", "warning");
    
    // Use html2canvas to capture the report card
    const reportCard = document.getElementById('reportCard');
    
    html2canvas(reportCard, {
        scale: 2,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Save the PDF
        const fileName = `UHAN_Facilitator_Report_${document.getElementById('facilitatorName').value}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        showToast("✅ PDF Report Downloaded Successfully!");
    }).catch(error => {
        console.error('Error generating PDF:', error);
        showToast("❌ Error generating PDF report", "error");
    });
}

function closeReport() {
    document.getElementById('reportCard').style.display = 'none';
}

// Google Drive Integration
let googleAccessToken = null;

function initGoogleDrive() {
    // Load Google API client
    gapi.load('client:auth2', initGoogleClient);
}

function initGoogleClient() {
    gapi.client.init({
        apiKey: 'YOUR_API_KEY', // Replace with your API key
        clientId: 'YOUR_CLIENT_ID', // Replace with your OAuth client ID
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        scope: 'https://www.googleapis.com/auth/drive.file'
    }).then(function() {
        console.log('Google Drive API initialized');
    }).catch(function(error) {
        console.error('Error initializing Google Drive API:', error);
    });
}

function saveToGoogleDrive() {
    if (!validateForm()) {
        showToast('Please fill all required fields before saving to Google Drive', 'error');
        return;
    }
    
    showToast("🔄 Connecting to Google Drive...", "warning");
    
    // Authenticate with Google
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
        authInstance.signIn().then(() => {
            uploadToGoogleDrive();
        }).catch(error => {
            console.error('Google Sign-In failed:', error);
            showToast("❌ Google Sign-In failed", "error");
        });
    } else {
        uploadToGoogleDrive();
    }
}

function uploadToGoogleDrive() {
    showToast("🔄 Uploading to Google Drive...", "warning");
    
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
        ulciTotal: calculateULCITotal().totalScore,
        comments: document.getElementById('facilitatorComments').value,
        timestamp: new Date().toISOString()
    };
    
    const fileContent = JSON.stringify(data, null, 2);
    const blob = new Blob([fileContent], {type: 'application/json'});
    
    const metadata = {
        name: `UHAN_Facilitator_${data.name}_${data.ulciId}_${new Date().toISOString().split('T')[0]}.json`,
        mimeType: 'application/json',
        parents: ['root'] // Save to root folder, you can specify a folder ID
    };
    
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    formData.append('file', blob);
    
    fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + gapi.auth.getToken().access_token
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('File uploaded to Google Drive:', data);
        showToast("✅ Assessment saved to Google Drive successfully!");
        
        // Update last sync time
        document.getElementById('lastSync').textContent = new Date().toLocaleTimeString();
    })
    .catch(error => {
        console.error('Error uploading to Google Drive:', error);
        showToast("❌ Error saving to Google Drive", "error");
        
        // Fallback to localStorage
        showToast("🔄 Saving to local storage instead...", "warning");
        saveAssessment();
    });
}

function updateBlockchainStatus() {
    const statusElement = document.querySelector('.blockchain-status i');
    const statusText = document.querySelector('.blockchain-status');
    
    // Toggle between different status icons
    if (statusElement.classList.contains('fa-shield-alt')) {
        statusElement.classList.remove('fa-shield-alt');
        statusElement.classList.add('fa-link');
        statusText.innerHTML = `<i class="fas fa-link"></i> Quantum Blockchain Synchronizing...`;
    } else if (statusElement.classList.contains('fa-link')) {
        statusElement.classList.remove('fa-link');
        statusElement.classList.add('fa-check-circle');
        statusText.innerHTML = `<i class="fas fa-check-circle"></i> Quantum Blockchain Verified`;
    } else {
        statusElement.classList.remove('fa-check-circle');
        statusElement.classList.add('fa-shield-alt');
        statusText.innerHTML = `<i class="fas fa-shield-alt"></i> Secured with Quantum Blockchain Technology`;
    }
    
    // Update last sync time
    document.getElementById('lastSync').textContent = new Date().toLocaleTimeString();
}

// Toast notification system
function showToast(message, type = 'success') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Hide toast after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 5000);
}


