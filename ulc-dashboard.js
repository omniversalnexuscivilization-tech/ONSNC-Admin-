// Initialize jsPDF
const { jsPDF } = window.jspdf;

// DOM elements
const certificateForm = document.getElementById('certificateForm');
const previewCertificateBtn = document.getElementById('previewCertificateBtn');
const generateCertificateBtn = document.getElementById('generateCertificateBtn');
const saveTemplateBtn = document.getElementById('saveTemplateBtn');
const livePreviewToggle = document.getElementById('livePreviewToggle');

// Form input elements
const learnerNameInput = document.getElementById('learnerName');
const communityInstitutionInput = document.getElementById('communityInstitution');
const programTitleInput = document.getElementById('programTitle');
const badgeNameInput = document.getElementById('badgeName');
const knowledgeScoreInput = document.getElementById('knowledgeScore');
const creativeSkillInput = document.getElementById('creativeSkill');
const collaborationScoreInput = document.getElementById('collaborationScore');
const communityImpactInput = document.getElementById('communityImpact');
const dateIssuedInput = document.getElementById('dateIssued');
const mentorNameInput = document.getElementById('mentorName');
const certificateIdInput = document.getElementById('certificateId');
const llpIdInput = document.getElementById('llpId');

// Preview elements
const previewLearnerName = document.getElementById('previewLearnerName');
const previewInstitution = document.getElementById('previewInstitution');
const previewProgramTitle = document.getElementById('previewProgramTitle');
const previewBadgeName = document.getElementById('previewBadgeName');
const previewKnowledgeScore = document.getElementById('previewKnowledgeScore');
const previewCreativeSkill = document.getElementById('previewCreativeSkill');
const previewCollaborationScore = document.getElementById('previewCollaborationScore');
const previewCommunityImpact = document.getElementById('previewCommunityImpact');
const previewDateIssued = document.getElementById('previewDateIssued');
const previewMentorName = document.getElementById('previewMentorName');
const previewCredentialId = document.getElementById('previewCredentialId');
const previewVerificationUrl = document.getElementById('previewVerificationUrl');
const previewSignature = document.getElementById('previewSignature');

// Mobile navigation elements
const mobileMenuToggler = document.getElementById('mobileMenuToggler');
const mobileNav = document.getElementById('mobileNav');
const closeMenuBtn = document.getElementById('closeMenuBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set current date as default
    const today = new Date().toISOString().split('T')[0];
    dateIssuedInput.value = today;
    previewDateIssued.textContent = formatDate(today);
    
    // Generate a certificate ID
    generateCertificateId();
    
    // Set up event listeners for live preview
    if (livePreviewToggle.checked) {
        setupLivePreview();
    }
    
    // Toggle live preview
    livePreviewToggle.addEventListener('change', function() {
        if (this.checked) {
            setupLivePreview();
        } else {
            removeLivePreview();
        }
    });
    
    // Preview certificate button
    previewCertificateBtn.addEventListener('click', updateCertificatePreview);
    
    // Generate PDF button
    generateCertificateBtn.addEventListener('click', generatePDF);
    
    // Save template button
    saveTemplateBtn.addEventListener('click', saveTemplate);
    
    // Mobile navigation toggle
    mobileMenuToggler.addEventListener('click', toggleMobileMenu);
    closeMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Close mobile menu when clicking on a link
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-menu a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', toggleMobileMenu);
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (mobileNav.classList.contains('active') && 
            !mobileNav.contains(event.target) && 
            !mobileMenuToggler.contains(event.target)) {
            toggleMobileMenu();
        }
    });
});

// Toggle mobile menu
function toggleMobileMenu() {
    mobileNav.classList.toggle('active');
    
    // Add/remove overlay
    let overlay = document.querySelector('.mobile-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-overlay';
        document.body.appendChild(overlay);
    }
    
    overlay.classList.toggle('active');
    
    // Close overlay when clicked
    overlay.addEventListener('click', toggleMobileMenu);
}

// Set up live preview functionality
function setupLivePreview() {
    learnerNameInput.addEventListener('input', updateCertificatePreview);
    communityInstitutionInput.addEventListener('input', updateCertificatePreview);
    programTitleInput.addEventListener('input', updateCertificatePreview);
    badgeNameInput.addEventListener('input', updateCertificatePreview);
    knowledgeScoreInput.addEventListener('input', updateCertificatePreview);
    creativeSkillInput.addEventListener('input', updateCertificatePreview);
    collaborationScoreInput.addEventListener('input', updateCertificatePreview);
    communityImpactInput.addEventListener('input', updateCertificatePreview);
    dateIssuedInput.addEventListener('input', updateCertificatePreview);
    mentorNameInput.addEventListener('input', updateCertificatePreview);
    certificateIdInput.addEventListener('input', updateCertificatePreview);
    llpIdInput.addEventListener('input', updateCertificatePreview);
}

// Remove live preview functionality
function removeLivePreview() {
    learnerNameInput.removeEventListener('input', updateCertificatePreview);
    communityInstitutionInput.removeEventListener('input', updateCertificatePreview);
    programTitleInput.removeEventListener('input', updateCertificatePreview);
    badgeNameInput.removeEventListener('input', updateCertificatePreview);
    knowledgeScoreInput.removeEventListener('input', updateCertificatePreview);
    creativeSkillInput.removeEventListener('input', updateCertificatePreview);
    collaborationScoreInput.removeEventListener('input', updateCertificatePreview);
    communityImpactInput.removeEventListener('input', updateCertificatePreview);
    dateIssuedInput.removeEventListener('input', updateCertificatePreview);
    mentorNameInput.removeEventListener('input', updateCertificatePreview);
    certificateIdInput.removeEventListener('input', updateCertificatePreview);
    llpIdInput.removeEventListener('input', updateCertificatePreview);
}

// Update certificate preview
function updateCertificatePreview() {
    previewLearnerName.textContent = learnerNameInput.value || '[Learner Name]';
    previewInstitution.textContent = communityInstitutionInput.value || '[Community / Institution / Learning Hub]';
    previewProgramTitle.textContent = programTitleInput.value || '[Program Title]';
    previewBadgeName.textContent = `Metamorphic Badge: ${badgeNameInput.value}` || 'Metamorphic Badge: [Insert Badge Name]';
    previewKnowledgeScore.textContent = knowledgeScoreInput.value || '[KnowledgeScore]';
    previewCreativeSkill.textContent = creativeSkillInput.value || '[CreativeSkill]';
    previewCollaborationScore.textContent = collaborationScoreInput.value || '[CollaborationScore]';
    previewCommunityImpact.textContent = communityImpactInput.value || '[CommunityImpact]';
    previewDateIssued.textContent = formatDate(dateIssuedInput.value) || 'October 31, 2025';
    previewMentorName.textContent = mentorNameInput.value || '[Mentor_Name / DAO Council]';
    
    // Generate digital signature
    if (learnerNameInput.value) {
        previewSignature.textContent = generateDigitalSignature(learnerNameInput.value);
    } else {
        previewSignature.textContent = 'Digital Signature';
    }
}

// Generate PDF certificate
function generatePDF() {
    const element = document.getElementById('certificatePreview');
    
    // Check if required data is entered
    if (!learnerNameInput.value) {
        alert('Please enter learner name before generating PDF');
        return;
    }
    
    // Show loading state
    generateCertificateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating...';
    generateCertificateBtn.disabled = true;
    
    html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Calculate dimensions to fit the certificate on one page
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * pageWidth) / canvas.width;
        
        // Center the certificate on the page
        const x = 0;
        const y = (pageHeight - imgHeight) / 2;
        
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        
        const fileName = `UNETS_Certificate_${learnerNameInput.value.replace(/\s+/g, '_')}.pdf`;
        pdf.save(fileName);
        
        // Reset button state
        generateCertificateBtn.innerHTML = '<i class="fas fa-file-pdf me-2"></i>Generate PDF Certificate';
        generateCertificateBtn.disabled = false;
    });
}

// Save template
function saveTemplate() {
    const templateData = {
        name: `${programTitleInput.value} Template` || 'Untitled Template',
        learnerName: learnerNameInput.value,
        communityInstitution: communityInstitutionInput.value,
        programTitle: programTitleInput.value,
        badgeName: badgeNameInput.value,
        knowledgeScore: knowledgeScoreInput.value,
        creativeSkill: creativeSkillInput.value,
        collaborationScore: collaborationScoreInput.value,
        communityImpact: communityImpactInput.value,
        dateIssued: dateIssuedInput.value,
        mentorName: mentorNameInput.value,
        certificateId: certificateIdInput.value,
        llpId: llpIdInput.value,
        savedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    let templates = JSON.parse(localStorage.getItem('unetsTemplates')) || [];
    templates.push(templateData);
    localStorage.setItem('unetsTemplates', JSON.stringify(templates));
    
    alert('Template saved successfully!');
}

// Generate certificate ID
function generateCertificateId() {
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const certificateId = `UNETS-CERT-${new Date().getFullYear()}-${timestamp}${random}`;
    certificateIdInput.value = certificateId;
    previewCredentialId.textContent = certificateId;
    previewVerificationUrl.textContent = `https://verify.education.onsnc.org/${certificateId}`;
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'October 31, 2025';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Generate a mock digital signature
function generateDigitalSignature(learnerName) {
    // This is a simplified mock - in a real system, this would be a proper hash
    const baseString = learnerName + new Date().toISOString();
    return `Sig: ${btoa(baseString).substring(0, 15)}...`;
}
