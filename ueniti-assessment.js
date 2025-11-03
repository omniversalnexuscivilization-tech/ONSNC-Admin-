// script.js - Complete JavaScript Logic for UEITI Assessment System

// Core Dimensions Configuration
const dimensions = [
    {
        category: '🏛',
        name: 'Governance & Transparency',
        indicators: 'Policy clarity, audit trail compliance, DAO participation',
        weight: 15
    },
    {
        category: '📘',
        name: 'Learning Design & UDL',
        indicators: 'UDL modules, assistive tech, multilingual resources',
        weight: 15
    },
    {
        category: '👨‍🏫',
        name: 'Facilitator Development',
        indicators: 'UEITI Residency, AI Co-Teaching, Mentor Cycles',
        weight: 15
    },
    {
        category: '🌍',
        name: 'Learner Ecosystem',
        indicators: 'Peer networks, intercultural teams, equitable access',
        weight: 10
    },
    {
        category: '💻',
        name: 'Tech Infrastructure & AI',
        indicators: 'AI assistants, robotics, AR/VR labs, smart classrooms',
        weight: 15
    },
    {
        category: '🌱',
        name: 'Sustainability & Impact',
        indicators: 'Renewable energy, green buildings, climate projects',
        weight: 15
    },
    {
        category: '🧪',
        name: 'Innovation & Research',
        indicators: 'Patents, experiments, transdisciplinary labs',
        weight: 10
    },
    {
        category: '🧬',
        name: 'Learning Environment',
        indicators: 'Biophilic design, AR/VR integration, safety',
        weight: 5
    }
];

// Global Ratings Storage
const ratings = {};

// Initialize Quantum Particles
function createQuantumParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 5) + 's';
        container.appendChild(particle);
    }
}

// Initialize Dimensions Table
function initializeDimensions() {
    const tbody = document.getElementById('dimensionsBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    dimensions.forEach((dim, idx) => {
        ratings[idx] = 0;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="text-align: center; font-size: 1.5em;">${dim.category}</td>
            <td>
                <strong>${dim.name}</strong><br>
                <small style="opacity: 0.7;">${dim.indicators}</small>
            </td>
            <td>
                <div class="rating-control">
                    ${[1,2,3,4,5].map(val => `
                        <button class="rating-btn" onclick="setRating(${idx}, ${val})">${val}</button>
                    `).join('')}
                </div>
            </td>
            <td>
                <input type="text" class="remarks-input" id="remarks${idx}" 
                       placeholder="Add evidence or remarks" onchange="updatePreview()">
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Set Rating for Dimension
function setRating(dimIdx, value) {
    ratings[dimIdx] = value;
    
    const buttons = document.querySelectorAll(`#dimensionsBody tr:nth-child(${dimIdx + 1}) .rating-btn`);
    buttons.forEach((btn, idx) => {
        if (idx < value) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    updatePreview();
}

// Calculate ULCI Score
function calculateULCI() {
    const E = parseFloat(document.getElementById('ulciE')?.value) || 0;
    const S = parseFloat(document.getElementById('ulciS')?.value) || 0;
    const C = parseFloat(document.getElementById('ulciC')?.value) || 0;
    const H = parseFloat(document.getElementById('ulciH')?.value) || 0;
    const I = parseFloat(document.getElementById('ulciI')?.value) || 0;

    // ULCI Formula: (E × 0.25) + (S × 0.20) + (C × 0.15) + (H × 0.20) + (I × 0.20)
    const ulciTotal = (E * 0.25) + (S * 0.20) + (C * 0.15) + (H * 0.20) + (I * 0.20);

    return {
        E, S, C, H, I,
        total: ulciTotal.toFixed(1),
        level: getULCILevel(ulciTotal)
    };
}

// Get ULCI Level Classification
function getULCILevel(score) {
    if (score >= 90) return { text: 'A+ Regenerative Leader', class: 'level-A-plus' };
    if (score >= 80) return { text: 'A - Ethical Contributor', class: 'level-A' };
    if (score >= 70) return { text: 'B - Active Citizen', class: 'level-B' };
    if (score >= 50) return { text: 'C - Developing Contributor', class: 'level-C' };
    return { text: 'D - Needs Support', class: 'level-D' };
}

// Calculate Institutional Score
function calculateInstitutionalScore() {
    let totalWeightedScore = 0;

    dimensions.forEach((dim, idx) => {
        const rating = ratings[idx] || 0;
        const score = (rating / 5) * 100;
        const weightedImpact = (score * dim.weight) / 100;
        totalWeightedScore += weightedImpact;
    });

    return {
        score: totalWeightedScore.toFixed(1),
        level: getInstitutionalLevel(totalWeightedScore)
    };
}

// Get Institutional Level
function getInstitutionalLevel(score) {
    if (score >= 80) return { text: '🟩 Transformative', class: 'level-A' };
    if (score >= 60) return { text: '🟨 Progressive', class: 'level-B' };
    return { text: '🟥 Emerging', class: 'level-C' };
}

// Generate Quantum Credentials
function generateQuantumHash() {
    const chars = '0123456789abcdef';
    let hash = '0xQ';
    for (let i = 0; i < 62; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
}

function generateNanoChipId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'NANO-';
    for (let i = 0; i < 16; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
        if ((i + 1) % 4 === 0 && i < 15) id += '-';
    }
    return id;
}

function generateQuantumSignature() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let sig = 'QS::';
    for (let i = 0; i < 40; i++) {
        sig += chars[Math.floor(Math.random() * chars.length)];
    }
    return sig;
}

// Collect All Form Data
function collectFormData() {
    const ulci = calculateULCI();
    const institutional = calculateInstitutionalScore();

    return {
        institute: {
            name: document.getElementById('instituteName')?.value || '',
            tokenId: document.getElementById('tokenId')?.value || '',
            ulciId: document.getElementById('ulciId')?.value || '',
            email: document.getElementById('instituteEmail')?.value || '',
            phone: document.getElementById('phoneNumber')?.value || '',
            website: document.getElementById('website')?.value || '',
            address: document.getElementById('address')?.value || '',
            totalStaff: document.getElementById('totalStaff')?.value || '',
            region: document.getElementById('region')?.value || '',
            assessmentDate: document.getElementById('assessmentDate')?.value || '',
            assessmentCycle: document.getElementById('assessmentCycle')?.value || ''
        },
        dimensions: dimensions.map((dim, idx) => ({
            category: dim.category,
            name: dim.name,
            rating: ratings[idx] || 0,
            remarks: document.getElementById(`remarks${idx}`)?.value || '',
            weight: dim.weight
        })),
        ulci: ulci,
        institutional: institutional,
        qualitative: {
            strengths: document.getElementById('strengths')?.value || '',
            improvements: document.getElementById('improvements')?.value || '',
            innovations: document.getElementById('innovations')?.value || '',
            contribution: document.getElementById('contribution')?.value || ''
        },
        training: {
            aiModules: document.getElementById('aiModules')?.value || '',
            sustainModules: document.getElementById('sustainModules')?.value || '',
            holisticModules: document.getElementById('holisticModules')?.value || '',
            innovationModules: document.getElementById('innovationModules')?.value || ''
        },
        infrastructure: {
            firestore: document.getElementById('firestore')?.checked || false,
            dao: document.getElementById('dao')?.checked || false,
            robotics: document.getElementById('robotics')?.checked || false,
            whiteboards: document.getElementById('whiteboards')?.checked || false,
            blockchain: document.getElementById('blockchain')?.checked || false,
            nanoChip: document.getElementById('nanoChip')?.checked || false
        },
        validation: {
            daoCouncil: document.getElementById('daoCouncil')?.value || '',
            validatorName: document.getElementById('validatorName')?.value || '',
            issueDate: document.getElementById('issueDate')?.value || '',
            verificationStatus: document.getElementById('verificationStatus')?.value || '',
            blockchainHash: generateQuantumHash(),
            quantumSignature: generateQuantumSignature(),
            nanoChipId: generateNanoChipId(),
            timestamp: new Date().toISOString()
        }
    };
}

// Update Preview in Real-Time
function updatePreview() {
    const previewFrame = document.getElementById('previewFrame');
    if (!previewFrame || !previewFrame.contentWindow) return;

    const data = collectFormData();
    
    // Send data to preview iframe
    previewFrame.contentWindow.postMessage({
        type: 'UPDATE_REPORT',
        data: data
    }, '*');
}

// Toggle Preview Panel
function togglePreview() {
    const panel = document.getElementById('previewPanel');
    const btnText = document.getElementById('previewBtnText');
    
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        if (btnText) btnText.textContent = 'Hide Preview';
        updatePreview();
    } else {
        panel.classList.add('hidden');
        if (btnText) btnText.textContent = 'Show Live Preview';
    }
}

// Save Assessment
function saveAssessment() {
    if (!validateForm()) {
        showNotification('❌ Please fill all required fields marked with *', 'error');
        return;
    }

    const data = collectFormData();
    const reportId = 'ueiti_' + Date.now();

    try {
        // Store in localStorage
        localStorage.setItem(reportId, JSON.stringify(data));
        localStorage.setItem('latest_assessment', reportId);
        
        showNotification('✅ Assessment saved successfully! ID: ' + reportId, 'success');
        
        // Update preview
        updatePreview();
    } catch (error) {
        showNotification('❌ Error saving: ' + error.message, 'error');
    }
}

// Validate Required Fields
function validateForm() {
    const required = [
        'instituteName', 'tokenId', 'ulciId', 
        'instituteEmail', 'phoneNumber', 'totalStaff'
    ];
    
    let isValid = true;
    
    required.forEach(field => {
        const input = document.getElementById(field);
        if (input && !input.value.trim()) {
            input.style.borderColor = '#ef4444';
            input.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.5)';
            isValid = false;
        } else if (input) {
            input.style.borderColor = '';
            input.style.boxShadow = '';
        }
    });
    
    return isValid;
}

// Download PDF
function downloadPDF() {
    const previewFrame = document.getElementById('previewFrame');
    if (!previewFrame || !previewFrame.contentWindow) {
        showNotification('⚠️ Please open preview first', 'error');
        return;
    }

    showNotification('📄 Opening print dialog for PDF download...', 'success');
    
    setTimeout(() => {
        previewFrame.contentWindow.print();
    }, 500);
}

// Reset Form
function resetForm() {
    if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
        document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="url"], input[type="number"], input[type="date"], textarea, select').forEach(input => {
            input.value = '';
        });
        
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset ratings
        Object.keys(ratings).forEach(key => {
            ratings[key] = 0;
        });
        
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        initializeDefaults();
        updatePreview();
        
        showNotification('🔄 Form reset successfully', 'success');
    }
}

// Show Notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Initialize Defaults
function initializeDefaults() {
    const today = new Date().toISOString().split('T')[0];
    const assessmentDate = document.getElementById('assessmentDate');
    const issueDate = document.getElementById('issueDate');
    
    if (assessmentDate) assessmentDate.value = today;
    if (issueDate) issueDate.value = today;
}

// Auto-save Functionality
let autoSaveTimeout;
function setupAutoSave() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(() => {
                const data = collectFormData();
                sessionStorage.setItem('ueiti_autosave', JSON.stringify(data));
            }, 2000);
        });
    });
}

// Load Auto-saved Data
function loadAutoSave() {
    const saved = sessionStorage.getItem('ueiti_autosave');
    if (saved) {
        const data = JSON.parse(saved);
        // Restore form values here if needed
        console.log('Auto-saved data loaded:', data);
    }
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 's':
                e.preventDefault();
                saveAssessment();
                break;
            case 'p':
                e.preventDefault();
                downloadPDF();
                break;
            case 'r':
                if (e.shiftKey) {
                    e.preventDefault();
                    resetForm();
                }
                break;
        }
    }
});

// Initialize on Page Load
window.addEventListener('DOMContentLoaded', () => {
    console.log('🌍 UEITI Assessment System Initialized');
    console.log('⚛️ Quantum Blockchain Active');
    
    createQuantumParticles();
    initializeDimensions();
    initializeDefaults();
    setupAutoSave();
    loadAutoSave();
});

// Performance Monitoring
window.addEventListener('load', () => {
    const loadTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    console.log(`⚡ Page loaded in ${loadTime}ms`);
});


