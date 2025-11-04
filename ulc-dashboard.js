/**
 * UNETS Certificate System - JavaScript
 * Version: 3.0.0
 * Optimized for Performance and Fast Loading
 */

// =================== GLOBAL VARIABLES ===================
let qrCodeInstance = null;
let autoPreviewEnabled = true;

// =================== INITIALIZATION ===================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize all event listeners
    setupNavigation();
    setupFormListeners();
    setupAutoPreview();
    
    // Generate initial IDs
    generateUniqueIds();
    
    // Set today's date
    setTodayDate();
    
    // Initial preview update
    updatePreview();
    
    console.log('UNETS Certificate System Initialized - v3.0.0');
}

// =================== NAVIGATION & SIDEBAR ===================
function setupNavigation() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const closeSidebar = document.getElementById('closeSidebar');
    
    // Open sidebar
    hamburgerBtn.addEventListener('click', function() {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
        this.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Close sidebar
    function closeNav() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    closeSidebar.addEventListener('click', closeNav);
    sidebarOverlay.addEventListener('click', closeNav);
    
    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeNav();
        }
    });
    
    // Menu item clicks
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            closeNav();
        });
    });
}

// =================== FORM LISTENERS ===================
function setupFormListeners() {
    // Preview button
    document.getElementById('previewBtn').addEventListener('click', function() {
        updatePreview();
        showNotification('Preview updated!', 'success');
    });
    
    // Generate PDF button
    document.getElementById('generatePdfBtn').addEventListener('click', generatePDF);
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the form?')) {
            document.getElementById('certificateForm').reset();
            generateUniqueIds();
            setTodayDate();
            updatePreview();
            showNotification('Form reset successfully!', 'info');
        }
    });
    
    // Auto preview toggle
    document.getElementById('autoPreview').addEventListener('change', function() {
        autoPreviewEnabled = this.checked;
        if (autoPreviewEnabled) {
            showNotification('Auto preview enabled', 'info');
        } else {
            showNotification('Auto preview disabled', 'info');
        }
    });
}

// =================== AUTO PREVIEW ===================
function setupAutoPreview() {
    const formInputs = document.querySelectorAll('#certificateForm input, #certificateForm select');
    
    formInputs.forEach(input => {
        // Debounce for better performance
        let timeout;
        input.addEventListener('input', function() {
            if (autoPreviewEnabled) {
                clearTimeout(timeout);
                timeout = setTimeout(updatePreview, 300);
            }
        });
    });
}

// =================== ID GENERATION ===================
function generateUniqueIds() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = () => Math.random().toString(36).substring(2, 7).toUpperCase();
    
    document.getElementById('ulpId').value = `ULP-2025-${timestamp}${random()}`;
    document.getElementById('ulcId').value = `ULC-2025-${timestamp}${random()}`;
    document.getElementById('ulciId').value = `ULCI-2025-${timestamp}${random()}`;
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateIssued').value = today;
}

// =================== PREVIEW UPDATE ===================
function updatePreview() {
    // Get form values with defaults
    const data = {
        learnerName: document.getElementById('learnerName').value || '[Learner Name]',
        parentName: document.getElementById('parentName').value || '[Parent\'s Name]',
        placeName: document.getElementById('placeName').value || '[City, State]',
        institution: document.getElementById('institution').value || '[Institution]',
        programTitle: document.getElementById('programTitle').value || '[Program Title]',
        badgeName: document.getElementById('badgeName').value || '[Badge Name]',
        ulpId: document.getElementById('ulpId').value || 'ULP-2025-XXXX',
        ulcId: document.getElementById('ulcId').value || 'ULC-2025-XXXX',
        ulciId: document.getElementById('ulciId').value || 'ULCI-2025-XXXX',
        ulciScore: document.getElementById('ulciScore').value || '95%',
        indexLevel: document.getElementById('indexLevel').value || 'Level 1',
        knowledgeScore: document.getElementById('knowledgeScore').value || '95%',
        creativity: document.getElementById('creativity').value || 'Advanced',
        collaboration: document.getElementById('collaboration').value || '88%',
        leadership: document.getElementById('leadership').value || 'High Impact',
        dateIssued: document.getElementById('dateIssued').value,
        verifiedBy: document.getElementById('verifiedBy').value || '[Mentor Name]'
    };
    
    // Update preview elements
    document.getElementById('ulcSerial').textContent = data.ulcId;
    document.getElementById('previewBadge').textContent = `Metamorphic Badge: ${data.badgeName}`;
    document.getElementById('previewLearnerName').textContent = data.learnerName;
    document.getElementById('previewInstitution').textContent = `of ${data.institution}`;
    document.getElementById('previewParent').textContent = data.parentName;
    
    document.getElementById('previewUlpId').textContent = data.ulpId;
    document.getElementById('previewUlcId').textContent = data.ulcId;
    document.getElementById('previewUlciId').textContent = data.ulciId;
    document.getElementById('previewUlciScore').textContent = data.ulciScore;
    document.getElementById('previewIndexLevel').textContent = data.indexLevel;
    document.getElementById('previewPlace').textContent = data.placeName;
    
    document.getElementById('previewProgram').textContent = `"${data.programTitle}"`;
    
    document.getElementById('previewKnowledge').textContent = data.knowledgeScore;
    document.getElementById('previewCreativity').textContent = data.creativity;
    document.getElementById('previewCollaboration').textContent = data.collaboration;
    document.getElementById('previewLeadership').textContent = data.leadership;
    
    // Format date
    if (data.dateIssued) {
        const date = new Date(data.dateIssued);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        document.getElementById('previewDate').textContent = formattedDate;
    }
    
    document.getElementById('previewVerifiedBy').textContent = data.verifiedBy;
    
    // Generate credential ID
    const credentialId = `UNETS-CERT-2025-${Date.now().toString().slice(-9)}`;
    document.getElementById('previewCredentialId').textContent = credentialId;
    document.getElementById('previewVerificationUrl').textContent = `verify.education.onsnc.org/${credentialId}`;
    
    // Generate QR Code
    generateQRCode(data.ulcId);
}

// =================== QR CODE GENERATION ===================
function generateQRCode(ulcId) {
    const qrContainer = document.getElementById('qrContainer');
    
    // Remove existing QR code
    const existingQR = qrContainer.querySelector('.qr-code-canvas');
    if (existingQR) {
        existingQR.remove();
    }
    
    // Create new QR code container
    const qrDiv = document.createElement('div');
    qrDiv.className = 'qr-code-canvas';
    qrDiv.style.position = 'absolute';
    qrDiv.style.top = '5px';
    qrDiv.style.left = '5px';
    qrDiv.style.width = '60px';
    qrDiv.style.height = '60px';
    
    qrContainer.insertBefore(qrDiv, qrContainer.firstChild);
    
    // Generate QR code
    try {
        new QRCode(qrDiv, {
            text: `https://verify.education.onsnc.org/${ulcId}`,
            width: 60,
            height: 60,
            colorDark: '#ffffff',
            colorLight: 'transparent',
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (error) {
        console.error('QR Code generation error:', error);
        qrDiv.innerHTML = '<div style="color: white; font-size: 10px; text-align: center; line-height: 60px;">QR</div>';
    }
}

// =================== PDF GENERATION ===================
async function generatePDF() {
    const learnerName = document.getElementById('learnerName').value;
    
    // Validation
    if (!learnerName) {
        showNotification('Please enter learner name to generate certificate.', 'error');
        return;
    }
    
    const btn = document.getElementById('generatePdfBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating PDF...';
    
    try {
        // Update preview one last time
        updatePreview();
        
        // Wait for QR code to render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const certificate = document.getElementById('certificatePreview');
        
        // Show loading notification
        showNotification('Capturing certificate...', 'info');
        
        // Capture certificate as image with high quality
        const canvas = await html2canvas(certificate, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: 794,
            height: 1123,
            windowWidth: 794,
            windowHeight: 1123
        });
        
        showNotification('Creating PDF...', 'info');
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });
        
        // Add image to PDF (A4: 210mm x 297mm)
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, '', 'FAST');
        
        // Generate filename
        const ulcId = document.getElementById('ulcId').value;
        const sanitizedName = learnerName.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `ULC_Certificate_${sanitizedName}_${ulcId}.pdf`;
        
        // Save PDF
        pdf.save(filename);
        
        showNotification('PDF generated successfully!', 'success');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-file-pdf me-2"></i>Generate PDF Certificate';
    }
}

// =================== NOTIFICATION SYSTEM ===================
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification-toast');
    if (existing) {
        existing.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    
    const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-exclamation-circle"></i>',
        info: '<i class="fas fa-info-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>'
    };
    
    notification.innerHTML = `
        ${icons[type]}
        <span>${message}</span>
    `;
    
    // Styling
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.9rem;
        animation: slideInRight 0.3s ease-out;
        min-width: 250px;
    `;
    
    // Type-specific colors
    const colors = {
        success: '#4CAF50',
        error: '#F44336',
        info: '#2196F3',
        warning: '#FF9800'
    };
    
    notification.style.borderLeft = `4px solid ${colors[type]}`;
    notification.querySelector('i').style.color = colors[type];
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// =================== KEYBOARD SHORTCUTS ===================
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + P for PDF generation
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        document.getElementById('generatePdfBtn').click();
    }
    
    // Ctrl/Cmd + U for update preview
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        updatePreview();
        showNotification('Preview updated!', 'success');
    }
    
    // Ctrl/Cmd + R for reset (prevent default browser refresh)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r' && e.shiftKey) {
        e.preventDefault();
        document.getElementById('resetBtn').click();
    }
});

// =================== FORM VALIDATION ===================
function validateForm() {
    const requiredFields = [
        'learnerName',
        'parentName',
        'placeName',
        'institution',
        'programTitle',
        'badgeName'
    ];
    
    let isValid = true;
    const errors = [];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.style.borderColor = '#F44336';
            isValid = false;
            errors.push(field.previousElementSibling.textContent);
        } else {
            field.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        showNotification(`Please fill: ${errors.join(', ')}`, 'error');
    }
    
    return isValid;
}

// =================== LOCAL STORAGE ===================
function saveFormData() {
    const formData = {};
    const inputs = document.querySelectorAll('#certificateForm input, #certificateForm select');
    
    inputs.forEach(input => {
        formData[input.id] = input.value;
    });
    
    localStorage.setItem('ulc_form_data', JSON.stringify(formData));
}

function loadFormData() {
    const savedData = localStorage.getItem('ulc_form_data');
    
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            Object.keys(formData).forEach(key => {
                const element = document.getElementById(key);
                if (element && !element.readOnly) {
                    element.value = formData[key];
                }
            });
            updatePreview();
            showNotification('Form data loaded from previous session', 'info');
        } catch (error) {
            console.error('Error loading form data:', error);
        }
    }
}

// Auto-save form data every 30 seconds
setInterval(saveFormData, 30000);

// Load form data on page load
window.addEventListener('load', function() {
    // Uncomment to enable auto-load
    // loadFormData();
});

// =================== PERFORMANCE OPTIMIZATION ===================
// Lazy load images if any
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
}

// Log performance metrics
window.addEventListener('load', function() {
    if (window.performance) {
        const perfData = window.performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page Load Time: ${loadTime}ms`);
    }
});

// =================== ACCESSIBILITY ===================
// Add ARIA labels dynamically
document.querySelectorAll('.form-control').forEach(input => {
    if (!input.getAttribute('aria-label')) {
        const label = input.previousElementSibling;
        if (label && label.tagName === 'LABEL') {
            input.setAttribute('aria-label', label.textContent);
        }
    }
});

// =================== ERROR HANDLING ===================
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showNotification('An error occurred. Please refresh the page.', 'error');
});

// =================== EXPORT ===================
console.log('✓ UNETS Certificate System Ready');
console.log('✓ Navigation: Hamburger menu enabled');
console.log('✓ Auto Preview: Enabled');
console.log('✓ PDF Generation: Ready');
console.log('✓ Keyboard Shortcuts: Ctrl+P (PDF), Ctrl+U (Update)');
console.log('✓ Performance: Optimized for fast loading');
