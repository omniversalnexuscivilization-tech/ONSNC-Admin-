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
    const qr = qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    document.getElementById(elementId).innerHTML = qr.createImgTag(5);
}

// Generate random token ID
function generateTokenId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = 'ULP-';
    for (let i = 0; i < 4; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    token += '-';
    for (let i = 0; i < 4; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

// Update ULP Card with form data
function updateULPCard(formData) {
    // Update card details
    document.getElementById('card-name').textContent = formData.fullName;
    document.getElementById('card-citizen-id').textContent = formData.citizenId;
    document.getElementById('card-archetype').textContent = formData.archetype;
    document.getElementById('card-address').textContent = formData.address;
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
    
    // Generate and update token and QR code
    const tokenId = generateTokenId();
    document.getElementById('token-id').textContent = tokenId;
    generateQRCode(tokenId, 'qr-code');
    
    // Update dashboard
    updateDashboard(formData);
}

// Update dashboard with form data
function updateDashboard(formData) {
    document.getElementById('dashboard-name').textContent = formData.fullName;
    document.getElementById('dashboard-citizen-id').textContent = `Global Citizen ID: ${formData.citizenId}`;
    document.getElementById('dashboard-archetype').textContent = formData.archetype;
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
    
    // Update LCI scores (calculate based on form data)
    const educationScore = parseInt(formData.education) || 0;
    const healthScore = parseInt(formData.health) || 0;
    const environmentScore = parseInt(formData.environment) || 0;
    const technologyScore = parseInt(formData.technology) || 0;
    const governanceScore = parseInt(formData.governance) || 0;
    const economyScore = parseInt(formData.economy) || 0;
    
    document.getElementById('lci-education').textContent = educationScore;
    document.getElementById('lci-ecology').textContent = environmentScore;
    document.getElementById('lci-technology').textContent = technologyScore;
    document.getElementById('lci-global').textContent = governanceScore;
    
    // Calculate overall LCI
    const overallLCI = Math.round((educationScore + healthScore + environmentScore + 
                                  technologyScore + governanceScore + economyScore) / 6);
    document.getElementById('overall-lci').textContent = overallLCI;
    
    // Update other dashboard stats
    document.getElementById('dashboard-contributions').textContent = Math.round(overallLCI * 4.5);
    document.getElementById('dashboard-sectors').textContent = 6; // Fixed for now
    document.getElementById('dashboard-impact').textContent = (overallLCI / 10).toFixed(1);
    document.getElementById('dashboard-validations').textContent = Math.round(overallLCI * 2);
}

// Download ULP Card as image
function downloadULPCard() {
    const cardElement = document.getElementById('ulp-card');
    
    html2canvas(cardElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'ULP-Card.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

// Reset form and card
function resetForm() {
    document.getElementById('ulp-form').reset();
    
    // Reset card to default state
    document.getElementById('card-name').textContent = '-';
    document.getElementById('card-citizen-id').textContent = '-';
    document.getElementById('card-archetype').textContent = '-';
    document.getElementById('card-address').textContent = '-';
    document.getElementById('card-education').textContent = '-';
    document.getElementById('card-health').textContent = '-';
    document.getElementById('card-environment').textContent = '-';
    document.getElementById('card-technology').textContent = '-';
    document.getElementById('card-governance').textContent = '-';
    document.getElementById('card-economy').textContent = '-';
    document.getElementById('card-photo').innerHTML = '<span>Photo</span>';
    document.getElementById('card-signature').textContent = 'Signature';
    document.getElementById('token-id').textContent = 'ULP-TOKEN-XXXX-XXXX';
    document.getElementById('qr-code').innerHTML = '';
    
    // Reset dashboard to default state
    document.getElementById('dashboard-name').textContent = 'Aari Sen';
    document.getElementById('dashboard-citizen-id').textContent = 'Global Citizen ID: QM-2025-789';
    document.getElementById('dashboard-archetype').textContent = '🌱 Guardian–Innovator';
    document.getElementById('dashboard-address').innerHTML = 'Sector 7, Harmony District<br>New Terra Prime';
    document.getElementById('dashboard-avatar').innerHTML = '👤';
    
    // Reset all stats to default
    const defaultStats = {
        'sector-education': '47',
        'sector-health': '98.7%',
        'sector-environment': '2.4T',
        'sector-technology': '23',
        'sector-governance': '89%',
        'sector-economy': '8.9',
        'lci-education': '85',
        'lci-mentorship': '70',
        'lci-ecology': '92',
        'lci-technology': '65',
        'lci-community': '60',
        'lci-arts': '45',
        'lci-global': '90',
        'overall-lci': '77',
        'dashboard-contributions': '342',
        'dashboard-sectors': '12',
        'dashboard-impact': '8.9',
        'dashboard-validations': '156'
    };
    
    for (const [id, value] of Object.entries(defaultStats)) {
        document.getElementById(id).textContent = value;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    generateParticles();
    
    // Form submission
    document.getElementById('ulp-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            fullName: document.getElementById('full-name').value,
            citizenId: document.getElementById('citizen-id').value,
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
    
    // Download button
    document.getElementById('download-btn').addEventListener('click', downloadULPCard);
    
    // Reset button
    document.getElementById('reset-btn').addEventListener('click', resetForm);
});
