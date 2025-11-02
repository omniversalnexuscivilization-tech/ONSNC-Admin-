document.addEventListener('DOMContentLoaded', function() {
  // Tab functionality
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(targetTab).classList.add('active');
      
      // If switching to report tab, update the report
      if (targetTab === 'growth-report') {
        updateGrowthReport();
        updateReportCard();
      }
    });
  });
  
  // Initialize slider value displays
  const sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach(slider => {
    const valueDisplay = document.getElementById(slider.id + 'Value');
    valueDisplay.textContent = slider.value;
    
    slider.addEventListener('input', function() {
      valueDisplay.textContent = this.value;
      // Update report if we're on the report tab
      if (document.getElementById('growth-report').classList.contains('active')) {
        updateGrowthReport();
        updateReportCard();
      }
    });
  });
  
  // Update report when form inputs change
  document.querySelectorAll('#mentorForm input, textarea').forEach(input => {
    input.addEventListener('input', function() {
      if (document.getElementById('growth-report').classList.contains('active')) {
        updateGrowthReport();
        updateReportCard();
      }
    });
  });
  
  // Handle profile photo upload
  document.getElementById('profilePhoto').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const profilePhotoContainer = document.getElementById('profilePhotoContainer');
        profilePhotoContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = e.target.result;
        profilePhotoContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Handle signature upload
  document.getElementById('signature').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const signatureContainer = document.getElementById('signatureContainer');
        signatureContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        signatureContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Save Report functionality
  document.getElementById('saveBtn').addEventListener('click', function() {
    const mentorData = collectFormData();
    localStorage.setItem('mentorAssessment', JSON.stringify(mentorData));
    alert('Assessment saved successfully!');
  });
  
  // Submit to Google Drive (simulated)
  document.getElementById('submitBtn').addEventListener('click', function() {
    const mentorData = collectFormData();
    // In a real implementation, this would send data to Google Apps Script
    alert('Data submitted to Google Drive (simulated). In a real implementation, this would save to Google Drive.');
  });
  
  // New Entry functionality
  document.getElementById('newEntryBtn').addEventListener('click', function() {
    if (confirm('Are you sure you want to start a new assessment? Unsaved changes will be lost.')) {
      document.getElementById('mentorForm').reset();
      document.querySelectorAll('input[type="range"]').forEach(slider => {
        slider.value = 3;
        document.getElementById(slider.id + 'Value').textContent = '3';
      });
      document.querySelectorAll('textarea').forEach(textarea => {
        textarea.value = '';
      });
      // Reset profile photo and signature
      document.getElementById('profilePhotoContainer').innerHTML = '<div class="profile-photo-placeholder"><i class="fas fa-user"></i></div>';
      document.getElementById('signatureContainer').innerHTML = '<div class="signature-placeholder">Signature will appear here</div>';
      updateGrowthReport();
      updateReportCard();
    }
  });
  
  // PDF Download functionality
  document.getElementById('downloadBtn').addEventListener('click', function() {
    generatePDF();
  });
  
  document.getElementById('downloadReportBtn').addEventListener('click', function() {
    generatePDF();
  });
  
  // Update Report functionality
  document.getElementById('updateReportBtn').addEventListener('click', function() {
    updateGrowthReport();
    updateReportCard();
    alert('Report updated with latest data!');
  });
  
  // Helper function to collect all form data
  function collectFormData() {
    const data = {};
    
    // Collect text inputs
    const textInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
    textInputs.forEach(input => {
      data[input.id] = input.value;
    });
    
    // Collect slider values
    sliders.forEach(slider => {
      data[slider.id] = slider.value;
    });
    
    return data;
  }
  
  // Update Report Card
  function updateReportCard() {
    const data = collectFormData();
    
    // Update mentor info
    document.getElementById('reportMentorName').textContent = data.mentorName || 'Not specified';
    document.getElementById('reportInstitution').textContent = data.institution || 'Not specified';
    
    // Calculate overall score
    let totalScore = 0;
    let scoreCount = 0;
    
    sliders.forEach(slider => {
      totalScore += parseInt(slider.value);
      scoreCount++;
    });
    
    const overallScore = (totalScore / scoreCount).toFixed(1);
    document.getElementById('reportOverallScore').textContent = overallScore;
    
    // Set performance level
    let performanceLevel = 'Developing';
    if (overallScore >= 4.5) performanceLevel = 'Exemplary';
    else if (overallScore >= 4.0) performanceLevel = 'Proficient';
    else if (overallScore >= 3.0) performanceLevel = 'Competent';
    
    document.getElementById('reportPerformanceLevel').textContent = performanceLevel;
    
    // Set progress percentage (simulated)
    const progressPercent = Math.min(100, Math.round((overallScore / 5) * 100));
    document.getElementById('reportProgress').textContent = `${progressPercent}%`;
    
    // Set ranking (simulated)
    const rankings = ['Top 5%', 'Top 10%', 'Top 25%', 'Average', 'Below Average'];
    let rankingIndex = 4;
    if (overallScore >= 4.5) rankingIndex = 0;
    else if (overallScore >= 4.0) rankingIndex = 1;
    else if (overallScore >= 3.5) rankingIndex = 2;
    else if (overallScore >= 3.0) rankingIndex = 3;
    
    document.getElementById('reportRanking').textContent = rankings[rankingIndex];
    
    // Update dimension scores
    updateReportDimensionScores();
    
    // Update dates
    const now = new Date();
    document.getElementById('reportIssueDate').textContent = `Issued: ${now.toLocaleDateString()}`;
    
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);
    document.getElementById('reportValidUntil').textContent = `Valid Until: ${validUntil.toLocaleDateString()}`;
    
    // Generate report ID
    document.getElementById('reportId').textContent = `UHAN-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // Generate QR code for report
    generateReportQRCode();
  }
  
  // Update Report Dimension Scores
  function updateReportDimensionScores() {
    const container = document.getElementById('reportDimensionScores');
    container.innerHTML = '';
    
    const dimensions = [
      { id: 'facilitation', label: 'Facilitation & Learning Design' },
      { id: 'guidance', label: 'Mentorship & Guidance' },
      { id: 'innovation', label: 'Innovation & Impact' },
      { id: 'ethics', label: 'Ethical Conduct' },
      { id: 'community', label: 'Community Contribution' },
      { id: 'teachingMethods', label: 'Teaching Methods' },
      { id: 'strategy', label: 'Teaching Strategy' },
      { id: 'lessonPlan', label: 'Lesson Plan Quality' },
      { id: 'ict', label: 'Use of ICT' }
    ];
    
    dimensions.forEach(dim => {
      const value = document.getElementById(dim.id).value;
      
      const item = document.createElement('div');
      item.className = 'dimension-item';
      
      const name = document.createElement('div');
      name.className = 'dimension-name';
      name.textContent = dim.label;
      
      const rating = document.createElement('div');
      rating.className = 'dimension-rating';
      
      const stars = document.createElement('div');
      stars.className = 'rating-stars';
      stars.innerHTML = '★'.repeat(value) + '☆'.repeat(5-value);
      
      const valueDisplay = document.createElement('div');
      valueDisplay.className = 'rating-value';
      valueDisplay.textContent = `${value}/5`;
      
      rating.appendChild(stars);
      rating.appendChild(valueDisplay);
      
      item.appendChild(name);
      item.appendChild(rating);
      
      container.appendChild(item);
    });
  }
  
  // Generate QR Code for Report
  function generateReportQRCode() {
    const container = document.getElementById('reportQrCode');
    container.innerHTML = '';
    
    const reportData = {
      mentorName: document.getElementById('mentorName').value,
      ulcId: document.getElementById('ulcId').value,
      institution: document.getElementById('institution').value,
      issueDate: new Date().toLocaleDateString(),
      reportId: document.getElementById('reportId').textContent
    };
    
    const dataString = JSON.stringify(reportData);
    
    // Generate QR code
    const qrcode = new QRCode(container, {
      text: dataString,
      width: 120,
      height: 120,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  }
  
  // Update Growth Report
  function updateGrowthReport() {
    const data = collectFormData();
    
    // Calculate overall score
    let totalScore = 0;
    let scoreCount = 0;
    
    sliders.forEach(slider => {
      totalScore += parseInt(slider.value);
      scoreCount++;
    });
    
    const overallScore = (totalScore / scoreCount).toFixed(1);
    document.getElementById('overallScore').textContent = overallScore;
    
    // Set performance level
    let performanceLevel = 'Developing';
    if (overallScore >= 4.5) performanceLevel = 'Exemplary';
    else if (overallScore >= 4.0) performanceLevel = 'Proficient';
    else if (overallScore >= 3.0) performanceLevel = 'Competent';
    
    document.getElementById('performanceLevel').textContent = performanceLevel;
    
    // Set progress percentage (simulated)
    const progressPercent = Math.min(100, Math.round((overallScore / 5) * 100));
    document.getElementById('progressPercent').textContent = `${progressPercent}%`;
    
    // Set ranking (simulated)
    const rankings = ['Top 5%', 'Top 10%', 'Top 25%', 'Average', 'Below Average'];
    let rankingIndex = 4;
    if (overallScore >= 4.5) rankingIndex = 0;
    else if (overallScore >= 4.0) rankingIndex = 1;
    else if (overallScore >= 3.5) rankingIndex = 2;
    else if (overallScore >= 3.0) rankingIndex = 3;
    
    document.getElementById('ranking').textContent = rankings[rankingIndex];
    
    // Update dimension chart
    updateDimensionChart();
    
    // Update strengths and improvements
    updateStrengthsAndImprovements(data);
  }
  
  // Update Dimension Chart
  function updateDimensionChart() {
    const chart = document.getElementById('dimensionChart');
    chart.innerHTML = '';
    
    const dimensions = [
      { id: 'facilitation', label: 'Facilitation' },
      { id: 'guidance', label: 'Guidance' },
      { id: 'innovation', label: 'Innovation' },
      { id: 'ethics', label: 'Ethics' },
      { id: 'community', label: 'Community' },
      { id: 'teachingMethods', label: 'Methods' },
      { id: 'strategy', label: 'Strategy' },
      { id: 'lessonPlan', label: 'Lesson Plan' },
      { id: 'ict', label: 'ICT' }
    ];
    
    dimensions.forEach(dim => {
      const value = document.getElementById(dim.id).value;
      const height = (value / 5) * 100;
      
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      bar.style.height = `${height}%`;
      
      const valueLabel = document.createElement('div');
      valueLabel.className = 'chart-bar-value';
      valueLabel.textContent = value;
      
      const dimLabel = document.createElement('div');
      dimLabel.className = 'chart-bar-label';
      dimLabel.textContent = dim.label;
      
      bar.appendChild(valueLabel);
      bar.appendChild(dimLabel);
      chart.appendChild(bar);
    });
  }
  
  // Update Strengths and Improvements
  function updateStrengthsAndImprovements(data) {
    const strengthsList = document.getElementById('strengthsList');
    const improvementsList = document.getElementById('improvementsList');
    
    strengthsList.innerHTML = '';
    improvementsList.innerHTML = '';
    
    // Find dimensions with high scores (4 or 5)
    const highScores = [];
    const lowScores = [];
    
    sliders.forEach(slider => {
      const value = parseInt(slider.value);
      const label = document.querySelector(`label[for="${slider.id}"] span`).textContent;
      
      if (value >= 4) {
        highScores.push({ label, value });
      } else if (value <= 2) {
        lowScores.push({ label, value });
      }
    });
    
    // Add strengths
    if (highScores.length > 0) {
      highScores.forEach(item => {
        const li = document.createElement('div');
        li.textContent = `${item.label} (${item.value}/5)`;
        li.style.padding = '5px 0';
        li.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        strengthsList.appendChild(li);
      });
    } else {
      strengthsList.innerHTML = '<p>No standout strengths identified. Focus on improving all dimensions.</p>';
    }
    
    // Add improvements
    if (lowScores.length > 0) {
      lowScores.forEach(item => {
        const li = document.createElement('div');
        li.textContent = `${item.label} (${item.value}/5)`;
        li.style.padding = '5px 0';
        li.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        improvementsList.appendChild(li);
      });
    } else {
      improvementsList.innerHTML = '<p>All dimensions are at satisfactory levels. Focus on maintaining excellence.</p>';
    }
    
    // Add SWOT data if available
    if (data.strengths) {
      const li = document.createElement('div');
      li.textContent = data.strengths;
      li.style.padding = '5px 0';
      li.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
      li.style.fontStyle = 'italic';
      strengthsList.appendChild(li);
    }
  }
  
  // Generate PDF
  function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add content to PDF
    doc.setFontSize(20);
    doc.setTextColor(106, 13, 173);
    doc.text('UHAN 360° Mentor Assessment', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Mentor Info
    doc.text(`Mentor Name: ${document.getElementById('mentorName').value}`, 20, 50);
    doc.text(`Contact Number: ${document.getElementById('contactNumber').value}`, 20, 60);
    doc.text(`ULC ID: ${document.getElementById('ulcId').value}`, 20, 70);
    doc.text(`ULP Token: ${document.getElementById('ulpToken').value}`, 20, 80);
    doc.text(`Institution: ${document.getElementById('institution').value}`, 20, 90);
    
    // Assessment Scores
    let yPos = 110;
    doc.text('Assessment Scores:', 20, yPos);
    yPos += 10;
    
    sliders.forEach(slider => {
      const label = document.querySelector(`label[for="${slider.id}"] span`).textContent;
      doc.text(`${label}: ${slider.value}/5`, 20, yPos);
      yPos += 7;
    });
    
    // SWOT Analysis
    yPos += 10;
    doc.text('SWOT Analysis:', 20, yPos);
    yPos += 10;
    doc.text(`Strengths: ${document.getElementById('strengths').value}`, 20, yPos);
    yPos += 20;
    doc.text(`Weaknesses: ${document.getElementById('weaknesses').value}`, 20, yPos);
    yPos += 20;
    doc.text(`Opportunities: ${document.getElementById('opportunities').value}`, 20, yPos);
    yPos += 20;
    doc.text(`Threats: ${document.getElementById('threats').value}`, 20, yPos);
    
    // Way Forward
    yPos += 30;
    doc.text('Way Forward:', 20, yPos);
    yPos += 10;
    const wayForwardText = doc.splitTextToSize(document.getElementById('wayForward').value, 170);
    doc.text(wayForwardText, 20, yPos);
    
    // Comments
    yPos += wayForwardText.length * 7 + 10;
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.text('Comments:', 20, yPos);
    yPos += 10;
    const commentsText = doc.splitTextToSize(document.getElementById('mentorComments').value, 170);
    doc.text(commentsText, 20, yPos);
    
    // Save the PDF
    doc.save(`UHAN_Mentor_Assessment_${document.getElementById('mentorName').value || 'Unknown'}.pdf`);
  }
  
  // Check if there's saved data and offer to load it
  window.addEventListener('load', function() {
    const savedData = localStorage.getItem('mentorAssessment');
    if (savedData) {
      if (confirm('Found a previously saved assessment. Would you like to load it?')) {
        const data = JSON.parse(savedData);
        populateForm(data);
      }
    }
    
    // Initialize the growth report and report card
    updateGrowthReport();
    updateReportCard();
  });
  
  // Helper function to populate form with data
  function populateForm(data) {
    for (const key in data) {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === 'range') {
          element.value = data[key];
          document.getElementById(element.id + 'Value').textContent = data[key];
        } else {
          element.value = data[key];
        }
      }
    }
  }
});
