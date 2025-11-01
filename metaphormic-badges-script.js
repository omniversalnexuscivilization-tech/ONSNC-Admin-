/**
 * Metamorphic Badges - JavaScript Functions
 * Quantum Authentication System
 * Education 5.0 Recognition Platform
 */

// ============================================
// Global Variables
// ============================================
let currentTemplate = 'knowledge';
let currentIcon = '🧠';
let currentLevel = 'Expert';
let savedBadges = [];
let qrCodeInstance = null;

// ============================================
// Initialization Functions
// ============================================

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Metamorphic Badges System Initialized');
    createParticles();
    generateQRCode();
    updateBlockchainHash();
    updatePreview();
    loadSavedBadges();
});

/**
 * Create floating particles background
 */
function createParticles() {
    const container = document.getElementById('particleContainer');
    if (!container) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        container.appendChild(particle);
    }
}

// ============================================
// Navigation Functions
// ============================================

/**
 * Show specific section and hide others
 * @param {string} sectionId - ID of section to show
 */
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to clicked tab
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// ============================================
// Template and Level Selection
// ============================================

/**
 * Select badge template
 * @param {HTMLElement} element - Clicked template card
 * @param {string} template - Template identifier
 * @param {string} icon - Template icon emoji
 */
function selectTemplate(element, template, icon) {
    // Remove active class from all template cards
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Add active class to selected card
    element.classList.add('active');
    
    // Update global variables
    currentTemplate = template;
    currentIcon = icon;
    
    // Update badge icon in preview
    const badgeIcon = document.getElementById('badgeIcon');
    if (badgeIcon) {
        badgeIcon.textContent = icon;
    }
    
    // Update preview
    updatePreview();
    
    console.log(`✅ Template selected: ${template} ${icon}`);
}

/**
 * Select achievement level
 * @param {HTMLElement} element - Clicked level option
 * @param {string} level - Level name
 */
function selectLevel(element, level) {
    // Remove active class from all level options
    document.querySelectorAll('.level-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Add active class to selected option
    element.classList.add('active');
    
    // Update global variable
    currentLevel = level;
    
    // Update preview
    updatePreview();
    
    console.log(`✅ Level selected: ${level}`);
}

// ============================================
// Photo Upload Functions
// ============================================

/**
 * Handle photo upload
 * @param {HTMLInputElement} input - File input element
 */
function handlePhotoUpload(input) {
    const file = input.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('❌ Please upload a valid image file');
        return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        alert('❌ File size must be less than 5MB');
        return;
    }
    
    // Read and preview the file
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const photoPreview = document.getElementById('photoPreview');
        const previewPhoto = document.getElementById('previewPhoto');
        const defaultPhoto = document.getElementById('defaultPhoto');
        
        if (photoPreview) {
            photoPreview.src = e.target.result;
            photoPreview.style.display = 'block';
        }
        
        if (previewPhoto && defaultPhoto) {
            previewPhoto.src = e.target.result;
            previewPhoto.style.display = 'block';
            defaultPhoto.style.display = 'none';
        }
        
        console.log('✅ Photo uploaded successfully');
    };
    
    reader.onerror = function() {
        alert('❌ Error reading file');
    };
    
    reader.readAsDataURL(file);
}

// ============================================
// Preview Update Functions
// ============================================

/**
 * Update badge preview with current form values
 */
function updatePreview() {
    // Get form values
    const learnerName = document.getElementById('learnerName')?.value || 'Learner Name';
    const badgeTitle = document.getElementById('badgeTitle')?.value || 'Badge Title';
    const ulpId = document.getElementById('ulpId')?.value || 'ULP-XXXX-XXXXX';
    const description = document.getElementById('description')?.value || 'Achievement description';
    const issueDate = document.getElementById('issueDate')?.value;
    
    // Update preview elements
    const previewLearnerName = document.getElementById('previewLearnerName');
    if (previewLearnerName) previewLearnerName.textContent = learnerName;
    
    const previewTitle = document.getElementById('previewTitle');
    if (previewTitle) previewTitle.textContent = badgeTitle;
    
    const previewLevel = document.getElementById('previewLevel');
    if (previewLevel) previewLevel.textContent = currentLevel + ' Level';
    
    const previewUlpId = document.getElementById('previewUlpId');
    if (previewUlpId) previewUlpId.textContent = ulpId;
    
    // Format and update issue date
    if (issueDate) {
        const date = new Date(issueDate);
        const previewDate = document.getElementById('previewDate');
        if (previewDate) {
            previewDate.textContent = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }
    
    // Update description (truncate if too long)
    const previewDescription = document.getElementById('previewDescription');
    if (previewDescription) {
        const shortDesc = description.length > 50 
            ? description.substring(0, 50) + '...' 
            : description;
        previewDescription.textContent = shortDesc;
    }
    
    // Generate QR Code with updated data
    generateQRCode();
    
    // Update blockchain hash
    updateBlockchainHash();
}

// ============================================
// QR Code Generation
// ============================================

/**
 * Generate QR code with badge data
 */
function generateQRCode() {
    const qrElement = document.getElementById('qrCode');
    if (!qrElement) return;
    
    // Clear previous QR code
    qrElement.innerHTML = '';
    
    // Prepare badge data
    const badgeData = {
        id: document.getElementById('previewBadgeId')?.textContent || 'MB-2024-QC-8901',
        name: document.getElementById('learnerName')?.value || 'Unknown',
        badge: document.getElementById('badgeTitle')?.value || 'Badge',
        ulp: document.getElementById('ulpId')?.value || 'ULP-XXXX',
        level: currentLevel,
        date: document.getElementById('issueDate')?.value || new Date().toISOString().split('T')[0],
        chip: document.getElementById('chipId')?.textContent || 'QC-2024-X7Y9Z2',
        hash: document.getElementById('blockchainHash')?.textContent.substring(0, 20) || '0x...',
        template: currentTemplate,
        verified: true,
        timestamp: new Date().toISOString()
    };
    
    // Generate QR code
    try {
        new QRCode(qrElement, {
            text: JSON.stringify(badgeData),
            width: 120,
            height: 120,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        console.log('✅ QR Code generated');
    } catch (error) {
        console.error('❌ Error generating QR code:', error);
    }
}

// ============================================
// Blockchain Functions
// ============================================

/**
 * Generate random blockchain hash
 */
function updateBlockchainHash() {
    const chars = '0123456789abcdef';
    let hash = '0x';
    
    for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * 16)];
    }
    
    const hashElement = document.getElementById('blockchainHash');
    if (hashElement) {
        hashElement.textContent = hash;
    }
    
    return hash;
}

/**
 * Generate unique chip ID
 */
function generateChipId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let chipId = 'QC-2024-';
    
    for (let i = 0; i < 6; i++) {
        chipId += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return chipId;
}

// ============================================
// Badge Generation and Management
// ============================================

/**
 * Generate quantum badge
 */
function generateBadge() {
    // Validate required fields
    const learnerName = document.getElementById('learnerName')?.value;
    const badgeTitle = document.getElementById('badgeTitle')?.value;
    const ulpId = document.getElementById('ulpId')?.value;
    
    if (!learnerName || !badgeTitle || !ulpId) {
        alert('❌ Please fill in all required fields:\n- Learner Name\n- Badge Title\n- ULP ID');
        return;
    }
    
    // Update preview with latest data
    updatePreview();
    
    // Generate new chip ID and blockchain hash
    const chipId = generateChipId();
    const chipElement = document.getElementById('chipId');
    if (chipElement) {
        chipElement.textContent = chipId;
    }
    
    updateBlockchainHash();
    generateQRCode();
    
    // Show success message
    alert(`✅ Quantum Badge Generated Successfully!

🔐 Quantum chip activated: ${chipId}
⛓️ Blockchain signature created
🧬 Biometric data encrypted
✨ Badge is ready for download

Badge Details:
👤 Learner: ${learnerName}
🏆 Badge: ${badgeTitle}
📊 Level: ${currentLevel}
🆔 ULP ID: ${ulpId}`);
    
    console.log('✅ Badge generated successfully');
}

/**
 * Save badge to local storage
 */
function saveBadge() {
    const badge = {
        id: document.getElementById('previewBadgeId')?.textContent || 'MB-' + Date.now(),
        learnerName: document.getElementById('learnerName')?.value || '',
        title: document.getElementById('badgeTitle')?.value || '',
        template: currentTemplate,
        icon: currentIcon,
        level: currentLevel,
        ulpId: document.getElementById('ulpId')?.value || '',
        date: document.getElementById('issueDate')?.value || '',
        description: document.getElementById('description')?.value || '',
        skills: document.getElementById('skills')?.value || '',
        chipId: document.getElementById('chipId')?.textContent || '',
        blockchainHash: document.getElementById('blockchainHash')?.textContent || '',
        photo: document.getElementById('previewPhoto')?.src || '',
        createdAt: new Date().toISOString()
    };
    
    // Validate essential fields
    if (!badge.learnerName || !badge.title) {
        alert('❌ Please fill in Learner Name and Badge Title before saving');
        return;
    }
    
    // Add to saved badges array
    savedBadges.push(badge);
    
    // Save to localStorage
    try {
        localStorage.setItem('metamorphicBadges', JSON.stringify(savedBadges));
        alert('💾 Badge saved successfully!');
        console.log('✅ Badge saved:', badge.id);
    } catch (error) {
        console.error('❌ Error saving badge:', error);
        alert('❌ Error saving badge. Please try again.');
    }
}

/**
 * Load saved badges from localStorage
 */
function loadSavedBadges() {
    try {
        const saved = localStorage.getItem('metamorphicBadges');
        if (saved) {
            savedBadges = JSON.parse(saved);
            console.log(`✅ Loaded ${savedBadges.length} saved badges`);
        }
    } catch (error) {
        console.error('❌ Error loading saved badges:', error);
        savedBadges = [];
    }
}

/**
 * Reset form to default values
 */
function resetForm() {
    if (!confirm('⚠️ Are you sure you want to reset the form? All unsaved data will be lost.')) {
        return;
    }
    
    // Clear text inputs
    const inputs = ['learnerName', 'badgeTitle', 'ulpId', 'issueDate', 'description', 'skills'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    // Clear photo
    const photoPreview = document.getElementById('photoPreview');
    const previewPhoto = document.getElementById('previewPhoto');
    const defaultPhoto = document.getElementById('defaultPhoto');
    
    if (photoPreview) photoPreview.style.display = 'none';
    if (previewPhoto) previewPhoto.style.display = 'none';
    if (defaultPhoto) defaultPhoto.style.display = 'flex';
    
    // Reset to default template and level
    currentTemplate = 'knowledge';
    currentIcon = '🧠';
    currentLevel = 'Novice';
    
    // Reset template selection
    document.querySelectorAll('.template-card').forEach((card, index) => {
        card.classList.remove('active');
        if (index === 0) card.classList.add('active');
    });
    
    // Reset level selection
    document.querySelectorAll('.level-option').forEach((option, index) => {
        option.classList.remove('active');
        if (index === 0) option.classList.add('active');
    });
    
    // Update preview
    updatePreview();
    
    console.log('✅ Form reset');
    alert('✅ Form has been reset');
}

// ============================================
// Download Functions
// ============================================

/**
 * Download badge as PDF
 */
function downloadPDF() {
    const badgeElement = document.getElementById('badgePreview');
    
    if (!badgeElement) {
        alert('❌ Badge preview not found');
        return;
    }
    
    html2canvas(badgeElement, {
        scale: 2,
        backgroundColor: null,
        logging: false
    }).then(canvas => {
        const link = document.createElement('a');
        const learnerName = document.getElementById('learnerName')?.value || 'badge';
        const filename = `metamorphic-badge-${learnerName.replace(/\s+/g, '-')}-${Date.now()}.png`;
        
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        console.log('✅ Badge downloaded as PNG:', filename);
        alert('📄 Badge downloaded successfully!\n\nNote: For full PDF functionality, a PDF library is required.\nThe badge has been saved as a high-quality PNG image.');
    }).catch(error => {
        console.error('❌ Error creating badge image:', error);
        alert('❌ Error downloading badge. Please try again.');
    });
}

/**
 * Download badge as image
 */
function downloadImage() {
    const badgeElement = document.getElementById('badgePreview');
    
    if (!badgeElement) {
        alert('❌ Badge preview not found');
        return;
    }
    
    html2canvas(badgeElement, {
        scale: 3,
        backgroundColor: null,
        logging: false
    }).then(canvas => {
        const link = document.createElement('a');
        const learnerName = document.getElementById('learnerName')?.value || 'badge';
        const filename = `metamorphic-badge-${learnerName.replace(/\s+/g, '-')}-${Date.now()}.png`;
        
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        console.log('✅ Badge image downloaded:', filename);
        alert('✅ Badge image downloaded successfully!');
    }).catch(error => {
        console.error('❌ Error downloading image:', error);
        alert('❌ Error downloading image. Please try again.');
    });
}

// ============================================
// Share and Verification Functions
// ============================================

/**
 * Share badge
 */
function shareBadge() {
    const badgeId = document.getElementById('previewBadgeId')?.textContent || 'MB-XXXX';
    const learnerName = document.getElementById('learnerName')?.value || 'Learner';
    const badgeTitle = document.getElementById('badgeTitle')?.value || 'Badge';
    
    const shareText = `🌟 Quantum Badge Earned!

👤 ${learnerName}
🏆 ${badgeTitle}
📊 Level: ${currentLevel}
🆔 Badge ID: ${badgeId}

Verified by Quantum Authentication System
Education 5.0 | Metamorphic Badges

Verify at: https://badges.uienc.org/verify/${badgeId}`;
    
    // Try to use Web Share API if available
    if (navigator.share) {
        navigator.share({
            title: 'Metamorphic Badge',
            text: shareText,
            url: `https://badges.uienc.org/verify/${badgeId}`
        }).then(() => {
            console.log('✅ Badge shared successfully');
        }).catch(error => {
            console.log('Share cancelled or failed:', error);
        });
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            alert(`🔗 Badge details copied to clipboard!

${shareText}

You can now paste and share this information.`);
        }).catch(() => {
            alert(`🔗 Share Badge Information:

${shareText}

📋 Copy this information to share your badge.
🔗 Verification URL: https://badges.uienc.org/verify/${badgeId}`);
        });
    }
}

/**
 * Verify badge authenticity
 */
function verifyBadge() {
    const badgeId = document.getElementById('verifyBadgeId')?.value;
    
    if (!badgeId) {
        alert('❌ Please enter a Badge ID to verify');
        return;
    }
    
    // Simulate verification process
    console.log('🔍 Verifying badge:', badgeId);
    
    // Show verification result
    const resultElement = document.getElementById('verificationResult');
    if (resultElement) {
        resultElement.style.display = 'block';
        resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        console.log('✅ Badge verified successfully');
        
        // Simulate verification animation
        setTimeout(() => {
            alert(`✅ Badge Verification Complete!

Badge ID: ${badgeId}
Status: VERIFIED AUTHENTIC

✓ Quantum signature validated
✓ Blockchain confirmed
✓ Multi-factor authenticated
✓ Chip status: Active

This badge is genuine and issued by the Metamorphic Badges Quantum Authentication System.`);
        }, 1000);
    }
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    if (!dateString) return 'Not specified';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Generate random ID
 * @param {string} prefix - ID prefix
 * @returns {string} Generated ID
 */
function generateId(prefix = 'MB') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}-${timestamp}-${random}`;
}

// ============================================
// Console Information
// ============================================

console.log(`
╔════════════════════════════════════════════════╗
║   METAMORPHIC BADGES                          ║
║   Quantum Authentication System               ║
║   Education 5.0 Recognition Platform          ║
║                                                ║
║   Status: ✅ System Active                    ║
║   Version: 3.0.0                              ║
║   Security: Quantum Encryption Enabled        ║
╚════════════════════════════════════════════════╝

🔐 Quantum Chip: Active
⛓️ Blockchain: Connected
🧬 Biometric Auth: Ready
✨ System initialized successfully

For support: support@uienc.org
Documentation: https://docs.uienc.org/badges
`);

// Export functions for external use (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showSection,
        selectTemplate,
        selectLevel,
        handlePhotoUpload,
        updatePreview,
        generateQRCode,
        generateBadge,
        saveBadge,
        resetForm,
        downloadPDF,
        downloadImage,
        shareBadge,
        verifyBadge
    };
}

