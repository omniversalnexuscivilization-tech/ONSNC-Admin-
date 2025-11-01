// Global Variables
let members = JSON.parse(localStorage.getItem('daoMembers')) || [];
let proposals = JSON.parse(localStorage.getItem('daoProposals')) || [];
let editingMemberId = null;
let currentSort = { field: 'id', direction: 'asc' };
let currentPage = 1;
const itemsPerPage = 10;
let charts = {};
let currentTheme = localStorage.getItem('daoTheme') || 'dark';
let currentPhoto = null;

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    loadMembersTable();
    initializeCharts();
    applyTheme(currentTheme);
});

// Initialize Dashboard Components
function initializeDashboard() {
    // Set current date for join date field
    document.getElementById('joinDate').valueAsDate = new Date();
    
    // Generate sample data if empty
    if (members.length === 0) {
        generateSampleData();
    }
    
    // Initialize dashboard stats
    updateDashboardStats();
    
    // Load recent activity
    loadRecentActivity();
    
    // Populate member select for ID cards
    populateMemberSelect();
}

// Setup Event Listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('memberDataForm').addEventListener('submit', handleFormSubmit);
    
    // Button events
    document.getElementById('addMemberBtn').addEventListener('click', showMemberForm);
    document.getElementById('clearForm').addEventListener('click', clearForm);
    document.getElementById('cancelForm').addEventListener('click', cancelEdit);
    document.getElementById('exportData').addEventListener('click', exportData);
    document.getElementById('generateReports').addEventListener('click', generateReports);
    document.getElementById('downloadIdCard').addEventListener('click', downloadIdCard);
    document.getElementById('downloadCertificate').addEventListener('click', downloadCertificate);
    document.getElementById('refreshPreview').addEventListener('click', refreshPreview);
    document.getElementById('bulkGenerateIds').addEventListener('click', bulkGenerateIds);
    document.getElementById('viewAllActivity').addEventListener('click', viewAllActivity);
    
    // Photo upload events
    document.getElementById('uploadTrigger').addEventListener('click', triggerPhotoUpload);
    document.getElementById('photoUpload').addEventListener('change', handlePhotoUpload);
    
    // Menu toggle for mobile
    document.querySelector('.menu-toggle').addEventListener('click', toggleSidebar);
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Quick actions
    document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('click', handleQuickAction);
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Search functionality
    document.getElementById('globalSearch').addEventListener('input', handleGlobalSearch);
    document.getElementById('memberSearch').addEventListener('input', handleMemberSearch);
    
    // Real-time form updates for preview
    const formInputs = document.querySelectorAll('#memberDataForm input, #memberDataForm select, #memberDataForm textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', updatePreviews);
    });
    
    // Table sorting
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', handleTableSort);
    });
    
    // Member select for ID cards
    document.getElementById('memberSelect').addEventListener('change', handleMemberSelect);
}

// Handle Navigation
function handleNavigation(e) {
    e.preventDefault();
    
    // Remove active class from all nav links and sections
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Add active class to clicked nav link
    this.classList.add('active');
    
    // Show corresponding section
    const sectionId = this.getAttribute('data-section') + '-section';
    document.getElementById(sectionId).classList.add('active');
    
    // Update page title
    document.querySelector('.header h1').textContent = this.textContent + ' - DAO Village Council';
    
    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
        document.querySelector('.sidebar').classList.remove('active');
    }
}

// Handle Quick Actions
function handleQuickAction() {
    const action = this.getAttribute('data-action');
    
    switch(action) {
        case 'add-member':
            showMemberForm();
            document.querySelector('.nav-link[data-section="members"]').click();
            break;
        case 'create-proposal':
            showNotification('Proposal creation feature coming soon!', 'info');
            break;
        case 'generate-reports':
            generateReports();
            break;
        case 'manage-treasury':
            document.querySelector('.nav-link[data-section="treasury"]').click();
            break;
    }
}

// Toggle Theme
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    localStorage.setItem('daoTheme', currentTheme);
}

// Apply Theme
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.querySelector('#themeToggle i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Trigger Photo Upload
function triggerPhotoUpload() {
    document.getElementById('photoUpload').click();
}

// Handle Photo Upload
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showNotification('Please select a valid image file (JPG, PNG, or WebP)', 'error');
            return;
        }
        
        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            showNotification('File size must be less than 5MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            currentPhoto = e.target.result;
            
            // Update preview
            const previewImage = document.getElementById('previewImage');
            const previewIcon = document.querySelector('#photoPreview i');
            
            previewImage.src = currentPhoto;
            previewImage.classList.remove('hidden');
            previewIcon.classList.add('hidden');
            
            // Update ID card preview
            updateIDCardPhoto(currentPhoto);
            
            showNotification('Photo uploaded successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// Update ID Card Photo
function updateIDCardPhoto(photoData) {
    const idCardPhoto = document.getElementById('idCardPhoto');
    const idCardIcon = document.querySelector('#idCardPreview .member-photo i');
    
    if (photoData) {
        idCardPhoto.src = photoData;
        idCardPhoto.classList.remove('hidden');
        idCardIcon.classList.add('hidden');
    } else {
        idCardPhoto.classList.add('hidden');
        idCardIcon.classList.remove('hidden');
    }
}

// Generate Sample Data
function generateSampleData() {
    const sampleMembers = [
        {
            id: generateId(),
            fullName: 'Alex Johnson',
            ulpId: 'ULP-IND-ASSAM-00094',
            walletAddress: '0x742d35Cc6634C0532925a3b8Df0A5A7f2F6B3C8D',
            email: 'alex.j@daovillage.org',
            phone: '+91 9876543210',
            role: 'council-member',
            villageCluster: 'Dhuli Moradiring',
            address: '123 Main Street, Dhuli Moradiring, Biswanath, Assam, 784176',
            joinDate: '2024-01-15',
            votingPower: 150,
            status: 'active',
            photo: null,
            createdAt: new Date('2024-01-15').toISOString()
        },
        {
            id: generateId(),
            fullName: 'Sarah Chen',
            ulpId: 'ULP-IND-ASSAM-00123',
            walletAddress: '0x8a3bD49F823E4A5A7f2F6B3C8D742d35Cc6634C0',
            email: 'sarah.chen@daovillage.org',
            phone: '+91 8765432109',
            role: 'delegate',
            villageCluster: 'Biswanath Cluster',
            address: '456 Oak Avenue, Biswanath Chariali, Biswanath, Assam, 784176',
            joinDate: '2024-02-20',
            votingPower: 85,
            status: 'active',
            photo: null,
            createdAt: new Date('2024-02-20').toISOString()
        },
        {
            id: generateId(),
            fullName: 'Marcus Rivera',
            ulpId: 'ULP-IND-ASSAM-00056',
            walletAddress: '0x3C8D742d35Cc6634C0532925a3b8Df0A5A7f2F6B4',
            email: 'marcus.r@daovillage.org',
            phone: '+91 7654321098',
            role: 'citizen',
            villageCluster: 'Dhuli Moradiring',
            address: '789 Pine Road, Dhuli Moradiring, Biswanath, Assam, 784176',
            joinDate: '2024-03-10',
            votingPower: 45,
            status: 'pending',
            photo: null,
            createdAt: new Date('2024-03-10').toISOString()
        },
        {
            id: generateId(),
            fullName: 'Priya Sharma',
            ulpId: 'ULP-IND-ASSAM-00145',
            walletAddress: '0x5a2b4C8D742d35Cc6634C0532925a3b8Df0A5A7f',
            email: 'priya.sharma@daovillage.org',
            phone: '+91 6543210987',
            role: 'guardian',
            villageCluster: 'Biswanath Cluster',
            address: '321 Elm Street, Biswanath Chariali, Biswanath, Assam, 784176',
            joinDate: '2024-03-15',
            votingPower: 200,
            status: 'active',
            photo: null,
            createdAt: new Date('2024-03-15').toISOString()
        },
        {
            id: generateId(),
            fullName: 'David Kim',
            ulpId: 'ULP-IND-ASSAM-00078',
            walletAddress: '0x9f2F6B3C8D742d35Cc6634C0532925a3b8Df0A5A7',
            email: 'david.kim@daovillage.org',
            phone: '+91 5432109876',
            role: 'treasurer',
            villageCluster: 'Dhuli Moradiring',
            address: '654 Maple Avenue, Dhuli Moradiring, Biswanath, Assam, 784176',
            joinDate: '2024-03-20',
            votingPower: 120,
            status: 'active',
            photo: null,
            createdAt: new Date('2024-03-20').toISOString()
        }
    ];
    
    members = sampleMembers;
    saveToLocalStorage();
}

// Generate Unique ID
function generateId() {
    return 'DAO' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Handle Form Submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const formData = new FormData(e.target);
    const memberData = Object.fromEntries(formData);
    
    // Add photo to member data
    memberData.photo = currentPhoto;
    
    if (editingMemberId) {
        // Update existing member
        updateMember(editingMemberId, memberData);
    } else {
        // Add new member
        addMember(memberData);
    }
}

// Validate Form
function validateForm() {
    const form = document.getElementById('memberDataForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = 'var(--danger)';
            isValid = false;
        } else {
            field.style.borderColor = '';
        }
    });
    
    // Validate ULP ID format
    const ulpId = document.getElementById('ulpId').value;
    const ulpPattern = /^ULP-[A-Z]{3}-[A-Z]+-\d{5}$/;
    if (ulpId && !ulpPattern.test(ulpId)) {
        document.getElementById('ulpId').style.borderColor = 'var(--danger)';
        showNotification('ULP ID format should be: ULP-REGION-STATE-XXXXX', 'error');
        isValid = false;
    }
    
    // Validate voting power range
    const votingPower = parseInt(document.getElementById('votingPower').value);
    if (votingPower < 1 || votingPower > 1000) {
        document.getElementById('votingPower').style.borderColor = 'var(--danger)';
        showNotification('Voting power must be between 1 and 1000', 'error');
        isValid = false;
    }
    
    return isValid;
}

// Add New Member
function addMember(data) {
    showLoading(true);
    
    setTimeout(() => {
        const newMember = {
            id: generateId(),
            ...data,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        members.push(newMember);
        saveToLocalStorage();
        loadMembersTable();
        clearForm();
        updateCharts();
        updateDashboardStats();
        populateMemberSelect();
        addActivity('Member added: ' + data.fullName, 'user-plus');
        
        showNotification('Member added successfully!', 'success');
        showLoading(false);
    }, 1000);
}

// Update Existing Member
function updateMember(id, data) {
    showLoading(true);
    
    setTimeout(() => {
        const memberIndex = members.findIndex(member => member.id === id);
        if (memberIndex !== -1) {
            members[memberIndex] = { ...members[memberIndex], ...data };
            saveToLocalStorage();
            loadMembersTable();
            clearForm();
            updateCharts();
            updateDashboardStats();
            populateMemberSelect();
            addActivity('Member updated: ' + data.fullName, 'user-edit');
            
            showNotification('Member updated successfully!', 'success');
        }
        showLoading(false);
    }, 1000);
}

// Delete Member
function deleteMember(id) {
    if (confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
        showLoading(true);
        
        setTimeout(() => {
            const member = members.find(m => m.id === id);
            members = members.filter(member => member.id !== id);
            saveToLocalStorage();
            loadMembersTable();
            updateCharts();
            updateDashboardStats();
            populateMemberSelect();
            
            if (member) {
                addActivity('Member deleted: ' + member.fullName, 'user-minus');
            }
            
            showNotification('Member deleted successfully!', 'success');
            showLoading(false);
        }, 1000);
    }
}

// Edit Member
function editMember(id) {
    const member = members.find(member => member.id === id);
    if (member) {
        // Populate form with member data
        document.getElementById('fullName').value = member.fullName;
        document.getElementById('ulpId').value = member.ulpId;
        document.getElementById('walletAddress').value = member.walletAddress;
        document.getElementById('email').value = member.email;
        document.getElementById('phone').value = member.phone || '';
        document.getElementById('role').value = member.role;
        document.getElementById('villageCluster').value = member.villageCluster;
        document.getElementById('address').value = member.address || '';
        document.getElementById('joinDate').value = member.joinDate;
        document.getElementById('votingPower').value = member.votingPower;
        
        // Handle photo
        if (member.photo) {
            currentPhoto = member.photo;
            const previewImage = document.getElementById('previewImage');
            const previewIcon = document.querySelector('#photoPreview i');
            
            previewImage.src = member.photo;
            previewImage.classList.remove('hidden');
            previewIcon.classList.add('hidden');
            
            updateIDCardPhoto(member.photo);
        }
        
        // Show cancel button and change submit button text
        editingMemberId = id;
        document.getElementById('submitMemberBtn').innerHTML = '<i class="fas fa-edit"></i> Update Member';
        document.getElementById('cancelForm').style.display = 'block';
        
        // Update previews
        updatePreviewsWithMember(member);
        
        // Scroll to form
        document.getElementById('memberForm').scrollIntoView({ behavior: 'smooth' });
    }
}

// Show Member Form
function showMemberForm() {
    document.getElementById('memberForm').style.display = 'block';
    document.getElementById('memberForm').scrollIntoView({ behavior: 'smooth' });
}

// Clear Form
function clearForm() {
    document.getElementById('memberDataForm').reset();
    document.getElementById('joinDate').valueAsDate = new Date();
    editingMemberId = null;
    currentPhoto = null;
    document.getElementById('submitMemberBtn').innerHTML = '<i class="fas fa-save"></i> Save Member';
    document.getElementById('cancelForm').style.display = 'none';
    
    // Reset photo preview
    const previewImage = document.getElementById('previewImage');
    const previewIcon = document.querySelector('#photoPreview i');
    previewImage.classList.add('hidden');
    previewIcon.classList.remove('hidden');
    
    // Reset ID card photo
    updateIDCardPhoto(null);
    
    // Reset border colors
    const formInputs = document.querySelectorAll('#memberDataForm input, #memberDataForm select, #memberDataForm textarea');
    formInputs.forEach(input => {
        input.style.borderColor = '';
    });
    
    updatePreviews();
}

// Cancel Edit
function cancelEdit() {
    clearForm();
}

// Load Members Table
function loadMembersTable() {
    const tbody = document.getElementById('membersTableBody');
    tbody.innerHTML = '';
    
    if (members.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>No members found. Add your first member to get started.</p>
                    <button class="btn-primary" onclick="showMemberForm()">
                        <i class="fas fa-plus"></i> Add First Member
                    </button>
                </td>
            </tr>
        `;
        updatePagination();
        return;
    }
    
    // Apply sorting
    const sortedMembers = sortMembers([...members], currentSort.field, currentSort.direction);
    
    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedMembers = sortedMembers.slice(startIndex, startIndex + itemsPerPage);
    
    paginatedMembers.forEach(member => {
        const row = document.createElement('tr');
        row.className = 'fade-in';
        
        row.innerHTML = `
            <td>${member.id}</td>
            <td>${member.fullName}</td>
            <td><span class="ulp-chip">${member.ulpId}</span></td>
            <td><span class="role-badge role-${member.role}">${formatRole(member.role)}</span></td>
            <td>${member.villageCluster}</td>
            <td>${formatDate(member.joinDate)}</td>
            <td>${member.votingPower}</td>
            <td><span class="status-badge status-${member.status}">${formatStatus(member.status)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editMember('${member.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteMember('${member.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-icon btn-view" onclick="previewMember('${member.id}')" title="Preview ID Card">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    updatePagination();
}

// Sort Members
function sortMembers(membersArray, field, direction) {
    return membersArray.sort((a, b) => {
        let aValue = a[field];
        let bValue = b[field];
        
        // Handle special cases
        if (field === 'joinDate') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        } else if (field === 'votingPower') {
            aValue = parseInt(aValue);
            bValue = parseInt(bValue);
        } else if (field === 'name') {
            aValue = a.fullName;
            bValue = b.fullName;
        } else if (field === 'village') {
            aValue = a.villageCluster;
            bValue = b.villageCluster;
        }
        
        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

// Handle Table Sort
function handleTableSort() {
    const field = this.getAttribute('data-sort');
    
    if (currentSort.field === field) {
        // Toggle direction if same field
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        // New field, default to ascending
        currentSort.field = field;
        currentSort.direction = 'asc';
    }
    
    // Update sort indicators
    document.querySelectorAll('th i').forEach(icon => {
        icon.className = 'fas fa-sort';
    });
    
    const currentIcon = this.querySelector('i');
    currentIcon.className = currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    
    // Reload table
    loadMembersTable();
}

// Update Pagination
function updatePagination() {
    const pagination = document.getElementById('memberPagination');
    const totalPages = Math.ceil(members.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<span class="pagination-dots">...</span>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    // Page info
    paginationHTML += `
        <span class="pagination-info">
            Page ${currentPage} of ${totalPages} (${members.length} members)
        </span>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change Page
function changePage(page) {
    currentPage = page;
    loadMembersTable();
}

// Preview Member in ID Card and Certificate
function previewMember(id) {
    const member = members.find(member => member.id === id);
    if (member) {
        // Update previews
        updatePreviewsWithMember(member);
        
        // Update member select
        document.getElementById('memberSelect').value = id;
        
        // Navigate to ID cards section
        document.querySelector('.nav-link[data-section="id-cards"]').click();
    }
}

// Update Previews with Form Data
function updatePreviews() {
    const formData = new FormData(document.getElementById('memberDataForm'));
    const data = Object.fromEntries(formData);
    
    if (data.fullName) {
        document.getElementById('preview-name').textContent = data.fullName;
        document.getElementById('certificate-name').textContent = data.fullName;
    }
    
    if (data.ulpId) {
        document.getElementById('preview-ulp').textContent = data.ulpId;
        document.getElementById('certificate-ulp').textContent = data.ulpId;
        
        // Generate QR Code
        generateQRCode(data.ulpId);
    }
    
    if (data.role) {
        document.getElementById('preview-role').textContent = formatRole(data.role);
        document.getElementById('certificate-role').textContent = formatRole(data.role);
    }
    
    if (data.villageCluster) {
        document.getElementById('preview-village').textContent = data.villageCluster;
    }
    
    if (data.address) {
        document.getElementById('preview-address').textContent = data.address;
    }
    
    if (data.joinDate) {
        document.getElementById('preview-joined').textContent = formatDate(data.joinDate);
        document.getElementById('certificate-date').textContent = formatDate(data.joinDate);
    }
    
    // Generate a preview ID
    if (!editingMemberId) {
        document.getElementById('preview-id').textContent = 'DAO' + Date.now().toString(36).substr(0, 8).toUpperCase();
        document.getElementById('certificate-memberid').textContent = 'DAO' + Date.now().toString(36).substr(0, 8).toUpperCase();
    }
}

// Update Previews with Specific Member Data
function updatePreviewsWithMember(member) {
    document.getElementById('preview-name').textContent = member.fullName;
    document.getElementById('preview-ulp').textContent = member.ulpId;
    document.getElementById('preview-id').textContent = member.id;
    document.getElementById('preview-role').textContent = formatRole(member.role);
    document.getElementById('preview-village').textContent = member.villageCluster;
    document.getElementById('preview-address').textContent = member.address || '';
    document.getElementById('preview-joined').textContent = formatDate(member.joinDate);
    
    document.getElementById('certificate-name').textContent = member.fullName;
    document.getElementById('certificate-ulp').textContent = member.ulpId;
    document.getElementById('certificate-role').textContent = formatRole(member.role);
    document.getElementById('certificate-memberid').textContent = member.id;
    document.getElementById('certificate-date').textContent = formatDate(member.joinDate);
    
    // Update photo if available
    if (member.photo) {
        updateIDCardPhoto(member.photo);
    }
    
    // Generate QR Code
    generateQRCode(member.ulpId);
}

// Generate QR Code
function generateQRCode(ulpId) {
    const qrContainer = document.getElementById('qrCodeContainer');
    qrContainer.innerHTML = '';
    
    if (ulpId && ulpId !== '-') {
        try {
            // Generate QR code using the library
            const typeNumber = 0; // Auto detect
            const errorCorrectionLevel = 'L';
            const qr = qrcode(typeNumber, errorCorrectionLevel);
            qr.addData(`https://verify.ulp.daovillage.org/${ulpId}`);
            qr.make();
            
            // Create QR code image
            const qrImg = document.createElement('img');
            qrImg.src = qr.createDataURL();
            qrContainer.appendChild(qrImg);
            
            // Hide the icon
            const qrIcon = qrContainer.querySelector('i');
            if (qrIcon) {
                qrIcon.classList.add('hidden');
            }
        } catch (error) {
            console.error('QR Code generation failed:', error);
            // Fallback to icon if QR generation fails
            qrContainer.innerHTML = '<i class="fas fa-qrcode"></i>';
        }
    } else {
        // Show default icon if no ULP ID
        qrContainer.innerHTML = '<i class="fas fa-qrcode"></i>';
    }
}

// Populate Member Select
function populateMemberSelect() {
    const select = document.getElementById('memberSelect');
    select.innerHTML = '<option value="">Select a member</option>';
    
    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = `${member.fullName} (${member.ulpId})`;
        select.appendChild(option);
    });
}

// Handle Member Select
function handleMemberSelect() {
    const memberId = this.value;
    if (memberId) {
        const member = members.find(m => m.id === memberId);
        if (member) {
            updatePreviewsWithMember(member);
        }
    } else {
        updatePreviews();
    }
}

// Initialize Charts
function initializeCharts() {
    // Role Distribution Chart
    const roleCtx = document.getElementById('roleChart').getContext('2d');
    charts.roleChart = new Chart(roleCtx, {
        type: 'doughnut',
        data: getRoleChartData(),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: function(context) {
                            return getComputedStyle(document.documentElement).getPropertyValue('--text-light');
                        },
                        font: {
                            family: 'Poppins',
                            size: 11
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
    
    // Growth Chart
    const growthCtx = document.getElementById('growthChart').getContext('2d');
    charts.growthChart = new Chart(growthCtx, {
        type: 'line',
        data: getGrowthChartData(),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: function() {
                            return getComputedStyle(document.documentElement).getPropertyValue('--text-light');
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: function() {
                            return getComputedStyle(document.documentElement).getPropertyValue('--text-light');
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: function() {
                            return getComputedStyle(document.documentElement).getPropertyValue('--text-light');
                        },
                        font: {
                            family: 'Poppins'
                        }
                    }
                }
            }
        }
    });
    
    // Voting Power Chart
    const votingCtx = document.getElementById('votingChart').getContext('2d');
    charts.votingChart = new Chart(votingCtx, {
        type: 'bar',
        data: getVotingChartData(),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: function() {
                            return getComputedStyle(document.documentElement).getPropertyValue('--text-light');
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: function() {
                            return getComputedStyle(document.documentElement).getPropertyValue('--text-light');
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: function() {
                            return getComputedStyle(document.documentElement).getPropertyValue('--text-light');
                        },
                        font: {
                            family: 'Poppins'
                        }
                    }
                }
            }
        }
    });
}

// Update Charts
function updateCharts() {
    if (charts.roleChart) {
        charts.roleChart.data = getRoleChartData();
        charts.roleChart.update();
    }
    
    if (charts.growthChart) {
        charts.growthChart.data = getGrowthChartData();
        charts.growthChart.update();
    }
    
    if (charts.votingChart) {
        charts.votingChart.data = getVotingChartData();
        charts.votingChart.update();
    }
}

// Get Role Chart Data
function getRoleChartData() {
    const roleCounts = {
        'citizen': 0,
        'council-member': 0,
        'delegate': 0,
        'guardian': 0,
        'treasurer': 0
    };
    
    members.forEach(member => {
        roleCounts[member.role] = (roleCounts[member.role] || 0) + 1;
    });
    
    return {
        labels: ['Citizens', 'Council Members', 'Delegates', 'Guardians', 'Treasurers'],
        datasets: [{
            data: Object.values(roleCounts),
            backgroundColor: [
                '#00FFFF',
                '#8A2BE2',
                '#FFAA00',
                '#00FF88',
                '#FF4444'
            ],
            borderColor: '#0A192F',
            borderWidth: 2
        }]
    };
}

// Get Growth Chart Data
function getGrowthChartData() {
    // Generate growth data based on member join dates
    const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return date.toLocaleString('en', { month: 'short' });
    });
    
    const monthlyCounts = last6Months.map(month => {
        // In a real app, this would be calculated from actual data
        return Math.floor(Math.random() * 20) + 5;
    });
    
    // Calculate cumulative totals
    const cumulativeCounts = [];
    let total = 0;
    monthlyCounts.forEach(count => {
        total += count;
        cumulativeCounts.push(total);
    });
    
    return {
        labels: last6Months,
        datasets: [
            {
                label: 'New Members',
                data: monthlyCounts,
                borderColor: '#00FFFF',
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Total Members',
                data: cumulativeCounts,
                borderColor: '#8A2BE2',
                backgroundColor: 'transparent',
                tension: 0.4,
                borderDash: [5, 5]
            }
        ]
    };
}

// Get Voting Chart Data
function getVotingChartData() {
    const roles = ['Citizens', 'Council Members', 'Delegates', 'Guardians', 'Treasurers'];
    const avgVotingPower = roles.map(role => {
        const roleKey = role.toLowerCase().replace(' ', '-');
        const roleMembers = members.filter(m => m.role === roleKey);
        if (roleMembers.length === 0) return 0;
        return roleMembers.reduce((sum, m) => sum + parseInt(m.votingPower), 0) / roleMembers.length;
    });
    
    return {
        labels: roles,
        datasets: [{
            label: 'Average Voting Power',
            data: avgVotingPower,
            backgroundColor: '#8A2BE2',
            borderColor: '#00FFFF',
            borderWidth: 2
        }]
    };
}

// Update Dashboard Stats
function updateDashboardStats() {
    document.getElementById('totalMembers').textContent = members.length;
    
    // Calculate member growth (simulated)
    const growth = members.length > 5 ? Math.floor((members.length / 5) * 100 - 100) : 25;
    document.getElementById('memberGrowth').textContent = growth + '%';
    
    // Simulate other stats
    document.getElementById('activeProposals').textContent = '12';
    document.getElementById('proposalGrowth').textContent = '8%';
    document.getElementById('treasuryValue').textContent = '₿ 124.5';
    document.getElementById('treasuryGrowth').textContent = '5.2%';
    document.getElementById('votingParticipation').textContent = '84%';
    document.getElementById('participationChange').textContent = '2%';
}

// Load Recent Activity
function loadRecentActivity() {
    const activityList = document.getElementById('activityList');
    
    // Sample activities
    const activities = [
        { type: 'member-added', message: 'New member Alex Johnson joined', time: '2 hours ago', icon: 'user-plus' },
        { type: 'proposal-created', message: 'New proposal #DAO-124 created', time: '5 hours ago', icon: 'file-alt' },
        { type: 'vote-cast', message: '15 new votes on proposal #DAO-122', time: '1 day ago', icon: 'vote-yea' },
        { type: 'treasury-update', message: 'Treasury received 5.2 ETH', time: '2 days ago', icon: 'coins' },
        { type: 'member-role', message: 'Sarah Chen promoted to Delegate', time: '3 days ago', icon: 'user-tag' }
    ];
    
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item fade-in';
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.message}</p>
                <div class="activity-meta">${activity.time}</div>
            </div>
        `;
        activityList.appendChild(activityItem);
    });
}

// Add Activity
function addActivity(message, icon) {
    const activityList = document.getElementById('activityList');
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item fade-in';
    activityItem.innerHTML = `
        <div class="activity-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="activity-content">
            <p>${message}</p>
            <div class="activity-meta">Just now</div>
        </div>
    `;
    
    // Add to top of list
    if (activityList.firstChild) {
        activityList.insertBefore(activityItem, activityList.firstChild);
    } else {
        activityList.appendChild(activityItem);
    }
    
    // Limit to 5 activities
    if (activityList.children.length > 5) {
        activityList.removeChild(activityList.lastChild);
    }
}

// Export Data
function exportData() {
    const dataStr = JSON.stringify(members, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `dao-members-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Data exported successfully!', 'success');
}

// Generate Reports
function generateReports() {
    showLoading(true);
    
    setTimeout(() => {
        showNotification('PDF reports generated successfully!', 'success');
        addActivity('Member reports generated', 'file-pdf');
        showLoading(false);
    }, 2000);
}

// Download ID Card
function downloadIdCard() {
    const memberSelect = document.getElementById('memberSelect');
    const memberId = memberSelect.value;
    
    if (!memberId) {
        showNotification('Please select a member first', 'error');
        return;
    }
    
    showLoading(true);
    
    setTimeout(() => {
        showNotification('ID Card downloaded successfully!', 'success');
        addActivity('ID Card generated for selected member', 'id-card');
        showLoading(false);
    }, 1500);
}

// Download Certificate
function downloadCertificate() {
    const memberSelect = document.getElementById('memberSelect');
    const memberId = memberSelect.value;
    
    if (!memberId) {
        showNotification('Please select a member first', 'error');
        return;
    }
    
    showLoading(true);
    
    setTimeout(() => {
        showNotification('Certificate downloaded successfully!', 'success');
        addActivity('Certificate generated for selected member', 'certificate');
        showLoading(false);
    }, 1500);
}

// Bulk Generate IDs
function bulkGenerateIds() {
    if (members.length === 0) {
        showNotification('No members available for ID generation', 'error');
        return;
    }
    
    showLoading(true);
    
    setTimeout(() => {
        showNotification(`ID Cards generated for ${members.length} members!`, 'success');
        addActivity(`Bulk ID generation for ${members.length} members`, 'id-card-alt');
        showLoading(false);
    }, 3000);
}

// Refresh Preview
function refreshPreview() {
    const memberSelect = document.getElementById('memberSelect');
    const memberId = memberSelect.value;
    
    if (memberId) {
        const member = members.find(m => m.id === memberId);
        if (member) {
            updatePreviewsWithMember(member);
            showNotification('Preview refreshed!', 'success');
        }
    } else {
        updatePreviews();
        showNotification('Preview refreshed!', 'success');
    }
}

// View All Activity
function viewAllActivity() {
    showNotification('Opening full activity log...', 'info');
    // In a real app, this would open a modal or navigate to full activity page
}

// Handle Global Search
function handleGlobalSearch(e) {
    const query = e.target.value.toLowerCase();
    
    if (query.length < 2) {
        // Reset views if query is too short
        return;
    }
    
    // Search members
    const memberResults = members.filter(member => 
        member.fullName.toLowerCase().includes(query) ||
        member.ulpId.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.villageCluster.toLowerCase().includes(query)
    );
    
    // Search proposals (would be implemented with actual proposal data)
    
    // Show results (in a real app, this would display search results)
    if (memberResults.length > 0) {
        showNotification(`Found ${memberResults.length} members matching "${query}"`, 'info');
    } else {
        showNotification(`No results found for "${query}"`, 'warning');
    }
}

// Handle Member Search
function handleMemberSearch(e) {
    const query = e.target.value.toLowerCase();
    
    if (query) {
        // Filter table (in a real app, this would be more sophisticated)
        const rows = document.querySelectorAll('#membersTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    } else {
        // Show all rows
        const rows = document.querySelectorAll('#membersTableBody tr');
        rows.forEach(row => {
            row.style.display = '';
        });
    }
}

// Toggle Sidebar (Mobile)
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

// Show Loading Spinner
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.add('active');
    } else {
        spinner.classList.remove('active');
    }
}

// Save to Local Storage
function saveToLocalStorage() {
    localStorage.setItem('daoMembers', JSON.stringify(members));
}

// Utility Functions
function formatWalletAddress(address) {
    if (!address) return '';
    return address.substr(0, 6) + '...' + address.substr(-4);
}

function formatRole(role) {
    const roleMap = {
        'citizen': 'Citizen',
        'council-member': 'Council Member',
        'delegate': 'Delegate',
        'guardian': 'Guardian',
        'treasurer': 'Treasurer'
    };
    return roleMap[role] || role;
}

function formatStatus(status) {
    const statusMap = {
        'active': 'Active',
        'pending': 'Pending',
        'inactive': 'Inactive'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type} fade-in`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Add CSS for notifications if not already in CSS
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 300px;
            animation: slideInRight 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .notification.success {
            background: var(--success);
            color: var(--text-dark);
        }
        
        .notification.error {
            background: var(--danger);
            color: var(--text-light);
        }
        
        .notification.warning {
            background: var(--warning);
            color: var(--text-dark);
        }
        
        .notification.info {
            background: var(--accent-cyan);
            color: var(--text-dark);
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Enhanced JavaScript - Add to script.js

// Global variables for new features
let proposals = JSON.parse(localStorage.getItem('daoProposals')) || [];
let transactions = JSON.parse(localStorage.getItem('daoTreasury')) || [];
let fundingRequests = JSON.parse(localStorage.getItem('daoFunding')) || [];
let comments = JSON.parse(localStorage.getItem('daoComments')) || {};
let currentProposalId = null;

// Initialize all new features
function initializeEnhancedFeatures() {
    initializeProposalCharts();
    initializeTreasuryCharts();
    populateProposalCreatorSelect();
    loadProposalsTable();
    loadTransactionsTable();
    loadFundingTable();
    setupProposalEventListeners();
    setupTreasuryEventListeners();
    setupSettingsEventListeners();
    
    // Set default dates for proposal form
    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next week
    
    document.getElementById('proposalStartDate').value = formatDateTimeLocal(startDate);
    document.getElementById('proposalEndDate').value = formatDateTimeLocal(endDate);
    
    // Initialize quorum slider
    initializeQuorumSlider();
}

// Setup new event listeners
function setupProposalEventListeners() {
    document.getElementById('createProposalBtn').addEventListener('click', showProposalForm);
    document.getElementById('proposalDataForm').addEventListener('submit', handleProposalSubmit);
    document.getElementById('cancelProposal').addEventListener('click', hideProposalForm);
    document.getElementById('saveDraftBtn').addEventListener('click', saveProposalDraft);
    document.getElementById('proposalFilter').addEventListener('change', filterProposals);
    document.getElementById('categoryFilter').addEventListener('change', filterProposals);
    document.getElementById('proposalSearch').addEventListener('input', searchProposals);
    
    // Voting buttons
    document.getElementById('voteForBtn').addEventListener('click', () => castVote('yes'));
    document.getElementById('voteAgainstBtn').addEventListener('click', () => castVote('no'));
    document.getElementById('abstainVoteBtn').addEventListener('click', () => castVote('abstain'));
    document.getElementById('delegateVoteBtn').addEventListener('click', delegateVote);
    
    // Comment system
    document.getElementById('submitComment').addEventListener('click', submitComment);
    
    // Modal close
    document.getElementById('closeProposalModal').addEventListener('click', closeProposalModal);
}

function setupTreasuryEventListeners() {
    document.getElementById('addTransactionBtn').addEventListener('click', showTransactionForm);
    document.getElementById('requestFundingBtn').addEventListener('click', showFundingForm);
    document.getElementById('transactionType').addEventListener('change', filterTransactions);
    document.getElementById('transactionCurrency').addEventListener('change', filterTransactions);
    document.getElementById('fundingStatus').addEventListener('change', filterFunding);
}

function setupSettingsEventListeners() {
    document.getElementById('saveBlockchainSettings').addEventListener('click', saveBlockchainSettings);
    document.getElementById('saveSecuritySettings').addEventListener('click', saveSecuritySettings);
    document.getElementById('downloadApp').addEventListener('click', downloadMobileApp);
}

// Initialize quorum slider
function initializeQuorumSlider() {
    const slider = document.getElementById('quorumSlider');
    const value = document.getElementById('quorumValue');
    
    slider.addEventListener('input', function() {
        value.textContent = this.value + '%';
    });
}

// Format date for datetime-local input
function formatDateTimeLocal(date) {
    return date.toISOString().slice(0, 16);
}

// Populate proposal creator select
function populateProposalCreatorSelect() {
    const select = document.getElementById('proposalCreator');
    select.innerHTML = '<option value="">Select Member</option>';
    
    members.forEach(member => {
        if (member.status === 'active') {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = `${member.fullName} (${member.ulpId})`;
            select.appendChild(option);
        }
    });
}

// Show/hide proposal form
function showProposalForm() {
    document.getElementById('proposalForm').style.display = 'block';
    document.getElementById('proposalForm').scrollIntoView({ behavior: 'smooth' });
}

function hideProposalForm() {
    document.getElementById('proposalForm').style.display = 'none';
    document.getElementById('proposalDataForm').reset();
}

// Handle proposal submission
function handleProposalSubmit(e) {
    e.preventDefault();
    
    if (!validateProposalForm()) {
        return;
    }
    
    const formData = new FormData(e.target);
    const proposalData = Object.fromEntries(formData);
    
    createProposal(proposalData);
}

function validateProposalForm() {
    const title = document.getElementById('proposalTitle').value;
    const category = document.getElementById('proposalCategory').value;
    const creator = document.getElementById('proposalCreator').value;
    const startDate = new Date(document.getElementById('proposalStartDate').value);
    const endDate = new Date(document.getElementById('proposalEndDate').value);
    const description = document.getElementById('proposalDescription').value;
    
    if (!title || !category || !creator || !description) {
        showNotification('Please fill in all required fields', 'error');
        return false;
    }
    
    if (startDate >= endDate) {
        showNotification('End date must be after start date', 'error');
        return false;
    }
    
    if (startDate < new Date()) {
        showNotification('Start date must be in the future', 'error');
        return false;
    }
    
    return true;
}

function createProposal(data) {
    showLoading(true);
    
    setTimeout(() => {
        const newProposal = {
            id: 'PROP-' + Date.now().toString(36).toUpperCase(),
            ...data,
            status: 'pending',
            votes: {
                yes: 0,
                no: 0,
                abstain: 0
            },
            voters: [],
            quorum: parseInt(document.getElementById('quorumSlider').value),
            createdAt: new Date().toISOString(),
            totalVotingPower: calculateTotalVotingPower(),
            currentQuorum: 0
        };
        
        proposals.push(newProposal);
        saveProposalsToStorage();
        loadProposalsTable();
        hideProposalForm();
        addActivity('New proposal created: ' + data.proposalTitle, 'file-alt');
        
        showNotification('Proposal created successfully!', 'success');
        showLoading(false);
    }, 1000);
}

function calculateTotalVotingPower() {
    return members.reduce((total, member) => {
        return total + (member.status === 'active' ? parseInt(member.votingPower) : 0);
    }, 0);
}

// Load proposals table
function loadProposalsTable() {
    const tbody = document.getElementById('proposalsTableBody');
    tbody.innerHTML = '';
    
    if (proposals.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="empty-state">
                    <i class="fas fa-vote-yea"></i>
                    <p>No proposals found. Create your first proposal to get started.</p>
                    <button class="btn-primary" onclick="showProposalForm()">
                        <i class="fas fa-plus"></i> Create First Proposal
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    proposals.forEach(proposal => {
        const row = document.createElement('tr');
        const yesPercent = proposal.totalVotingPower > 0 ? 
            (proposal.votes.yes / proposal.totalVotingPower * 100).toFixed(1) : 0;
        const noPercent = proposal.totalVotingPower > 0 ? 
            (proposal.votes.no / proposal.totalVotingPower * 100).toFixed(1) : 0;
        const abstainPercent = proposal.totalVotingPower > 0 ? 
            (proposal.votes.abstain / proposal.totalVotingPower * 100).toFixed(1) : 0;
        
        row.innerHTML = `
            <td>${proposal.id}</td>
            <td>${proposal.proposalTitle}</td>
            <td><span class="role-badge">${proposal.proposalCategory}</span></td>
            <td>${getMemberName(proposal.proposalCreator)}</td>
            <td>${formatDate(proposal.proposalStartDate)}</td>
            <td>${formatDate(proposal.proposalEndDate)}</td>
            <td><span class="status-badge status-${proposal.status}">${proposal.status}</span></td>
            <td>${proposal.votes.yes + proposal.votes.no + proposal.votes.abstain}</td>
            <td>${proposal.quorum}%</td>
            <td>
                <div class="vote-summary">
                    <span style="color: var(--success)">${yesPercent}%</span> /
                    <span style="color: var(--danger)">${noPercent}%</span>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-view" onclick="viewProposal('${proposal.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-edit" onclick="editProposal('${proposal.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteProposal('${proposal.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function getMemberName(memberId) {
    const member = members.find(m => m.id === memberId);
    return member ? member.fullName : 'Unknown Member';
}

// View proposal details
function viewProposal(proposalId) {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) return;
    
    currentProposalId = proposalId;
    
    // Populate modal
    document.getElementById('modalProposalTitle').textContent = proposal.proposalTitle;
    document.getElementById('modalCategory').textContent = proposal.proposalCategory;
    document.getElementById('modalProposer').textContent = getMemberName(proposal.proposalCreator);
    document.getElementById('modalStatus').textContent = proposal.status;
    document.getElementById('modalQuorum').textContent = proposal.quorum + '%';
    document.getElementById('modalDescription').textContent = proposal.proposalDescription;
    document.getElementById('modalDetails').textContent = proposal.proposalDetails || 'No implementation details provided.';
    
    // Update voting results
    updateVotingResults(proposal);
    
    // Load comments
    loadComments(proposalId);
    
    // Show modal
    document.getElementById('proposalModal').classList.add('active');
}

function updateVotingResults(proposal) {
    const container = document.getElementById('modalVotingResults');
    const totalVotes = proposal.votes.yes + proposal.votes.no + proposal.votes.abstain;
    const yesPercent = proposal.totalVotingPower > 0 ? 
        (proposal.votes.yes / proposal.totalVotingPower * 100).toFixed(1) : 0;
    const noPercent = proposal.totalVotingPower > 0 ? 
        (proposal.votes.no / proposal.totalVotingPower * 100).toFixed(1) : 0;
    const abstainPercent = proposal.totalVotingPower > 0 ? 
        (proposal.votes.abstain / proposal.totalVotingPower * 100).toFixed(1) : 0;
    
    container.innerHTML = `
        <h4>Voting Results</h4>
        <div class="vote-bar">
            <div class="vote-option">
                <div class="vote-label">
                    <i class="fas fa-check-circle" style="color: var(--success)"></i>
                    <span>Yes</span>
                </div>
                <span class="vote-percentage">${yesPercent}%</span>
            </div>
            <div class="vote-progress">
                <div class="vote-fill yes" style="width: ${yesPercent}%"></div>
            </div>
        </div>
        
        <div class="vote-bar">
            <div class="vote-option">
                <div class="vote-label">
                    <i class="fas fa-times-circle" style="color: var(--danger)"></i>
                    <span>No</span>
                </div>
                <span class="vote-percentage">${noPercent}%</span>
            </div>
            <div class="vote-progress">
                <div class="vote-fill no" style="width: ${noPercent}%"></div>
            </div>
        </div>
        
        <div class="vote-bar">
            <div class="vote-option">
                <div class="vote-label">
                    <i class="fas fa-minus-circle" style="color: var(--warning)"></i>
                    <span>Abstain</span>
                </div>
                <span class="vote-percentage">${abstainPercent}%</span>
            </div>
            <div class="vote-progress">
                <div class="vote-fill abstain" style="width: ${abstainPercent}%"></div>
            </div>
        </div>
        
        <div class="vote-meta">
            <p>Total Votes: ${totalVotes}</p>
            <p>Quorum Progress: ${proposal.currentQuorum || 0}% / ${proposal.quorum}%</p>
        </div>
    `;
}

function closeProposalModal() {
    document.getElementById('proposalModal').classList.remove('active');
    currentProposalId = null;
}

// Voting system
function castVote(voteType) {
    if (!currentProposalId) return;
    
    const proposal = proposals.find(p => p.id === currentProposalId);
    if (!proposal) return;
    
    // Check if voting is active
    const now = new Date();
    const startDate = new Date(proposal.proposalStartDate);
    const endDate = new Date(proposal.proposalEndDate);
    
    if (now < startDate) {
        showNotification('Voting has not started yet', 'error');
        return;
    }
    
    if (now > endDate) {
        showNotification('Voting has ended', 'error');
        return;
    }
    
    // Simulate voting (in real app, this would use blockchain)
    proposal.votes[voteType]++;
    
    // Update quorum progress
    const totalVotes = proposal.votes.yes + proposal.votes.no + proposal.votes.abstain;
    proposal.currentQuorum = Math.min((totalVotes / proposal.totalVotingPower * 100).toFixed(1), 100);
    
    saveProposalsToStorage();
    updateVotingResults(proposal);
    showNotification(`Vote cast: ${voteType}`, 'success');
}

function delegateVote() {
    showNotification('Vote delegation feature coming soon!', 'info');
}

// Comment system
function loadComments(proposalId) {
    const commentsList = document.getElementById('commentsList');
    const proposalComments = comments[proposalId] || [];
    
    commentsList.innerHTML = '';
    
    if (proposalComments.length === 0) {
        commentsList.innerHTML = '<p class="empty-comments">No comments yet. Be the first to comment!</p>';
        return;
    }
    
    proposalComments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${comment.author}</span>
                <span class="comment-time">${formatDate(comment.timestamp)}</span>
            </div>
            <div class="comment-content">${comment.content}</div>
        `;
        commentsList.appendChild(commentElement);
    });
}

function submitComment() {
    if (!currentProposalId) return;
    
    const commentText = document.getElementById('commentText').value.trim();
    if (!commentText) {
        showNotification('Please enter a comment', 'error');
        return;
    }
    
    const comment = {
        id: 'COMMENT-' + Date.now(),
        author: 'Current User', // In real app, get from auth system
        content: commentText,
        timestamp: new Date().toISOString()
    };
    
    if (!comments[currentProposalId]) {
        comments[currentProposalId] = [];
    }
    
    comments[currentProposalId].push(comment);
    saveCommentsToStorage();
    loadComments(currentProposalId);
    
    document.getElementById('commentText').value = '';
    showNotification('Comment posted successfully!', 'success');
}

// Treasury Management
function loadTransactionsTable() {
    const tbody = document.getElementById('transactionsTableBody');
    tbody.innerHTML = '';
    
    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-exchange-alt"></i>
                    <p>No transactions found.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description}</td>
            <td><span class="type-badge type-${transaction.type}">${transaction.type}</span></td>
            <td>${transaction.amount}</td>
            <td>${transaction.currency}</td>
            <td>${transaction.counterparty || 'N/A'}</td>
            <td><span class="status-badge status-${transaction.status}">${transaction.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-view" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadFundingTable() {
    const tbody = document.getElementById('fundingTableBody');
    tbody.innerHTML = '';
    
    if (fundingRequests.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-hand-holding-usd"></i>
                    <p>No funding requests found.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    fundingRequests.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.id}</td>
            <td>${request.project}</td>
            <td>${getMemberName(request.requester)}</td>
            <td>${request.amount}</td>
            <td>${request.currency}</td>
            <td><span class="status-badge status-${request.status}">${request.status}</span></td>
            <td>${formatDate(request.date)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-view" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${request.status === 'pending' ? `
                        <button class="btn-icon btn-edit" title="Approve">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-icon btn-delete" title="Reject">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Enhanced Charts Initialization
function initializeProposalCharts() {
    // Role Distribution Chart
    const roleCtx = document.getElementById('roleChart').getContext('2d');
    new Chart(roleCtx, {
        type: 'doughnut',
        data: getEnhancedRoleChartData(),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Growth Timeline Chart
    const growthCtx = document.getElementById('growthTimelineChart').getContext('2d');
    new Chart(growthCtx, {
        type: 'line',
        data: getGrowthTimelineData(),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Initialize other charts...
}

function initializeTreasuryCharts() {
    const treasuryCtx = document.getElementById('treasuryFlowChart').getContext('2d');
    new Chart(treasuryCtx, {
        type: 'line',
        data: getTreasuryFlowData(),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// PDF Generation Functions
function downloadIdCard() {
    showLoading(true);
    
    // Use html2pdf library for PDF generation
    const element = document.getElementById('idCardPreview');
    
    setTimeout(() => {
        showNotification('ID Card PDF downloaded successfully!', 'success');
        addActivity('ID Card generated for selected member', 'id-card');
        showLoading(false);
    }, 2000);
}

function downloadCertificate() {
    showLoading(true);
    
    const element = document.getElementById('certificatePreview');
    
    setTimeout(() => {
        showNotification('Certificate PDF downloaded successfully!', 'success');
        addActivity('Certificate generated for selected member', 'certificate');
        showLoading(false);
    }, 2000);
}

function generateMemberDirectory() {
    showLoading(true);
    
    setTimeout(() => {
        showNotification('Member Directory PDF generated successfully!', 'success');
        addActivity('Member directory report generated', 'file-pdf');
        showLoading(false);
    }, 3000);
}

function generateGovernanceReport() {
    showLoading(true);
    
    setTimeout(() => {
        showNotification('Governance Report PDF generated successfully!', 'success');
        addActivity('Governance report generated', 'chart-pie');
        showLoading(false);
    }, 3000);
}

// Settings Functions
function saveBlockchainSettings() {
    const network = document.getElementById('blockchainNetwork').value;
    const contractAddress = document.getElementById('contractAddress').value;
    const rpcUrl = document.getElementById('rpcUrl').value;
    
    // Save settings to localStorage
    const settings = {
        network,
        contractAddress,
        rpcUrl
    };
    
    localStorage.setItem('blockchainSettings', JSON.stringify(settings));
    showNotification('Blockchain settings saved successfully!', 'success');
}

function saveSecuritySettings() {
    const twoFactorAuth = document.getElementById('twoFactorAuth').checked;
    const sessionTimeout = document.getElementById('sessionTimeout').value;
    const ipWhitelist = document.getElementById('ipWhitelist').value;
    
    const securitySettings = {
        twoFactorAuth,
        sessionTimeout,
        ipWhitelist: ipWhitelist.split('\n').filter(ip => ip.trim())
    };
    
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
    showNotification('Security settings saved successfully!', 'success');
}

function downloadMobileApp() {
    showNotification('Mobile app download link sent to your email!', 'info');
}

// Utility functions for enhanced features
function saveProposalsToStorage() {
    localStorage.setItem('daoProposals', JSON.stringify(proposals));
}

function saveCommentsToStorage() {
    localStorage.setItem('daoComments', JSON.stringify(comments));
}

function downloadChart(chartId) {
    showNotification(`Chart ${chartId} exported successfully!`, 'success');
}

// Filter and search functions
function filterProposals() {
    const statusFilter = document.getElementById('proposalFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    // Implementation for filtering proposals
    loadProposalsTable(); // Reload with filters applied
}

function filterTransactions() {
    const typeFilter = document.getElementById('transactionType').value;
    const currencyFilter = document.getElementById('transactionCurrency').value;
    
    // Implementation for filtering transactions
    loadTransactionsTable();
}

function filterFunding() {
    const statusFilter = document.getElementById('fundingStatus').value;
    
    // Implementation for filtering funding requests
    loadFundingTable();
}

function searchProposals() {
    const query = document.getElementById('proposalSearch').value.toLowerCase();
    
    // Implementation for searching proposals
    loadProposalsTable();
}

// Update the existing initializeDashboard function to include new features
const originalInitializeDashboard = initializeDashboard;
initializeDashboard = function() {
    originalInitializeDashboard();
    initializeEnhancedFeatures();
};


// Enhanced PDF Generation Functions
function generatePDF(element, filename, options = {}) {
    const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        ...options
    };

    showLoading(true);
    
    html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
            showLoading(false);
            showNotification(`${filename} downloaded successfully!`, 'success');
        })
        .catch(error => {
            showLoading(false);
            showNotification('Error generating PDF: ' + error.message, 'error');
        });
}

// Enhanced ID Card Download with PDF
function downloadIdCard() {
    const memberSelect = document.getElementById('memberSelect');
    const memberId = memberSelect.value;
    
    if (!memberId) {
        showNotification('Please select a member first', 'error');
        return;
    }
    
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    // Create a temporary element for PDF generation
    const tempElement = document.createElement('div');
    tempElement.innerHTML = generateIDCardHTML(member);
    tempElement.style.padding = '20px';
    tempElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    
    document.body.appendChild(tempElement);
    
    generatePDF(tempElement, `ID_Card_${member.ulpId}.pdf`, {
        html2canvas: { 
            scale: 2,
            backgroundColor: null
        }
    }).then(() => {
        document.body.removeChild(tempElement);
    });
}

// Enhanced Certificate Download with PDF
function downloadCertificate() {
    const memberSelect = document.getElementById('memberSelect');
    const memberId = memberSelect.value;
    
    if (!memberId) {
        showNotification('Please select a member first', 'error');
        return;
    }
    
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    const tempElement = document.createElement('div');
    tempElement.innerHTML = generateCertificateHTML(member);
    tempElement.style.padding = '20px';
    tempElement.style.background = '#ffffff';
    
    document.body.appendChild(tempElement);
    
    generatePDF(tempElement, `Certificate_${member.ulpId}.pdf`, {
        html2canvas: { 
            scale: 2,
            backgroundColor: '#ffffff'
        }
    }).then(() => {
        document.body.removeChild(tempElement);
    });
}

function generateIDCardHTML(member) {
    return `
        <div style="width: 85mm; height: 54mm; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; padding: 15px; font-family: Arial, sans-serif; position: relative; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.3);">
                <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; font-size: 14px;">
                    <i class="fas fa-network-wired"></i>
                    <span>DAO VILLAGE</span>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 600;">MEMBER ID</div>
            </div>
            
            <div style="display: flex; gap: 15px; align-items: flex-start;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; border: 2px solid white; overflow: hidden;">
                    ${member.photo ? 
                        `<img src="${member.photo}" style="width: 100%; height: 100%; object-fit: cover;" alt="Photo">` :
                        `<i class="fas fa-user" style="font-size: 30px; color: white;"></i>`
                    }
                </div>
                
                <div style="flex: 1;">
                    <div style="margin-bottom: 8px;">
                        <strong style="font-size: 16px;">${member.fullName}</strong>
                    </div>
                    <div style="font-size: 10px; margin-bottom: 4px;">
                        <strong>ULP ID:</strong> ${member.ulpId}
                    </div>
                    <div style="font-size: 10px; margin-bottom: 4px;">
                        <strong>DAO ID:</strong> ${member.id}
                    </div>
                    <div style="font-size: 10px; margin-bottom: 4px;">
                        <strong>Role:</strong> ${formatRole(member.role)}
                    </div>
                    <div style="font-size: 10px;">
                        <strong>Village:</strong> ${member.villageCluster}
                    </div>
                </div>
            </div>
            
            <div style="position: absolute; bottom: 15px; right: 15px; text-align: center;">
                <div style="width: 50px; height: 50px; background: white; border-radius: 6px; margin-bottom: 4px;"></div>
                <div style="font-size: 8px; opacity: 0.8;">verify.ulp.daovillage.org</div>
            </div>
            
            <div style="position: absolute; top: 15px; right: 15px; background: rgba(74, 0, 130, 0.2); padding: 4px 8px; border-radius: 15px; font-size: 8px; border: 1px solid rgba(74, 0, 130, 0.5);">
                <i class="fas fa-microchip"></i> ULP VERIFIED
            </div>
        </div>
    `;
}

function generateCertificateHTML(member) {
    return `
        <div style="width: 210mm; height: 297mm; background: #ffffff; color: #1a1a1a; padding: 40px; font-family: 'Times New Roman', serif; border: 3px solid #8A2BE2; text-align: center;">
            <div style="margin-bottom: 40px;">
                <div style="font-size: 48px; color: #8A2BE2; margin-bottom: 20px;">
                    <i class="fas fa-network-wired"></i>
                </div>
                <h1 style="color: #4B0082; margin-bottom: 10px; font-size: 32px;">Certificate of Membership</h1>
                <p style="color: #666666; font-size: 16px;">Authorized by Universal Life Passport Network</p>
            </div>
            
            <div style="margin: 60px 0;">
                <p style="font-size: 18px; margin-bottom: 20px;">This is to certify that</p>
                <h2 style="color: #1a1a1a; font-size: 36px; margin: 30px 0; border-bottom: 2px solid #8A2BE2; padding-bottom: 20px; display: inline-block;">${member.fullName}</h2>
                <p style="font-size: 18px; margin-bottom: 20px;">has been officially registered as a valued member of</p>
                <h3 style="color: #8A2BE2; font-size: 28px; margin: 30px 0;">DAO VILLAGE COUNCIL</h3>
            </div>
            
            <div style="background: rgba(138, 43, 226, 0.1); padding: 30px; border-radius: 10px; margin: 40px 0; text-align: left;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div><strong>ULP ID:</strong> ${member.ulpId}</div>
                    <div><strong>Role:</strong> ${formatRole(member.role)}</div>
                    <div><strong>Member ID:</strong> ${member.id}</div>
                    <div><strong>Date of Issuance:</strong> ${formatDate(member.joinDate)}</div>
                </div>
            </div>
            
            <div style="margin-top: 80px;">
                <div style="width: 200px; height: 1px; background: #1a1a1a; margin: 0 auto 10px;"></div>
                <p style="font-size: 16px; margin-bottom: 5px;">Shivanta Ronghang</p>
                <p style="font-size: 14px; color: #666666;">Founder, ONSNC Foundation</p>
            </div>
            
            <div style="margin-top: 40px; background: rgba(74, 0, 130, 0.2); padding: 10px 20px; border-radius: 20px; display: inline-block; border: 1px solid rgba(74, 0, 130, 0.5);">
                <i class="fas fa-shield-alt"></i> VERIFIED ON ULP CHAIN
            </div>
        </div>
    `;
}

