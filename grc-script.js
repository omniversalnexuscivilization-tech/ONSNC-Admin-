// Global Variables
let learnerData = {};
let projectCount = 1;
let savedReports = [];
let currentLearnerPhoto = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadSavedReports();
});

// Initialize Application
function initializeApp() {
    // Hamburger Menu
    const hamburger = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    const closeNav = document.getElementById('closeNav');

    hamburger.addEventListener('click', () => {
        navMenu.classList.add('active');
    });

    closeNav.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            navMenu.classList.remove('active');
        }
    });

    // Form Submission
    document.getElementById('learnerForm').addEventListener('submit', handleFormSubmit);

    // Add Project Button
    document.getElementById('addProjectBtn').addEventListener('click', addProjectEntry);

    // Action Buttons
    document.getElementById('prevReportsBtn').addEventListener('click', showPreviousReports);
    document.getElementById('saveDataBtn').addEventListener('click', saveCurrentData);
    document.getElementById('clearFormBtn').addEventListener('click', clearForm);

    // Report Actions
    document.getElementById('downloadPdfBtn').addEventListener('click', downloadPDF);
    document.getElementById('printBtn').addEventListener('click', printReport);

    // Photo Upload
    document.getElementById('learnerPhoto').addEventListener('change', handlePhotoUpload);

    // Modal Close
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('reportsModal').classList.remove('active');
    });
}

// Handle Photo Upload
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            currentLearnerPhoto = event.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Add Project Entry
function addProjectEntry() {
    if (projectCount >= 4) {
        alert('Maximum 4 projects allowed');
        return;
    }

    const projectsContainer = document.getElementById('projectsContainer');
    const projectEntry = document.createElement('div');
    projectEntry.className = 'project-entry';
    projectEntry.innerHTML = `
        <input type="text" placeholder="Project Title" class="project-title">
        <input type="text" placeholder="Duration (e.g., 3 weeks)" class="project-duration">
        <input type="text" placeholder="Tags (comma separated)" class="project-tags">
        <textarea placeholder="Project description..." class="project-description"></textarea>
        <textarea placeholder="Measurable impact..." class="project-impact"></textarea>
        <button type="button" class="btn btn-secondary" onclick="removeProject(this)">❌ Remove</button>
    `;
    projectsContainer.appendChild(projectEntry);
    projectCount++;
}

// Remove Project Entry
function removeProject(button) {
    button.parentElement.remove();
    projectCount--;
}

// Handle Form Submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Collect form data
    learnerData = {
        // Personal Info
        name: document.getElementById('learnerName').value,
        age: document.getElementById('age').value,
        learningPod: document.getElementById('learningPod').value,
        location: document.getElementById('location').value,
        mentor: document.getElementById('mentor').value,
        period: document.getElementById('period').value,
        passportId: document.getElementById('passportId').value,
        photo: currentLearnerPhoto,
        
        // Dimensions
        dimensions: [
            {
                name: '🧠 Critical Thinking & Problem-Solving',
                rating: parseInt(document.getElementById('dim1Rating').value),
                progress: parseInt(document.getElementById('dim1Progress').value),
                details: document.getElementById('dim1Details').value
            },
            {
                name: '💡 Creativity & Innovation',
                rating: parseInt(document.getElementById('dim2Rating').value),
                progress: parseInt(document.getElementById('dim2Progress').value),
                details: document.getElementById('dim2Details').value
            },
            {
                name: '💻 Digital & AI Literacy',
                rating: parseInt(document.getElementById('dim3Rating').value),
                progress: parseInt(document.getElementById('dim3Progress').value),
                details: document.getElementById('dim3Details').value
            },
            {
                name: '❤️ Emotional Intelligence',
                rating: parseInt(document.getElementById('dim4Rating').value),
                progress: parseInt(document.getElementById('dim4Progress').value),
                details: document.getElementById('dim4Details').value
            },
            {
                name: '👥 Collaboration & Leadership',
                rating: parseInt(document.getElementById('dim5Rating').value),
                progress: parseInt(document.getElementById('dim5Progress').value),
                details: document.getElementById('dim5Details').value
            },
            {
                name: '⚖️ Ethical Reasoning',
                rating: parseInt(document.getElementById('dim6Rating').value),
                progress: parseInt(document.getElementById('dim6Progress').value),
                details: document.getElementById('dim6Details').value
            },
            {
                name: '🌍 Environmental Consciousness',
                rating: parseInt(document.getElementById('dim7Rating').value),
                progress: parseInt(document.getElementById('dim7Progress').value),
                details: document.getElementById('dim7Details').value
            },
            {
                name: '🎯 Self-Directed Learning',
                rating: parseInt(document.getElementById('dim8Rating').value),
                progress: parseInt(document.getElementById('dim8Progress').value),
                details: document.getElementById('dim8Details').value
            }
        ],
        
        // Projects
        projects: collectProjects(),
        
        // Reflections
        reflections: {
            learner: document.getElementById('learnerVoice').value,
            mentor: document.getElementById('mentorVoice').value,
            peer: document.getElementById('peerVoice').value,
            parent: document.getElementById('parentVoice').value
        },
        
        // Contribution Index
        contribution: {
            communityService: parseInt(document.getElementById('communityService').value),
            environmentalAction: parseInt(document.getElementById('environmentalAction').value),
            knowledgeSharing: parseInt(document.getElementById('knowledgeSharing').value),
            culturalPreservation: parseInt(document.getElementById('culturalPreservation').value),
            innovation: parseInt(document.getElementById('innovation').value)
        },
        
        // Metadata
        generatedDate: new Date().toISOString()
    };

    // Generate Report Card
    generateReportCard();
    
    // Scroll to report
    document.getElementById('reportCardSection').scrollIntoView({ behavior: 'smooth' });
}

// Collect Projects Data
function collectProjects() {
    const projectEntries = document.querySelectorAll('.project-entry');
    const projects = [];
    
    projectEntries.forEach(entry => {
        const title = entry.querySelector('.project-title').value;
        if (title) {
            projects.push({
                title: title,
                duration: entry.querySelector('.project-duration').value,
                tags: entry.querySelector('.project-tags').value,
                description: entry.querySelector('.project-description').value,
                impact: entry.querySelector('.project-impact').value
            });
        }
    });
    
    return projects;
}

// Generate Report Card
function generateReportCard() {
    const reportCard = document.getElementById('reportCard');
    const totalContribution = Object.values(learnerData.contribution).reduce((a, b) => a + b, 0);
    
    const stageLabels = ['Beginning', 'Developing', 'Emerging', 'Maturing', 'Contributing'];
    
    let dimensionsHTML = learnerData.dimensions.map(dim => {
        const stars = '★'.repeat(dim.rating) + '☆'.repeat(5 - dim.rating);
        const stage = stageLabels[dim.rating - 1];
        
        return `
            <div class="dimension-card-report">
                <div class="dimension-header-report">
                    <div class="dimension-name-report">${dim.name}</div>
                    <div class="stars-report">${stars}</div>
                </div>
                <div class="progress-bar-report">
                    <div class="progress-fill-report" style="width: ${dim.progress}%"></div>
                </div>
                <span class="dimension-label-report">${stage}</span>
                <p class="dimension-text">${dim.details}</p>
            </div>
        `;
    }).join('');

    let projectsHTML = learnerData.projects.map(project => {
        const tags = project.tags.split(',').map(tag => 
            `<span class="meta-tag-report">${tag.trim()}</span>`
        ).join('');
        
        return `
            <div class="project-card-report">
                <div class="project-title-report">${project.title}</div>
                <div class="project-meta-report">
                    <span class="meta-tag-report">🗓️ ${project.duration}</span>
                    ${tags}
                </div>
                <p class="project-desc">${project.description}</p>
                ${project.impact ? `
                    <div class="project-impact-report">
                        <div class="impact-title-report">📈 Measurable Impact:</div>
                        <div class="impact-text-report">${project.impact}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    let reflectionsHTML = '';
    if (learnerData.reflections.learner) {
        reflectionsHTML += `
            <div class="reflection-box-report">
                <div class="reflection-author">🌟 Learner's Voice - ${learnerData.name}</div>
                <div class="reflection-text">${learnerData.reflections.learner}</div>
            </div>
        `;
    }
    if (learnerData.reflections.mentor) {
        reflectionsHTML += `
            <div class="reflection-box-report" style="background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%); border-left-color: #9c27b0;">
                <div class="reflection-author" style="color: #7b1fa2;">👨‍🏫 Primary Mentor - ${learnerData.mentor}</div>
                <div class="reflection-text">${learnerData.reflections.mentor}</div>
            </div>
        `;
    }
    if (learnerData.reflections.peer) {
        reflectionsHTML += `
            <div class="reflection-box-report" style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-left-color: #f57c00;">
                <div class="reflection-author" style="color: #e65100;">👭 Peer Mentor</div>
                <div class="reflection-text">${learnerData.reflections.peer}</div>
            </div>
        `;
    }
    if (learnerData.reflections.parent) {
        reflectionsHTML += `
            <div class="reflection-box-report" style="background: linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%); border-left-color: #00897b;">
                <div class="reflection-author" style="color: #00695c;">👪 Parent/Guardian</div>
                <div class="reflection-text">${learnerData.reflections.parent}</div>
            </div>
        `;
    }

    const photoHTML = learnerData.photo 
        ? `<img src="${learnerData.photo}" alt="${learnerData.name}" class="learner-photo">`
        : `<div class="learner-avatar">${learnerData.name.charAt(0).toUpperCase()}</div>`;

    reportCard.innerHTML = `
        <!-- Report Header -->
        <div class="report-header">
            <div class="report-logo">🌱</div>
            <h1>Growth Portfolio Dashboard</h1>
            <p>UIENC 2.0 Interactive Markless Assessment | ${learnerData.period}</p>
        </div>

        <!-- Learner Information -->
        <div class="learner-info-card">
            ${photoHTML}
            <div class="learner-details">
                <h2>${learnerData.name}</h2>
                <div class="detail-grid">
                    <div class="detail-box">
                        <span class="detail-label">Age</span>
                        <span class="detail-value">${learnerData.age} years</span>
                    </div>
                    <div class="detail-box">
                        <span class="detail-label">Learning Pod</span>
                        <span class="detail-value">${learnerData.learningPod}</span>
                    </div>
                    <div class="detail-box">
                        <span class="detail-label">Location</span>
                        <span class="detail-value">${learnerData.location}</span>
                    </div>
                    <div class="detail-box">
                        <span class="detail-label">Primary Mentor</span>
                        <span class="detail-value">${learnerData.mentor}</span>
                    </div>
                    <div class="detail-box">
                        <span class="detail-label">Assessment Period</span>
                        <span class="detail-value">${learnerData.period}</span>
                    </div>
                    <div class="detail-box">
                        <span class="detail-label">Life Passport ID</span>
                        <span class="detail-value">${learnerData.passportId}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Growth Dimensions -->
        <div class="report-section">
            <h3>📊 Multidimensional Growth Assessment</h3>
            ${dimensionsHTML}
        </div>

        <!-- Projects -->
        ${projectsHTML ? `
            <div class="report-section">
                <h3>🎯 Major Projects & Portfolio</h3>
                ${projectsHTML}
            </div>
        ` : ''}

        <!-- Reflections -->
        ${reflectionsHTML ? `
            <div class="report-section">
                <h3>💬 Multiple Perspectives & Voices</h3>
                ${reflectionsHTML}
            </div>
        ` : ''}

        <!-- Contribution Index -->
        <div class="report-section">
            <h3>⭐ Life Contribution Index</h3>
            <div class="contribution-score">
                <div class="score-number">${totalContribution}<span style="font-size: 40px;">/100</span></div>
                <div class="score-label">Life Contribution Index</div>
                <p style="margin-top: 15px; opacity: 0.9; font-size: 14px;">Measuring verified positive impact on community, environment, and knowledge commons</p>
                
                <div class="score-breakdown">
                    <div class="score-item">
                        <div class="score-value">${learnerData.contribution.communityService}/25</div>
                        <div class="score-desc">Community Service</div>
                    </div>
                    <div class="score-item">
                        <div class="score-value">${learnerData.contribution.environmentalAction}/25</div>
                        <div class="score-desc">Environmental Action</div>
                    </div>
                    <div class="score-item">
                        <div class="score-value">${learnerData.contribution.knowledgeSharing}/25</div>
                        <div class="score-desc">Knowledge Sharing</div>
                    </div>
                    <div class="score-item">
                        <div class="score-value">${learnerData.contribution.culturalPreservation}/15</div>
                        <div class="score-desc">Cultural Preservation</div>
                    </div>
                    <div class="score-item">
                        <div class="score-value">${learnerData.contribution.innovation}/10</div>
                        <div class="score-desc">Innovation</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Report Footer -->
        <div class="report-footer">
            <div class="signature-box">
                <div class="signature-line"></div>
                <p class="signature-label">Primary Mentor Signature</p>
                <p class="signature-label">${learnerData.mentor}</p>
            </div>
            <div class="signature-box">
                <div class="signature-line"></div>
                <p class="signature-label">DAO Council Verification</p>
                <p class="signature-label">UIENC Authority</p>
            </div>
        </div>

        <div class="report-date">
            <p>Generated on: ${new Date(learnerData.generatedDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</p>
        </div>

        <div class="dao-badge">
            <h4>🔐 Authority by DAO Council</h4>
            <p>Document ID: ${learnerData.passportId} | Blockchain Authenticated</p>
            <p>Universal Education Network Transformation System | Civilization 3.0 | Education 5.0</p>
        </div>
    `;

    // Show report card section
    document.getElementById('reportCardSection').style.display = 'block';
}

// Download PDF
function downloadPDF() {
    window.print();
}

// Print Report
function printReport() {
    window.print();
}

// Save Current Data
function saveCurrentData() {
    if (!learnerData.name) {
        alert('Please generate a report card first!');
        return;
    }

    // Add to saved reports
    savedReports.push({
        ...learnerData,
        savedDate: new Date().toISOString()
    });

    // Save to local storage
    try {
        const dataStr = JSON.stringify(savedReports);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `learner_data_${learnerData.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        alert('Data saved successfully!');
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error saving data. Please try again.');
    }
}

// Load Saved Reports
function loadSavedReports() {
    const stored = localStorage.getItem('uienc_reports');
    if (stored) {
        try {
            savedReports = JSON.parse(stored);
        } catch (error) {
            console.error('Error loading reports:', error);
        }
    }
}

// Show Previous Reports
function showPreviousReports() {
    const modal = document.getElementById('reportsModal');
    const reportsList = document.getElementById('reportsList');

    if (savedReports.length === 0) {
        reportsList.innerHTML = '<p style="text-align: center; color: #7f8c8d;">No previous reports found.</p>';
    } else {
        reportsList.innerHTML = savedReports.map((report, index) => `
            <div class="report-item">
                <div class="report-info">
                    <h4>${report.name}</h4>
                    <p>${report.period} | ${report.passportId}</p>
                    <p style="font-size: 12px;">Saved: ${new Date(report.savedDate || report.generatedDate).toLocaleDateString()}</p>
                </div>
                <button class="btn btn-primary" onclick="loadReport(${index})">Load</button>
            </div>
        `).join('');
    }

    modal.classList.add('active');
}

// Load Report
function loadReport(index) {
    const report = savedReports[index];
    learnerData = report;
    
    // Fill form with data
    document.getElementById('learnerName').value = report.name;
    document.getElementById('age').value = report.age;
    document.getElementById('learningPod').value = report.learningPod;
    document.getElementById('location').value = report.location;
    document.getElementById('mentor').value = report.mentor;
    document.getElementById('period').value = report.period;
    document.getElementById('passportId').value = report.passportId;
    
    // Fill dimensions
    report.dimensions.forEach((dim, i) => {
        document.getElementById(`dim${i+1}Rating`).value = dim.rating;
        document.getElementById(`dim${i+1}Progress`).value = dim.progress;
        document.getElementById(`dim${i+1}Details`).value = dim.details;
    });
    
    // Fill reflections
    document.getElementById('learnerVoice').value = report.reflections.learner;
    document.getElementById('mentorVoice').value = report.reflections.mentor;
    document.getElementById('peerVoice').value = report.reflections.peer || '';
    document.getElementById('parentVoice').value = report.reflections.parent || '';
    
    // Fill contribution
    document.getElementById('communityService').value = report.contribution.communityService;
    document.getElementById('environmentalAction').value = report.contribution.environmentalAction;
    document.getElementById('knowledgeSharing').value = report.contribution.knowledgeSharing;
    document.getElementById('culturalPreservation').value = report.contribution.culturalPreservation;
    document.getElementById('innovation').value = report.contribution.innovation;
    
    // Generate report card
    generateReportCard();
    
    // Close modal
    document.getElementById('reportsModal').classList.remove('active');
    
    alert('Report loaded successfully!');
}

// Clear Form
function clearForm() {
    if (confirm('Are you sure you want to clear the form? Unsaved data will be lost.')) {
        document.getElementById('learnerForm').reset();
        document.getElementById('reportCardSection').style.display = 'none';
        learnerData = {};
        currentLearnerPhoto = null;
        
        // Reset projects
        const projectsContainer = document.getElementById('projectsContainer');
        projectsContainer.innerHTML = `
            <div class="project-entry">
                <input type="text" placeholder="Project Title" class="project-title">
                <input type="text" placeholder="Duration (e.g., 3 weeks)" class="project-duration">
                <input type="text" placeholder="Tags (comma separated)" class="project-tags">
                <textarea placeholder="Project description..." class="project-description"></textarea>
                <textarea placeholder="Measurable impact..." class="project-impact"></textarea>
            </div>
        `;
        projectCount = 1;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

