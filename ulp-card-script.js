// Counter for generating unique ULP IDs
let ulpCounter = 1;

// Generate floating particles
function generateParticles() {
    const container = document.getElementById('particles');
    setInterval(() => {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        const colors = ['rgba(0, 255, 255, 0.6)', 'rgba(255, 215, 0, 0.6)', 'rgba(255, 107, 107, 0.6)'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        container.appendChild(particle);
        
        setTimeout(() => particle.remove(), 15000);
    }, 200);
}

// Generate QR Code
function generateQRCode(text, elementId) {
    try {
        const qr = qrcode(0, 'M');
        qr.addData(text);
        qr.make();
        const imgTag = qr.createImgTag(4);
        document.getElementById(elementId).innerHTML = imgTag;
    } catch (error) {
        console.error('QR Code generation error:', error);
        document.getElementById(elementId).innerHTML = '<div style="color: #000; font-size: 0.8rem; text-align: center;">QR Code</div>';
    }
}

// Generate ULP ID
function generateULPId() {
    const year = new Date().getFullYear();
    const paddedCounter = String(ulpCounter).padStart(4, '0');
    ulpCounter++;
    return `ULP-IND-ASS-${year}-${paddedCounter}`;
}

// Format date to DD/MM/YYYY
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Update ULP Card with form data
function updateULPCard(formData) {
    // Generate ULP ID
    const ulpId = generateULPId();
    
    // Update card details
    document.getElementById('card-ulp-id').textContent = ulpId;
    document.getElementById('card-name').textContent = formData.fullName;
    document.getElementById('card-father-name').textContent = formData.fatherName;
    document.getElementById('card-mother-name').textContent = formData.motherName;
    document.getElementById('card-dob').textContent = formatDate(formData.dob);
    document.getElementById('card-mobile').textContent = formData.mobile;
    document.getElementById('card-email').textContent = formData.email;
    document.getElementById('card-address').textContent = formData.address;
    document.getElementById('card-archetype').textContent = formData.archetype;
    document.getElementById('card-education').textContent = formData.education;
    document.getElementById('card-health').textContent = formData.health;
    document.getElementById('card-environment').textContent = formData.environment;
    document.getElementById('card-technology').textContent = formData.technology;
    document.getElementById('card-governance').textContent = formData.governance;
    document.getElementById('card-economy').textContent = formData.economy;
    
    // Update photo if available
    if (formData.photo) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('card-photo').innerHTML = `<img src="${e.target.result}" alt="Profile Photo">`;
        };
        reader.readAsDataURL(formData.photo);
    }
    
    // Update signature
    document.getElementById('card-signature').textContent = formData.signature;
    
    // Generate QR code with ULP ID and basic info
    const qrData = `ULP ID: ${ulpId}\nName: ${formData.fullName}\nDOB: ${formatDate(formData.dob)}\nMobile: ${formData.mobile}`;
    generateQRCode(qrData, 'qr-code');
    
    // Update dashboard
    updateDashboard(formData, ulpId);
    
    // Scroll to card
    document.getElementById('ulp-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Update dashboard with form data
function updateDashboard(formData, ulpId) {
    document.getElementById('dashboard-name').textContent = formData.fullName;
    document.getElementById('dashboard-citizen-id').textContent = `Global Citizen ID: ${ulpId}`;
    document.getElementById('dashboard-archetype').textContent = '🌱 ' + formData.archetype;
    document.getElementById('dashboard-address').innerHTML = formData.address.replace(/\n/g, '<br>');
    
    // Update photo in dashboard if available
    if (formData.photo) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('dashboard-avatar').innerHTML = `<img src="${e.target.result}" alt="Profile Photo">`;
        };
        reader.readAsDataURL(formData.photo);
    }
    
    // Update sector scores
    document.getElementById('sector-education').textContent = formData.education;
    document.getElementById('sector-health').textContent = formData.health;
    document.getElementById('sector-environment').textContent = formData.environment;
    document.getElementById('sector-technology').textContent = formData.technology;
    document.getElementById('sector-governance').textContent = formData.governance;
    document.getElementById('sector-economy').textContent = formData.economy;
    
    // Update LCI scores
    const educationScore = parseInt(formData.education) || 0;
    const healthScore = parseInt(formData.health) || 0;
    const environmentScore = parseInt(formData.environment) || 0;
    const technologyScore = parseInt(formData.technology) || 0;
    const governanceScore = parseInt(formData.governance) || 0;
    const economyScore = parseInt(formData.economy) || 0;
    
    document.getElementById('lci-education').textContent = educationScore;
    document.getElementById('lci-health').textContent = healthScore;
    document.getElementById('lci-ecology').textContent = environmentScore;
    document.getElementById('lci-technology').textContent = technologyScore;
    document.getElementById('lci-governance').textContent = governanceScore;
    document.getElementById('lci-economy').textContent = economyScore;
    
    // Calculate overall LCI
    const overallLCI = Math.round((educationScore + healthScore + environmentScore + 
                                  technologyScore + governanceScore + economyScore) / 6);
    document.getElementById('overall-lci').textContent = overallLCI;
    
    // Update other dashboard stats
    document.getElementById('dashboard-contributions').textContent = Math.round(overallLCI * 4.5);
    document.getElementById('dashboard-sectors').textContent = 6;
    document.getElementById('dashboard-impact').textContent = (overallLCI / 10).toFixed(1);
    document.getElementById('dashboard-validations').textContent = Math.round(overallLCI * 2);
}

// Download ULP Card as PDF
function downloadULPCardPDF() {
    const cardElement = document.getElementById('ulp-card');
    
    const opt = {
        margin: 10,
        filename: 'ULP-Card.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#1e3c72'
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'landscape' 
        }
    };
    
    // Show loading message
    const originalHTML = cardElement.innerHTML;
    
    html2pdf().set(opt).from(cardElement).save().then(() => {
        console.log('PDF downloaded successfully');
    }).catch(error => {
        console.error('PDF download error:', error);
        alert('Error downloading PDF. Please try again.');
    });
}

// Download ULP Card as Image
function downloadULPCardImage() {
    const cardElement = document.getElementById('ulp-card');
    
    // Create a temporary container with white background
    const tempContainer = document.createElement('div');
    tempContainer.style.padding = '20px';
    tempContainer.style.background = 'linear-gradient(135deg, #1e3c72, #2a5298)';
    tempContainer.style.display = 'inline-block';
    tempContainer.appendChild(cardElement.cloneNode(true));
    document.body.appendChild(tempContainer);
    
    html2pdf().set({
        margin: 0,
        filename: 'ULP-Card.png',
        image: { type: 'png', quality: 1 },
        html2canvas: { 
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#1e3c72'
        },
        jsPDF: { 
            unit: 'px', 
            format: [tempContainer.offsetWidth, tempContainer.offsetHeight],
            hotfixes: ['px_scaling']
        }
    }).from(tempContainer).outputImg().then((img) => {
        const link = document.createElement('a');
        link.download = 'ULP-Card.png';
        link.href = img.src;
        link.click();
        document.body.removeChild(tempContainer);
    }).catch(error => {
        console.error('Image download error:', error);
        document.body.removeChild(tempContainer);
        alert('Error downloading image. Please try again.');
    });
}

// Reset form and card
function resetForm() {
    document.getElementById('ulp-form').reset();
    
    // Reset ULP ID field
    document.getElementById('citizen-id').value = '';
    
    // Reset card to default state
    document.getElementById('card-ulp-id').textContent = '-';
    document.getElementById('card-name').textContent = '-';
    document.getElementById('card-father-name').textContent = '-';
    document.getElementById('card-mother-name').textContent = '-';
    document.getElementById('card-dob').textContent = '-';
    document.getElementById('card-mobile').textContent = '-';
    document.getElementById('card-email').textContent = '-';
    document.getElementById('card-address').textContent = '-';
    document.getElementById('card-archetype').textContent = '-';
    document.getElementById('card-education').textContent = '-';
    document.getElementById('card-health').textContent = '-';
    document.getElementById('card-environment').textContent = '-';
    document.getElementById('card-technology').textContent = '-';
    document.getElementById('card-governance').textContent = '-';
    document.getElementById('card-economy').textContent = '-';
    document.getElementById('card-photo').innerHTML = '<span>Photo</span>';
    document.getElementById('card-signature').textContent = 'Signature';
    document.getElementById('qr-code').innerHTML = '';
    
    // Reset dashboard to default state
    document.getElementById('dashboard-name').textContent = 'Your Name';
    document.getElementById('dashboard-citizen-id').textContent = 'Global Citizen ID: -';
    document.getElementById('dashboard-archetype').textContent = 'Select Archetype';
    document.getElementById('dashboard-address').innerHTML = 'Address not provided';
    document.getElementById('dashboard-avatar').innerHTML = '👤';
    
    // Reset all stats to default
    const defaultStats = {
        'sector-education': '0',
        'sector-health': '0',
        'sector-environment': '0',
        'sector-technology': '0',
        'sector-governance': '0',
        'sector-economy': '0',
        'lci-education': '0',
        'lci-health': '0',
        'lci-ecology': '0',
        'lci-technology': '0',
        'lci-governance': '0',
        'lci-economy': '0',
        'overall-lci': '0',
        'dashboard-contributions': '0',
        'dashboard-sectors': '6',
        'dashboard-impact': '0.0',
        'dashboard-validations': '0'
    };
    
    for (const [id, value] of Object.entries(defaultStats)) {
        document.getElementById(id).textContent = value;
    }
    
    // Scroll to form
    document.getElementById('ulp-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Generate auto ULP ID when form is being filled
function autoGenerateULPId() {
    const citizenIdField = document.getElementById('citizen-id');
    if (!citizenIdField.value) {
        citizenIdField.value = generateULPId();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    generateParticles();
    
    // Auto-generate ULP ID when name is entered
    document.getElementById('full-name').addEventListener('input', function() {
        if (this.value && !document.getElementById('citizen-id').value) {
            autoGenerateULPId();
        }
    });
    
    // Form submission
    document.getElementById('ulp-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            fullName: document.getElementById('full-name').value,
            fatherName: document.getElementById('father-name').value,
            motherName: document.getElementById('mother-name').value,
            dob: document.getElementById('dob').value,
            mobile: document.getElementById('mobile').value,
            email: document.getElementById('email').value,
            archetype: document.getElementById('archetype').value,
            address: document.getElementById('address').value,
            photo: document.getElementById('photo').files[0],
            signature: document.getElementById('signature').value,
            education: document.getElementById('education').value,
            health: document.getElementById('health').value,
            environment: document.getElementById('environment').value,
            technology: document.getElementById('technology').value,
            governance: document.getElementById('governance').value,
            economy: document.getElementById('economy').value
        };
        
        updateULPCard(formData);
    });
    
    // Download PDF button
    document.getElementById('download-pdf-btn').addEventListener('click', downloadULPCardPDF);
    
    // Download Image button
    document.getElementById('download-img-btn').addEventListener('click', downloadULPCardImage);
    
    // Reset button
    document.getElementById('reset-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
            resetForm();
        }
    });
});
