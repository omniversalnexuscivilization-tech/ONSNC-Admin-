/**
 * UNETS Certificate System - JavaScript
 * Version: 3.0.1 - Fixed Hamburger Menu & Auto-Submit
 * Optimized for Performance
 */

// =================== INITIALIZATION ===================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupFormSubmit();
    generateUniqueIds();
    setTodayDate();
    updatePreview();
    
    console.log('✓ UNETS Certificate System v3.0.1 Ready');
    console.log('✓ Hamburger Menu: Working on Right Side');
    console.log('✓ Auto-Submit: Enabled');
}

// =================== NAVIGATION & SIDEBAR ===================
function setupNavigation() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const closeSidebar = document.getElementById('closeSidebar');
    
    // Open sidebar
    hamburgerBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
        this.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Close sidebar function
    function closeNav() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        hamburgerBtn.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Close button
    closeSidebar.addEventListener('click', closeNav);
    
    // Click overlay to close
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
            showNotification(`Navigating to ${this.textContent.trim()}`, 'info');
        });
    });
}

// =================== FORM SUBMIT & AUTO-GENERATE ===================
function setupFormSubmit() {
    const form = document.getElementById('certificateForm');
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // Save data
            saveFormData();
            
            // Update preview
            updatePreview();
            
            // Show success message
            showNotification('Certificate data saved! Generating PDF...', 'success');
            
            // Auto-generate PDF after 1 second
            setTimeout(() => {
                generatePDF();
            }, 1000);
        }
    });
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the form?')) {
            form.reset();
            generateUniqueIds();
            setTodayDate();
            updatePreview();
            showNotification('Form reset successfully!', 'info');
        }
    });
    
    // Download PDF button
    document.getElementById('downloadPdfBtn').addEventListener('click', function() {
        if (validateForm()) {
            updatePreview();
            setTimeout(() => {
                generatePDF();
            }, 500);
        }
    });
    
    // Auto-update preview on input
    const formInputs = form.querySelectorAll('input, select');
    formInputs.forEach(input => {
        input.addEventListener('input', debounce(updatePreview, 500));
    });
}

// =================== ID GENERATION ===================
function generateUniqueIds() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    
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
    
    // Update all preview elements
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
        const formatted = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        document.getElementById('previewDate').textContent = formatted;
    }
    
    document.getElementById('previewVerifiedBy').textContent = data.verifiedBy;
    
    // Credential ID
    const credId = `UNETS-CERT-2025-${Date.now().toString().slice(-9)}`;
    document.getElementById('previewCredentialId').textContent = credId;
    document.getElementById('previewVerificationUrl').textContent = `verify.education.onsnc.org/${credId}`;
    
    // Generate QR Code
    generateQRCode(data.ulcId);
}

// =================== QR CODE ===================
function generateQRCode(ulcId) {
    const container = document.getElementById('qrContainer');
    
    // Remove existing QR
    const existing = container.querySelector('.qr-canvas');
    if (existing) {
        existing.remove();
    }
    
    // Create QR container
    const qrDiv = document.createElement('div');
    qrDiv.className = 'qr-canvas';
    qrDiv.style.cssText = `
        position: absolute;
        top: 5px;
        left: 5px;
        width: 60px;
        height: 60px;
    `;
    
    container.insertBefore(qrDiv, container.firstChild);
    
    // Generate QR
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
        console.error('QR Code error:', error);
        qrDiv.innerHTML = '<div style="color:white;font-size:10px;text-align:center;line-height:60px;">QR</div>';
    }
}

// =================== PDF GENERATION ===================
async function generatePDF() {
    const learnerName = document.getElementById('learnerName').value;
    
    if (!learnerName) {
        showNotification('Please enter learner name', 'error');
        return;
    }
    
    const btn = document.getElementById('downloadPdfBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Generating...';
    
    try {
        // Update preview
        updatePreview();
        
        // Wait for QR code
        await new Promise(resolve => setTimeout(resolve, 800));
        
        showNotification('Capturing certificate...', 'info');
        
        const certificate = document.getElementById('certificatePreview');
        
        // Capture with html2canvas
        const canvas = await html2canvas(certificate, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: 794,
            height: 1123
        });
        
        showNotification('Creating PDF file...', 'info');
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });
        
        // Add image centered
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, '', 'FAST');
        
        // Filename
        const sanitized = learnerName.replace(/[^a-zA-Z0-9]/g, '_');
        const ulcId = document.getElementById('ulcId').value;
        const filename = `ULC_Certificate_${sanitized}_${ulcId}.pdf`;
        
        // Save
        pdf.save(filename);
        
        showNotification('PDF downloaded successfully! ✓', 'success');
        
    } catch (error) {
        console.error('PDF Error:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// =================== FORM VALIDATION ===================
function validateForm() {
    const required = ['learnerName', 'parentName', 'placeName', 'institution', 'programTitle', 'badgeName'];
    const missing = [];
    
    required.forEach(id => {
        const field = document.getElementById(id);
        if (!field.value.trim()) {
            field.style.borderColor = '#F44336';
            missing.push(field.previousElementSibling.textContent.replace('*', '').trim());
        } else {
            field.style.borderColor = '';
        }
    });
    
    if (missing.length > 0) {
        showNotification(`Please fill: ${missing.join(', ')}`, 'error');
        return false;
    }
    
    return true;
}

// =================== LOCAL STORAGE ===================
function saveFormData() {
    const data = {};
    document.querySelectorAll('#certificateForm input, #certificateForm select').forEach(input => {
        data[input.id] = input.value;
    });
    
    localStorage.setItem('ulc_certificate_data', JSON.stringify(data));
    localStorage.setItem('ulc_last_saved', new Date().toISOString());
}

// =================== NOTIFICATION ===================
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };
    
    const colors = {
        success: '#4CAF50',
        error: '#F44336',
        info: '#2196F3',
        warning: '#FF9800'
    };
    
    notification.innerHTML = `
        <span style="font-size: 1.2rem; margin-right: 10px;">${icons[type]}</span>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        font-size: 0.9rem;
        animation: slideIn 0.3s ease-out;
        border-left: 4px solid ${colors[type]};
        min-width: 250px;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// =================== UTILITIES ===================
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// =================== KEYBOARD SHORTCUTS ===================
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        document.getElementById('certificateForm').dispatchEvent(new Event('submit'));
    }
    
    // Ctrl/Cmd + P to download PDF
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        document.getElementById('downloadPdfBtn').click();
    }
});

// =================== PERFORMANCE ===================
window.addEventListener('load', function() {
    if (window.performance) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`⚡ Page Load Time: ${loadTime}ms`);
    }
});

console.log('✓ System Ready');
console.log('✓ Keyboard Shortcuts: Ctrl+S (Save), Ctrl+P (PDF)');
console.log('✓ Hamburger Menu: Right Side - Working');
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        font-size: 0.9rem;
        animation: slideIn 0.3s ease-out;
        border-left: 4px solid ${colors[type]};
        min-width: 250px;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// =================== UTILITIES ===================
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// =================== KEYBOARD SHORTCUTS ===================
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        document.getElementById('certificateForm').dispatchEvent(new Event('submit'));
    }
    
    // Ctrl/Cmd + P to download PDF
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        document.getElementById('downloadPdfBtn').click();
    }
});

// =================== PERFORMANCE ===================
window.addEventListener('load', function() {
    if (window.performance) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`⚡ Page Load Time: ${loadTime}ms`);
    }
});

console.log('✓ System Ready');
console.log('✓ Keyboard Shortcuts: Ctrl+S (Save), Ctrl+P (PDF)');
console.log('✓ Hamburger Menu: Right Side - Working');appendChild(notification);
    
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
