// Global Variables
let canvas, ctx, drawing = false;
let photoData = '';
let signatureData = '';

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupPhotoUpload();
    setupInputListeners();
    calculateTotal();
    updateReport();
    generateQR();
}

// ========== PHOTO UPLOAD ==========
function setupPhotoUpload() {
    document.getElementById('photoInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            showToast('❌ Please select a valid image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('❌ Image size should be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            photoData = event.target.result;
            document.getElementById('photoPreview').innerHTML = '<img src="' + photoData + '">';
            updateReport();
            showToast('✅ Photo uploaded successfully!');
        };
        reader.readAsDataURL(file);
    });
}

// ========== SIGNATURE PAD ==========
function openSignaturePad() {
    document.getElementById('signatureModal').classList.add('active');
    canvas = document.getElementById('signatureCanvas');
    ctx = canvas.getContext('2d');
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    canvas.onmousedown = startDrawing;
    canvas.onmousemove = draw;
    canvas.onmouseup = stopDrawing;
    canvas.onmouseout = stopDrawing;

    // Touch support for mobile
    canvas.ontouchstart = handleTouchStart;
    canvas.ontouchmove = handleTouchMove;
    canvas.ontouchend = stopDrawing;
}

function startDrawing(e) {
    drawing = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
}

function stopDrawing() {
    drawing = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
}

function handleTouchMove(e) {
    if (!drawing) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
    ctx.stroke();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function saveSignature() {
    signatureData = canvas.toDataURL();
    document.getElementById('signaturePreview').innerHTML = '<img src="' + signatureData + '">';
    closeModal();
    updateReport();
    showToast('✅ Signature saved successfully!');
}

function closeModal() {
    document.getElementById('signatureModal').classList.remove('active');
}

// ========== SLIDER FUNCTIONS ==========
function updateSlider(num) {
    const slider = document.getElementById('slider' + num);
    const value = slider.value;
    
    document.getElementById('val' + num).textContent = value;
    document.getElementById('bar' + num).style.width = (value * 20) + '%';
    
    calculateTotal();
    updateReport();
}

function calculateTotal() {
    let total = 0;
    for (let i = 1; i <= 5; i++) {
        const value = parseInt(document.getElementById('slider' + i).value);
        total += value;
    }
    
    const percentage = ((total / 25) * 100).toFixed(1);
    
    document.getElementById('totalScore').textContent = total + '/25';
    document.getElementById('percentage').textContent = percentage + '%';
    
    return { total, percentage };
}

// ========== UPDATE REPORT PREVIEW ==========
function updateReport() {
    // Personal Information
    const name = document.getElementById('name').value || 'Facilitator Name';
    const institution = document.getElementById('institution').value || 'Institution';
    const uhanId = document.getElementById('uhanId').value || 'N/A';
    const ulpId = document.getElementById('ulpId').value || 'N/A';
    const ulciId = document.getElementById('ulciId').value || 'N/A';
    const email = document.getElementById('email').value || 'N/A';
    const contact = document.getElementById('contact').value || 'N/A';
    const comments = document.getElementById('comments').value || 'No comments provided.';

    document.getElementById('reportName').textContent = name;
    document.getElementById('reportInst').textContent = institution;
    document.getElementById('reportUhan').textContent = uhanId;
    document.getElementById('reportUlp').textContent = ulpId;
    document.getElementById('reportUlci').textContent = ulciId;
    document.getElementById('reportEmail').textContent = email;
    document.getElementById('reportContact').textContent = contact;
    document.getElementById('reportComments').textContent = comments;

    // Photo
    if (photoData) {
        document.getElementById('reportPhoto').innerHTML = '<img src="' + photoData + '">';
    } else {
        document.getElementById('reportPhoto').innerHTML = '<span>📷</span>';
    }

    // Signature
    if (signatureData) {
        document.getElementById('reportSignature').innerHTML = '<img src="' + signatureData + '">';
    } else {
        document.getElementById('reportSignature').innerHTML = '<span>-</span>';
    }

    // Assessment Scores
    const scores = [];
    for (let i = 1; i <= 5; i++) {
        const value = document.getElementById('slider' + i).value;
        document.getElementById('r' + i).textContent = value + '/5';
        scores.push(value);
    }

    // Calculate ULCI Total
    const { total, percentage } = calculateTotal();
    document.getElementById('reportTotal').innerHTML = '<strong>' + total + '/25 (' + percentage + '%)</strong>';

    // Update Formula Details
    document.getElementById('formulaDetail').textContent = 
        'E = Engagement (' + scores[0] + ') | ' +
        'S = UDL (' + scores[1] + ') | ' +
        'C = Pedagogy (' + scores[2] + ') | ' +
        'H = Feedback (' + scores[3] + ') | ' +
        'I = Ethics (' + scores[4] + ')';

    document.getElementById('formulaResult').textContent = 
        'Total Score: ' + total + '/25 = ' + percentage + '%';

    // Update Gauge
    const gaugeCircle = document.querySelector('.gauge-circle');
    gaugeCircle.style.setProperty('--percentage', percentage + '%');
    document.getElementById('gaugeValue').textContent = percentage + '%';

    // Update QR Code
    generateQR();
}

// ========== QR CODE GENERATION ==========
function generateQR() {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';

    const { total, percentage } = calculateTotal();
    
    const qrData = {
        name: document.getElementById('name').value || 'Facilitator',
        uhanId: document.getElementById('uhanId').value || 'UHAN-ID',
        ulciScore: total,
        percentage: percentage,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toLocaleString()
    };

    try {
        new QRCode(qrContainer, {
            text: JSON.stringify(qrData),
            width: 120,
            height: 120,
            colorDark: '#667eea',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (error) {
        console.error('QR Code generation error:', error);
        qrContainer.innerHTML = '<div style="width:120px;height:120px;background:#667eea;color:white;display:flex;align-items:center;justify-content:center;border-radius:10px;font-size:0.8rem;text-align:center;font-weight:bold;">QR<br/>Code</div>';
    }
}

// ========== SAVE DATA ==========
function saveData() {
    const name = document.getElementById('name').value;
    const uhanId = document.getElementById('uhanId').value;
    const email = document.getElementById('email').value;

    if (!name || !uhanId || !email) {
        showToast('❌ Please fill required fields: Name, UHAN ID, Email', 'error');
        return;
    }

    const data = {
        name: name,
        uhanId: uhanId,
        ulpId: document.getElementById('ulpId').value,
        ulciId: document.getElementById('ulciId').value,
        email: email,
        contact: document.getElementById('contact').value,
        institution: document.getElementById('institution').value,
        address: document.getElementById('address').value,
        slider1: document.getElementById('slider1').value,
        slider2: document.getElementById('slider2').value,
        slider3: document.getElementById('slider3').value,
        slider4: document.getElementById('slider4').value,
        slider5: document.getElementById('slider5').value,
        comments: document.getElementById('comments').value,
        photo: photoData,
        signature: signatureData,
        savedDate: new Date().toISOString()
    };

    try {
        localStorage.setItem('uhanAssessment', JSON.stringify(data));
        showToast('✅ Assessment saved successfully!');
    } catch (error) {
        console.error('Save error:', error);
        showToast('❌ Error saving assessment', 'error');
    }
}

// ========== LOAD DATA ==========
function loadData() {
    try {
        const savedData = localStorage.getItem('uhanAssessment');
        
        if (!savedData) {
            showToast('❌ No saved assessment found', 'error');
            return;
        }

        const data = JSON.parse(savedData);

        // Load form fields
        document.getElementById('name').value = data.name || '';
        document.getElementById('uhanId').value = data.uhanId || '';
        document.getElementById('ulpId').value = data.ulpId || '';
        document.getElementById('ulciId').value = data.ulciId || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('contact').value = data.contact || '';
        document.getElementById('institution').value = data.institution || '';
        document.getElementById('address').value = data.address || '';
        document.getElementById('comments').value = data.comments || '';

        // Load slider values
        for (let i = 1; i <= 5; i++) {
            const value = data['slider' + i] || 3;
            document.getElementById('slider' + i).value = value;
            updateSlider(i);
        }

        // Load photo
        if (data.photo) {
            photoData = data.photo;
            document.getElementById('photoPreview').innerHTML = '<img src="' + photoData + '">';
        }

        // Load signature
        if (data.signature) {
            signatureData = data.signature;
            document.getElementById('signaturePreview').innerHTML = '<img src="' + signatureData + '">';
        }

        calculateTotal();
        updateReport();
        showToast('✅ Assessment loaded successfully!');
    } catch (error) {
        console.error('Load error:', error);
        showToast('❌ Error loading assessment', 'error');
    }
}

// ========== TOAST NOTIFICATION ==========
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    
    if (type === 'error') {
        toast.style.background = '#dc3545';
    } else if (type === 'warning') {
        toast.style.background = '#ffc107';
    } else {
        toast.style.background = '#28a745';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========== INPUT LISTENERS ==========
function setupInputListeners() {
    const inputs = ['name', 'uhanId', 'ulpId', 'ulciId', 'email', 'contact', 'institution', 'address', 'comments'];
    
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', updateReport);
        }
    });
}

// ========== INITIALIZATION ==========
// Initialize sliders on load
for (let i = 1; i <= 5; i++) {
    updateSlider(i);
}
