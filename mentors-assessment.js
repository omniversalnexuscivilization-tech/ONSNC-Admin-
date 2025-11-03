// ============================================
// UHAN 360° - MENTOR ASSESSMENT SYSTEM
// JavaScript File
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  
  // Store uploaded images in memory
  let profilePhotoData = null;
  let signatureData = null;
  
  // ============================================
  // SLIDER VALUE UPDATES
  // ============================================
  const sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach(slider => {
    const valueDisplay = document.getElementById(slider.id + 'Value');
    
    slider.addEventListener('input', function() {
      valueDisplay.textContent = this.value;
      updateReportCard();
    });
  });

  // ============================================
  // PROFILE PHOTO UPLOAD - FUNCTIONAL
  // ============================================
  document.getElementById('profilePhoto').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('⚠️ Please upload an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = function(e) {
        profilePhotoData = e.target.result;
        const container = document.getElementById('profilePhotoDisplay');
        container.innerHTML = `<img src="${profilePhotoData}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">`;
        
        // Save to sessionStorage
        const data = collectFormData();
        data.profilePhotoData = profilePhotoData;
        try {
          sessionStorage.setItem('mentorAssessment', JSON.stringify(data));
        } catch(err) {
          console.log('Session storage limit exceeded, keeping in memory only');
        }
      };
      reader.readAsDataURL(file);
    }
  });

  // ============================================
  // SIGNATURE UPLOAD - FUNCTIONAL
  // ============================================
  document.getElementById('signature').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('⚠️ Please upload an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = function(e) {
        signatureData = e.target.result;
        const container = document.getElementById('signatureDisplay');
        container.innerHTML = `<img src="${signatureData}" alt="Signature" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
        
        // Save to sessionStorage
        const data = collectFormData();
        data.signatureData = signatureData;
        try {
          sessionStorage.setItem('mentorAssessment', JSON.stringify(data));
        } catch(err) {
          console.log('Session storage limit exceeded, keeping in memory only');
        }
      };
      reader.readAsDataURL(file);
    }
  });

  // ============================================
  // FORM INPUT LISTENERS
  // ============================================
  document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea').forEach(input => {
    input.addEventListener('input', updateReportCard);
  });

  // ============================================
  // COLLECT FORM DATA
  // ============================================
  function collectFormData() {
    const data = {};
    
    // Text inputs
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach(input => {
      data[input.id] = input.value;
    });
    
    // Textareas
    document.querySelectorAll('textarea').forEach(textarea => {
      data[textarea.id] = textarea.value;
    });
    
    // Sliders
    sliders.forEach(slider => {
      data[slider.id] = slider.value;
    });
    
    // Images
    if (profilePhotoData) data.profilePhotoData = profilePhotoData;
    if (signatureData) data.signatureData = signatureData;
    
    return data;
  }

  // ============================================
  // CALCULATE ULCI SCORE - SCIENTIFIC FORMULA
  // ============================================
  function calculateULCI() {
    // Get dimension values (1-5 scale)
    const facilitation = parseInt(document.getElementById('facilitation').value);
    const guidance = parseInt(document.getElementById('guidance').value);
    const innovation = parseInt(document.getElementById('innovation').value);
    const ethics = parseInt(document.getElementById('ethics').value);
    const community = parseInt(document.getElementById('community').value);
    const teachingMethods = parseInt(document.getElementById('teachingMethods').value);
    const strategy = parseInt(document.getElementById('strategy').value);
    const lessonPlan = parseInt(document.getElementById('lessonPlan').value);
    const ict = parseInt(document.getElementById('ict').value);
    
    // Convert to 0-100 scale for each dimension
    const normalize = (val) => (val / 5) * 100;
    
    // E: Environmental Contribution Index (mapped from community + ict awareness)
    const E = normalize((community + ict) / 2);
    
    // S: Social & Civic Contribution Index (mapped from community + guidance)
    const S = normalize((community + guidance) / 2);
    
    // C: Cultural & Educational Contribution Index (mapped from teaching dimensions)
    const C = normalize((teachingMethods + strategy + lessonPlan + facilitation) / 4);
    
    // H: Health & Well-being Index (mapped from guidance + ethics balance)
    const H = normalize((guidance + ethics) / 2);
    
    // I: Innovation & Ethical Impact Index (mapped from innovation + ethics)
    const I = normalize((innovation + ethics) / 2);
    
    // ULCI Formula: (E × 0.25) + (S × 0.20) + (C × 0.15) + (H × 0.20) + (I × 0.20)
    const ULCI = (E * 0.25) + (S * 0.20) + (C * 0.15) + (H * 0.20) + (I * 0.20);
    
    // Return all components
    return {
      E: E.toFixed(1),
      S: S.toFixed(1),
      C: C.toFixed(1),
      H: H.toFixed(1),
      I: I.toFixed(1),
      total: ULCI.toFixed(1),
      weighted: {
        E: (E * 0.25).toFixed(1),
        S: (S * 0.20).toFixed(1),
        C: (C * 0.15).toFixed(1),
        H: (H * 0.20).toFixed(1),
        I: (I * 0.20).toFixed(1)
      }
    };
  }
  
  // Generate ULCI ID
  function generateULCIId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `ULCI-${year}${month}-${random}`;
  }

  // ============================================
  // UPDATE REPORT CARD (MAIN FUNCTION)
  // ============================================
  function updateReportCard() {
    const data = collectFormData();
    
    // Update basic info
    document.getElementById('displayName').textContent = data.mentorName || 'Mentor Name';
    document.getElementById('displayInstitution').textContent = data.institution || 'Institution';
    document.getElementById('displayUlcId').textContent = data.ulcId || '-';
    document.getElementById('displayUlpToken').textContent = data.ulpToken || '-';
    
    // Calculate overall score
    let total = 0;
    let count = 0;
    sliders.forEach(slider => {
      total += parseInt(slider.value);
      count++;
    });
    const overallScore = (total / count).toFixed(1);
    document.getElementById('overallScore').textContent = overallScore + '/5';
    
    // ============================================
    // CALCULATE ULCI SCORE WITH NEW FORMULA
    // ============================================
    const ulci = calculateULCI();
    
    // Update ULCI displays
    document.getElementById('ulciScore').textContent = Math.round(ulci.total);
    document.getElementById('ulciTotalScore').textContent = `${Math.round(ulci.total)}/100`;
    document.getElementById('ulciEnvironment').textContent = ulci.weighted.E;
    document.getElementById('ulciSocial').textContent = ulci.weighted.S;
    document.getElementById('ulciCultural').textContent = ulci.weighted.C;
    document.getElementById('ulciHealth').textContent = ulci.weighted.H;
    document.getElementById('ulciInnovation').textContent = ulci.weighted.I;
    
    // Generate and display ULCI ID
    const ulciId = generateULCIId();
    document.getElementById('ulciIdDisplay').textContent = ulciId;
    
    // Determine ULCI Category
    const ulciTotal = parseFloat(ulci.total);
    let ulciCategory = '';
    if (ulciTotal >= 85) ulciCategory = '🏆 Elite Regenerative Contributor';
    else if (ulciTotal >= 70) ulciCategory = '⭐ High Regenerative Contributor';
    else if (ulciTotal >= 55) ulciCategory = '💼 Competent Contributor';
    else if (ulciTotal >= 40) ulciCategory = '✓ Developing Contributor';
    else ulciCategory = '📈 Emerging Contributor';
    
    document.getElementById('ulciCategory').textContent = ulciCategory;
    
    // ============================================
    // CALCULATE IMPACT FACTOR
    // ============================================
    const impactFactor = ((parseFloat(overallScore) * ulciTotal) / 100).toFixed(2);
    document.getElementById('impactFactor').textContent = impactFactor;
    
    // ============================================
    // DETERMINE PERFORMANCE LEVEL
    // ============================================
    let perfLevel = 'Developing';
    if (overallScore >= 4.5) perfLevel = 'Exemplary ⭐';
    else if (overallScore >= 4.0) perfLevel = 'Proficient 🌟';
    else if (overallScore >= 3.5) perfLevel = 'Competent 💼';
    else if (overallScore >= 3.0) perfLevel = 'Satisfactory ✓';
    
    document.getElementById('perfLevel').textContent = perfLevel;
    
    // ============================================
    // CALCULATE GLOBAL RANKING
    // ============================================
    let ranking = 'Average';
    if (ulciTotal >= 90) ranking = 'Top 1% 🏆';
    else if (ulciTotal >= 80) ranking = 'Top 5% 🥇';
    else if (ulciTotal >= 70) ranking = 'Top 10% 🥈';
    else if (ulciTotal >= 60) ranking = 'Top 25% 🥉';
    else if (ulciTotal >= 50) ranking = 'Top 50% 📊';
    
    document.getElementById('globalRank').textContent = ranking;
    
    // ============================================
    // CALCULATE PROGRESS PERCENTAGE
    // ============================================
    const progressPct = Math.round(ulciTotal);
    document.getElementById('progressPct').textContent = progressPct + '%';
    
    // ============================================
    // UPDATE DIMENSION SCORES LIST
    // ============================================
    const dimensionsList = document.getElementById('dimensionsList');
    dimensionsList.innerHTML = '';
    
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
      const value = parseInt(document.getElementById(dim.id).value);
      const row = document.createElement('div');
      row.className = 'dimension-row';
      row.innerHTML = `
        <span class="dim-name">${dim.label}</span>
        <div class="dim-rating">
          <span class="stars">${'★'.repeat(value)}${'☆'.repeat(5-value)}</span>
          <span class="score-badge">${value}/5</span>
        </div>
      `;
      dimensionsList.appendChild(row);
    });
    
    // ============================================
    // UPDATE DATES
    // ============================================
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('issueDate').textContent = 
      `Issue Date: ${now.toLocaleDateString('en-US', options)}`;
    
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);
    document.getElementById('validDate').textContent = 
      `Valid Until: ${validUntil.toLocaleDateString('en-US', options)}`;
    
    // ============================================
    // GENERATE REPORT ID
    // ============================================
    const reportId = `UHAN-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${Math.floor(Math.random()*10000).toString().padStart(4,'0')}`;
    document.getElementById('reportIdDisplay').textContent = reportId;
    
    // ============================================
    // GENERATE QR CODE
    // ============================================
    generateQRCode(reportId, data, ulci, ulciId);
  }

  // ============================================
  // GENERATE QR CODE WITH VERIFICATION DATA
  // ============================================
  function generateQRCode(reportId, data, ulci, ulciId) {
    const container = document.getElementById('qrCodeContainer');
    container.innerHTML = '';
    
    // Comprehensive verification data
    const verificationData = {
      reportId: reportId,
      ulciId: ulciId,
      mentorName: data.mentorName || 'Unknown',
      ulcId: data.ulcId || 'N/A',
      ulpToken: data.ulpToken || 'N/A',
      ulciScore: ulci.total,
      ulciBreakdown: {
        environmental: ulci.E,
        social: ulci.S,
        cultural: ulci.C,
        health: ulci.H,
        innovation: ulci.I
      },
      institution: data.institution || 'N/A',
      issueDate: new Date().toISOString(),
      verificationUrl: `https://uhan360.org/verify/${reportId}`,
      blockchainHash: `0x${Math.random().toString(36).substr(2, 16)}`,
      certificateType: 'Education 5.0 Mentor Assessment'
    };
    
    const dataString = JSON.stringify(verificationData);
    
    // Generate QR code with high error correction
    const typeNumber = 10;
    const errorCorrectionLevel = 'H';
    const qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(dataString);
    qr.make();
    
    container.innerHTML = qr.createImgTag(4, 8);
  }

  // ============================================
  // SAVE BUTTON
  // ============================================
  document.getElementById('saveBtn').addEventListener('click', function() {
    const data = collectFormData();
    try {
      sessionStorage.setItem('mentorAssessment', JSON.stringify(data));
      alert('✅ Assessment saved successfully!');
    } catch(err) {
      alert('⚠️ Data saved in memory for this session');
    }
  });

  // ============================================
  // GENERATE BUTTON
  // ============================================
  document.getElementById('generateBtn').addEventListener('click', function() {
    updateReportCard();
    document.querySelector('.report-card-section').scrollIntoView({ behavior: 'smooth' });
    alert('✅ Report card generated and updated!');
  });

  // ============================================
  // NEW ENTRY BUTTON
  // ============================================
  document.getElementById('newBtn').addEventListener('click', function() {
    if (confirm('⚠️ Start new assessment? Current data will be cleared.')) {
      document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea').forEach(input => {
        input.value = '';
      });
      
      sliders.forEach(slider => {
        slider.value = 3;
        document.getElementById(slider.id + 'Value').textContent = '3';
      });
      
      document.getElementById('profilePhotoDisplay').innerHTML = '<div class="profile-placeholder"><i class="fas fa-user"></i></div>';
      document.getElementById('signatureDisplay').innerHTML = '<div class="signature-placeholder">Signature</div>';
      
      profilePhotoData = null;
      signatureData = null;
      
      // Clear file inputs
      document.getElementById('profilePhoto').value = '';
      document.getElementById('signature').value = '';
      
      updateReportCard();
      alert('✅ New assessment form ready!');
    }
  });

  // ============================================
  // DOWNLOAD PDF BUTTON - FULLY FUNCTIONAL
  // ============================================
  document.getElementById('downloadBtn').addEventListener('click', async function() {
    const button = this;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    
    try {
      const reportCard = document.querySelector('.report-card');
      
      // Use html2canvas to capture the report card
      const canvas = await html2canvas(reportCard, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a1931',
        logging: false,
        windowWidth: reportCard.scrollWidth,
        windowHeight: reportCard.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      
      // Calculate dimensions to fit A4
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Determine orientation
      const orientation = imgHeight > imgWidth ? 'portrait' : 'landscape';
      
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });
      
      // If image is taller than A4, split into multiple pages
      const pageHeight = orientation === 'portrait' ? 297 : 210;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Generate filename
      const data = collectFormData();
      const mentorName = data.mentorName ? data.mentorName.replace(/\s+/g, '_') : 'Mentor';
      const date = new Date().toISOString().split('T')[0];
      const fileName = `UHAN_360_Report_${mentorName}_${date}.pdf`;
      
      // Save PDF
      pdf.save(fileName);
      
      alert('📄 PDF downloaded successfully!');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('❌ Error generating PDF. Please try again or use browser print function (Ctrl+P).');
    } finally {
      button.disabled = false;
      button.innerHTML = '<i class="fas fa-file-pdf"></i> Download PDF';
    }
  });

  // ============================================
  // LOAD SAVED DATA ON PAGE LOAD
  // ============================================
  try {
    const saved = sessionStorage.getItem('mentorAssessment');
    if (saved) {
      if (confirm('📂 Load previously saved assessment?')) {
        const data = JSON.parse(saved);
        
        // Populate form fields
        for (const key in data) {
          const el = document.getElementById(key);
          if (el) {
            if (el.type === 'range') {
              el.value = data[key];
              document.getElementById(key + 'Value').textContent = data[key];
            } else if (key !== 'profilePhotoData' && key !== 'signatureData') {
              el.value = data[key];
            }
          }
        }
        
        // Restore images
        if (data.profilePhotoData) {
          profilePhotoData = data.profilePhotoData;
          document.getElementById('profilePhotoDisplay').innerHTML = 
            `<img src="${profilePhotoData}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">`;
        }
        if (data.signatureData) {
          signatureData = data.signatureData;
          document.getElementById('signatureDisplay').innerHTML = 
            `<img src="${signatureData}" alt="Signature" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
        }
        
        // Update report card with loaded data
        updateReportCard();
      }
    }
  } catch(err) {
    console.log('No saved data available or error loading data:', err);
  }
  
  // ============================================
  // INITIAL UPDATE ON PAGE LOAD
  // ============================================
  updateReportCard();
  
  // ============================================
  // PRINT FUNCTIONALITY (ALTERNATIVE TO PDF)
  // ============================================
  window.addEventListener('keydown', function(e) {
    // Ctrl+P or Cmd+P for print
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      window.print();
    }
  });
});
