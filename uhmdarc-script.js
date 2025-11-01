/**
 * UH-MDARC Dashboard - Enhanced JavaScript
 * Universal Holistic Multi-Dimensional Assessment Report Card
 * 360° Assessment System
 */

// ===================================
// Global Variables & Configuration
// ===================================

const CONFIG = {
  autoSaveInterval: 30000, // 30 seconds
  maxPhotoSize: 5 * 1024 * 1024, // 5MB
  chartColors: {
    primary: '#00D9FF',
    secondary: '#B24BF3',
    tertiary: '#FF006E',
    quaternary: '#FFD60A'
  },
  dimensions: ['LMI', 'ECI', 'CI', 'RAS']
};

let charts = {
  radar: null,
  trend: null
};

let autoSaveTimer = null;
let formData = {};

// ===================================
// Utility Functions
// ===================================

const $ = (id) => document.getElementById(id);
const $$ = (selector) => document.querySelectorAll(selector);

const escapeHTML = (str = '') => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const showNotification = (message, type = 'info') => {
  // Simple notification system
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #EF4444, #DC2626)'};
    color: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};

// ===================================
// Loading State Management
// ===================================

const hideLoader = () => {
  const loader = $('loadingOverlay');
  if (loader) {
    loader.classList.add('hidden');
  }
};

// ===================================
// Photo Upload Management
// ===================================

function initPhotoUpload() {
  const photoUpload = $('photoUpload');
  const photoInput = $('photoInput');
  const photoPreview = $('photoPreview');
  const removePhotoBtn = $('removePhoto');
  
  photoUpload.addEventListener('click', () => {
    photoInput.click();
  });
  
  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'error');
      return;
    }
    
    // Validate file size
    if (file.size > CONFIG.maxPhotoSize) {
      showNotification('Image size must be less than 5MB', 'error');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      photoPreview.src = e.target.result;
      photoPreview.classList.add('active');
      photoUpload.querySelector('.photo-overlay').style.display = 'none';
      removePhotoBtn.style.display = 'block';
      updateFormProgress();
    };
    
    reader.readAsDataURL(file);
  });
  
  removePhotoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    photoPreview.src = '';
    photoPreview.classList.remove('active');
    photoInput.value = '';
    photoUpload.querySelector('.photo-overlay').style.display = 'flex';
    removePhotoBtn.style.display = 'none';
    updateFormProgress();
  });
}

// ===================================
// QR Code Generation
// ===================================

function generateQRCode(text, elementId) {
  const element = $(elementId);
  if (!element) return;
  
  element.innerHTML = '';
  
  if (text && window.QRCode) {
    const canvas = document.createElement('canvas');
    element.appendChild(canvas);
    
    QRCode.toCanvas(canvas, text, {
      width: 100,
      margin: 1,
      color: {
        dark: '#0A0E27',
        light: '#FFFFFF'
      }
    }, function(error) {
      if (error) {
        console.error('QR Code Error:', error);
        element.innerHTML = '<span class="qr-placeholder">QR Error</span>';
      }
    });
  } else {
    element.innerHTML = '<span class="qr-placeholder">Enter ULP Token</span>';
  }
}

// ===================================
// ULCI Integration
// ===================================

function updateULCIDisplay() {
  const ulciName = $('ulciName').value;
  const ulciScore = $('ulciScore').value;
  
  if (ulciName || ulciScore) {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    $('ulciIdDisplay').textContent = `ULCI-${year}-${random}`;
  }
  
  if (ulciScore) {
    $('ulciScoreDisplay').textContent = ulciScore;
    
    // Update score bar
    const scoreFill = $('ulciScoreFill');
    if (scoreFill) {
      scoreFill.style.width = `${ulciScore}%`;
    }
  }
}

// ===================================
// Metaphormic Badges Management
// ===================================

function initMetaphormicBadges() {
  const badgesContainer = $('badgesContainer');
  const addButton = $('addMetaphormicBadge');
  
  // Sample badges with icons
  const sampleBadges = [
    { name: 'Universal Harmony', icon: 'fas fa-globe' },
    { name: 'Cognitive Mastery', icon: 'fas fa-brain' },
    { name: 'Emotional Resonance', icon: 'fas fa-heart' }
  ];
  
  // Only add sample badges if container is empty
  if (badgesContainer.children.length === 0) {
    sampleBadges.forEach(badge => {
      addMetaphormicBadge(badge.name, badge.icon);
    });
  }
  
  addButton.addEventListener('click', () => {
    const name = prompt('Enter badge name:');
    if (name && name.trim()) {
      addMetaphormicBadge(name.trim(), 'fas fa-award');
      showNotification('Badge added successfully', 'success');
      updateFormProgress();
    }
  });
}

function addMetaphormicBadge(name, icon) {
  const badgesContainer = $('badgesContainer');
  const badge = document.createElement('div');
  badge.className = 'badge-item';
  badge.innerHTML = `
    <i class="${icon}"></i> 
    ${escapeHTML(name)} 
    <button class="remove" title="Remove badge">✕</button>
  `;
  
  badge.querySelector('.remove').addEventListener('click', (e) => {
    e.stopPropagation();
    badge.style.animation = 'badgeDisappear 0.3s ease';
    setTimeout(() => {
      badge.remove();
      updateFormProgress();
    }, 300);
  });
  
  badgesContainer.appendChild(badge);
}

// ===================================
// Dynamic Table Row Creators
// ===================================

function createCompetencyRow(data = {}) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input class="in" data-field="dimension" value="${escapeHTML(data.dimension || '')}" placeholder="e.g., Cognitive" /></td>
    <td><input class="in" data-field="competency" value="${escapeHTML(data.competency || '')}" placeholder="e.g., Critical Thinking" /></td>
    <td><input class="in" data-field="indicators" value="${escapeHTML(data.indicators || '')}" placeholder="Observable behaviors" /></td>
    <td><input class="in" type="number" min="1" max="4" data-field="score" value="${escapeHTML(data.score || '')}" placeholder="1-4" /></td>
    <td><input class="in" data-field="evidence" value="${escapeHTML(data.evidence || '')}" placeholder="Supporting evidence" /></td>
    <td><input class="in" data-field="next" value="${escapeHTML(data.next || '')}" placeholder="Next steps" /></td>
    <td><button class="remove" title="Remove row">✕</button></td>
  `;
  
  tr.querySelector('.remove').addEventListener('click', () => {
    tr.remove();
    updateFormProgress();
  });
  
  // Add change listeners
  tr.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', debounce(updateFormProgress, 500));
  });
  
  return tr;
}

function createBadgeRow(data = {}) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input class="in" data-field="badgeName" value="${escapeHTML(data.badgeName || '')}" placeholder="Badge name" /></td>
    <td><input class="in" data-field="badgeHash" value="${escapeHTML(data.badgeHash || '')}" placeholder="Hash/ID" /></td>
    <td><input type="date" class="in" data-field="badgeDate" value="${escapeHTML(data.badgeDate || '')}" /></td>
    <td><input class="in" data-field="badgeVerifier" value="${escapeHTML(data.badgeVerifier || '')}" placeholder="Verifier" /></td>
    <td><button class="remove" title="Remove row">✕</button></td>
  `;
  
  tr.querySelector('.remove').addEventListener('click', () => {
    tr.remove();
    updateFormProgress();
  });
  
  tr.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', debounce(updateFormProgress, 500));
  });
  
  return tr;
}

function createAuditRow(data = {}) {
  const tr = document.createElement('tr');
  const timestamp = data.ts || new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  tr.innerHTML = `
    <td><input class="in" data-field="ts" value="${escapeHTML(timestamp)}" placeholder="Timestamp" /></td>
    <td><input class="in" data-field="event" value="${escapeHTML(data.event || '')}" placeholder="Event type" /></td>
    <td><input class="in" data-field="notes" value="${escapeHTML(data.notes || '')}" placeholder="Details" /></td>
    <td><button class="remove" title="Remove row">✕</button></td>
  `;
  
  tr.querySelector('.remove').addEventListener('click', () => {
    tr.remove();
    updateFormProgress();
  });
  
  tr.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', debounce(updateFormProgress, 500));
  });
  
  return tr;
}

// ===================================
// Charts Creation
// ===================================

function createCharts(radarData, trendData) {
  // Destroy existing charts
  if (charts.radar) charts.radar.destroy();
  if (charts.trend) charts.trend.destroy();
  
  // Radar Chart
  const radarCtx = $('pvRadar');
  if (radarCtx) {
    charts.radar = new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels: radarData.labels,
        datasets: [{
          label: 'Multi-Dimensional Profile',
          data: radarData.values,
          fill: true,
          backgroundColor: 'rgba(0, 217, 255, 0.15)',
          borderColor: CONFIG.chartColors.primary,
          pointBackgroundColor: CONFIG.chartColors.primary,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: CONFIG.chartColors.primary,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            suggestedMin: 0,
            suggestedMax: 100,
            angleLines: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            pointLabels: {
              color: '#E8EAF6',
              font: {
                size: 11,
                weight: '600'
              }
            },
            ticks: {
              color: '#94A3B8',
              backdropColor: 'transparent',
              stepSize: 25
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#00D9FF',
            bodyColor: '#E8EAF6',
            borderColor: 'rgba(0, 217, 255, 0.3)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8
          }
        }
      }
    });
  }
  
  // Trend Chart
  const trendCtx = $('pvTrend');
  if (trendCtx) {
    charts.trend = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: trendData.labels,
        datasets: [
          {
            label: 'LMI Trend',
            data: trendData.lmi,
            borderColor: CONFIG.chartColors.primary,
            backgroundColor: 'rgba(0, 217, 255, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5
          },
          {
            label: 'ECI Trend',
            data: trendData.eci,
            borderColor: CONFIG.chartColors.secondary,
            backgroundColor: 'rgba(178, 75, 243, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#E8EAF6',
              padding: 10,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#00D9FF',
            bodyColor: '#E8EAF6',
            borderColor: 'rgba(0, 217, 255, 0.3)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#94A3B8',
              font: {
                size: 10
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              drawBorder: false
            }
          },
          y: {
            beginAtZero: true,
            suggestedMax: 100,
            ticks: {
              color: '#94A3B8',
              font: {
                size: 10
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              drawBorder: false
            }
          }
        }
      }
    });
  }
}

// ===================================
// Preview Rendering
// ===================================

function renderPreview() {
  // Basic Information
  $('pv-name').textContent = $('learnerName').value || '—';
  $('pv-ulp').textContent = $('ulpToken').value || '—';
  $('pv-hub').textContent = $('hub').value || '—';
  $('pv-id').textContent = $('learnerId').value || '—';
  $('pv-mentor').textContent = $('mentor').value || '—';
  $('pv-date').textContent = $('reportDate').value || new Date().toISOString().slice(0, 10);
  
  // Photo Preview
  const photoPreview = $('photoPreview');
  const pvPhoto = $('pv-photo');
  if (photoPreview.classList.contains('active')) {
    pvPhoto.innerHTML = `<img src="${photoPreview.src}" alt="Learner Photo">`;
  } else {
    pvPhoto.innerHTML = '<i class="fas fa-user"></i>';
  }
  
  // ULCI Display
  $('pv-ulci-id').textContent = $('ulciIdDisplay').textContent || '—';
  $('pv-ulci-score').textContent = $('ulciScoreDisplay').textContent || '—';
  $('pv-ulci-name').textContent = $('ulciName').value || '—';
  
  // QR Code Preview
  const ulpToken = $('ulpToken').value;
  if (ulpToken) {
    generateQRCode(ulpToken, 'pv-qr');
  } else {
    $('pv-qr').innerHTML = '<span class="qr-placeholder">QR Code</span>';
  }
  
  // Dimension Scores
  const lmi = Number($('lmi').value || 0);
  const eci = Number($('eci').value || 0);
  const ci = Number($('ci').value || 0);
  const ras = Number($('ras').value || 0);
  
  $('pv-lmi').textContent = lmi || '—';
  $('pv-eci').textContent = eci || '—';
  $('pv-ci').textContent = ci || '—';
  $('pv-ras').textContent = ras || '—';
  
  // Prepare Chart Data
  const competencyRows = Array.from($$('#competencyTable tbody tr'));
  const dimensionMap = {};
  
  competencyRows.forEach(tr => {
    const dim = tr.querySelector('[data-field="dimension"]').value.trim() || 'Other';
    const score = Number(tr.querySelector('[data-field="score"]').value || 0);
    
    if (!dimensionMap[dim]) dimensionMap[dim] = [];
    if (score > 0) dimensionMap[dim].push(score * 25); // Convert 1-4 to 25-100
  });
  
  const radarLabels = Object.keys(dimensionMap).length ? Object.keys(dimensionMap) : ['Cognitive', 'Character', 'Practical', 'Collaboration'];
  const radarValues = radarLabels.map(label => {
    const scores = dimensionMap[label] || [];
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 50;
  });
  
  // Trend Data (simulated growth)
  const trendLabels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const baseLMI = Math.max(10, Math.min(100, lmi || 50));
  const baseECI = Math.max(10, Math.min(100, eci || 50));
  
  const trendLMI = trendLabels.map((_, i) => Math.round(baseLMI - 10 + (i * 4)));
  const trendECI = trendLabels.map((_, i) => Math.round(baseECI - 8 + (i * 3)));
  
  // Create Charts
  createCharts(
    { labels: radarLabels, values: radarValues },
    { labels: trendLabels, lmi: trendLMI, eci: trendECI }
  );
  
  // Competencies Preview
  const pvComp = $('pv-competencies');
  pvComp.innerHTML = '';
  
  if (competencyRows.length === 0) {
    pvComp.textContent = '—';
  } else {
    competencyRows.forEach(tr => {
      const comp = tr.querySelector('[data-field="competency"]').value || tr.querySelector('[data-field="dimension"]').value || 'Competency';
      const ind = tr.querySelector('[data-field="indicators"]').value || '';
      const score = tr.querySelector('[data-field="score"]').value || '';
      const next = tr.querySelector('[data-field="next"]').value || '';
      
      const item = document.createElement('div');
      item.className = 'competency-item';
      item.innerHTML = `
        <strong>${escapeHTML(comp)}</strong> — Score: ${escapeHTML(score)}/4
        <div>${escapeHTML(ind)}</div>
        <div style="font-size: 0.75rem; color: #64748B;">Next: ${escapeHTML(next)}</div>
      `;
      pvComp.appendChild(item);
    });
  }
  
  // Narrative
  $('pv-learnerReflection').textContent = $('learnerReflection').value || '—';
  $('pv-mentorReflection').textContent = $('mentorReflection').value || '—';
  $('pv-peerHighlights').textContent = $('peerHighlights').value || '—';
  
  // Adaptive Path
  $('pv-short').textContent = $('shortTerm').value || '—';
  $('pv-medium').textContent = $('mediumTerm').value || '—';
  $('pv-long').textContent = $('longTerm').value || '—';
  
  // Metaphormic Badges
  const mbadges = Array.from($$('#badgesContainer .badge-item'));
  const pvMBadges = $('pv-metaphormic-badges');
  pvMBadges.innerHTML = '';
  
  if (mbadges.length === 0) {
    pvMBadges.textContent = '—';
  } else {
    mbadges.forEach(badge => {
      const text = badge.textContent.replace('✕', '').trim();
      const icon = badge.querySelector('i').className;
      const item = document.createElement('div');
      item.className = 'badge-item';
      item.innerHTML = `<i class="${icon}"></i> ${escapeHTML(text)}`;
      pvMBadges.appendChild(item);
    });
  }
  
  // Digital Badges
  const badgeRows = Array.from($$('#badgesTable tbody tr'));
  const pvBadges = $('pv-badges');
  pvBadges.innerHTML = '';
  
  if (badgeRows.length === 0) {
    pvBadges.textContent = '—';
  } else {
    badgeRows.forEach(tr => {
      const name = tr.querySelector('[data-field="badgeName"]').value || '';
      const hash = tr.querySelector('[data-field="badgeHash"]').value || '';
      const date = tr.querySelector('[data-field="badgeDate"]').value || '';
      const verifier = tr.querySelector('[data-field="badgeVerifier"]').value || '';
      
      const item = document.createElement('div');
      item.innerHTML = `
        <strong>${escapeHTML(name)}</strong>
        <div>${escapeHTML(hash)} • ${escapeHTML(date)} • ${escapeHTML(verifier)}</div>
      `;
      pvBadges.appendChild(item);
    });
  }
  
  // Audit Log
  const auditRows = Array.from($$('#auditTable tbody tr'));
  const pvAudit = $('pv-audit');
  pvAudit.innerHTML = '';
  
  if (auditRows.length === 0) {
    pvAudit.textContent = '—';
  } else {
    auditRows.forEach(tr => {
      const ts = tr.querySelector('[data-field="ts"]').value || '';
      const event = tr.querySelector('[data-field="event"]').value || '';
      const notes = tr.querySelector('[data-field="notes"]').value || '';
      
      const item = document.createElement('div');
      item.innerHTML = `
        <strong>${escapeHTML(event)}</strong> <span style="color: #64748B; font-size: 0.75rem;">(${escapeHTML(ts)})</span>
        <div>${escapeHTML(notes)}</div>
      `;
      pvAudit.appendChild(item);
    });
  }
  
  // Signature & Timestamp
  $('pv-sign').textContent = $('signature').value || '—';
  $('pv-ts').textContent = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ===================================
// Form Progress Tracking
// ===================================

function updateFormProgress() {
  const fields = [
    $('learnerName'),
    $('ulpToken'),
    $('hub'),
    $('reportDate'),
    $('mentor'),
    $('lmi'),
    $('eci'),
    $('ci'),
    $('ras'),
    $('learnerReflection'),
    $('mentorReflection')
  ];
  
  let filledCount = 0;
  fields.forEach(field => {
    if (field && field.value.trim()) filledCount++;
  });
  
  // Add competency rows
  const compRows = $$('#competencyTable tbody tr').length;
  if (compRows > 0) filledCount += 2;
  
  // Add photo
  if ($('photoPreview').classList.contains('active')) filledCount++;
  
  const total = fields.length + 3; // fields + photo + competencies
  const percentage = Math.round((filledCount / total) * 100);
  
  $('completionPercentage').textContent = `${percentage}%`;
  $('progressFill').style.width = `${percentage}%`;
  
  // Auto-render preview
  renderPreview();
}

// ===================================
// Character Counter
// ===================================

function initCharacterCounters() {
  const textareas = [
    { id: 'learnerReflection', counter: 'learnerReflectionCount', max: 1000 },
    { id: 'mentorReflection', counter: 'mentorReflectionCount', max: 1000 },
    { id: 'peerHighlights', counter: 'peerHighlightsCount', max: 500 }
  ];
  
  textareas.forEach(({ id, counter, max }) => {
    const textarea = $(id);
    const counterEl = $(counter);
    
    if (textarea && counterEl) {
      textarea.addEventListener('input', () => {
        const length = textarea.value.length;
        counterEl.textContent = length;
        
        if (length > max) {
          counterEl.style.color = '#EF4444';
        } else {
          counterEl.style.color = '#64748B';
        }
      });
    }
  });
}

// ===================================
// PDF Export
// ===================================

async function downloadPDF() {
  try {
    showNotification('Generating PDF...', 'info');
    
    // Ensure preview is up to date
    renderPreview();
    
    const reportElement = $('reportPreview');
    
    // Use html2canvas with optimized settings
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#1A1F3A',
      windowWidth: reportElement.scrollWidth,
      windowHeight: reportElement.scrollHeight
    });
    
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    
    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Generate filename
    const learnerName = $('learnerName').value || 'Learner';
    const date = new Date().toISOString().slice(0, 10);
    const filename = `UH-MDARC_${learnerName.replace(/\s+/g, '_')}_${date}.pdf`;
    
    pdf.save(filename);
    showNotification('PDF downloaded successfully!', 'success');
  } catch (error) {
    console.error('PDF Error:', error);
    showNotification('Failed to generate PDF', 'error');
  }
}

// ===================================
// Share Modal
// ===================================

function initShareModal() {
  const shareBtn = $('btnShare');
  const shareModal = $('shareModal');
  const closeBtn = $('closeShareModal');
  
  shareBtn.addEventListener('click', () => {
    shareModal.classList.add('active');
  });
  
  closeBtn.addEventListener('click', () => {
    shareModal.classList.remove('active');
  });
  
  shareModal.addEventListener('click', (e) => {
    if (e.target === shareModal) {
      shareModal.classList.remove('active');
    }
  });
  
  // Share options
  const shareOptions = $$('.share-btn');
  shareOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      const shareType = btn.dataset.share;
      handleShare(shareType);
      shareModal.classList.remove('active');
    });
  });
}

function handleShare(type) {
  const learnerName = $('learnerName').value || 'Learner';
  const ulpToken = $('ulpToken').value || '';
  
  switch (type) {
    case 'link':
      const link = window.location.href;
      navigator.clipboard.writeText(link).then(() => {
        showNotification('Link copied to clipboard!', 'success');
      }).catch(() => {
        showNotification('Failed to copy link', 'error');
      });
      break;
      
    case 'email':
      const subject = encodeURIComponent(`UH-MDARC Report - ${learnerName}`);
      const body = encodeURIComponent(`View the UH-MDARC assessment report for ${learnerName}\n\nULP Token: ${ulpToken}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      break;
      
    case 'qr':
      if (ulpToken) {
        // Show QR code in larger view
        alert('QR Code for ULP Token: ' + ulpToken + '\n\nScan the QR code in the preview panel to verify.');
      } else {
        showNotification('Please enter ULP Token first', 'error');
      }
      break;
  }
}

// ===================================
// Local Storage - Auto Save
// ===================================

function saveToLocalStorage() {
  const formData = {
    learnerName: $('learnerName').value,
    ulpToken: $('ulpToken').value,
    hub: $('hub').value,
    learnerId: $('learnerId').value,
    reportDate: $('reportDate').value,
    reportPeriod: $('reportPeriod').value,
    mentor: $('mentor').value,
    signature: $('signature').value,
    ulciName: $('ulciName').value,
    ulciScore: $('ulciScore').value,
    lmi: $('lmi').value,
    eci: $('eci').value,
    ci: $('ci').value,
    ras: $('ras').value,
    learnerReflection: $('learnerReflection').value,
    mentorReflection: $('mentorReflection').value,
    peerHighlights: $('peerHighlights').value,
    shortTerm: $('shortTerm').value,
    mediumTerm: $('mediumTerm').value,
    longTerm: $('longTerm').value,
    photo: $('photoPreview').src || '',
    timestamp: new Date().toISOString()
  };
  
  // Save competencies
  const competencies = [];
  $$('#competencyTable tbody tr').forEach(tr => {
    competencies.push({
      dimension: tr.querySelector('[data-field="dimension"]').value,
      competency: tr.querySelector('[data-field="competency"]').value,
      indicators: tr.querySelector('[data-field="indicators"]').value,
      score: tr.querySelector('[data-field="score"]').value,
      evidence: tr.querySelector('[data-field="evidence"]').value,
      next: tr.querySelector('[data-field="next"]').value
    });
  });
  formData.competencies = competencies;
  
  // Save badges
  const badges = [];
  $$('#badgesTable tbody tr').forEach(tr => {
    badges.push({
      badgeName: tr.querySelector('[data-field="badgeName"]').value,
      badgeHash: tr.querySelector('[data-field="badgeHash"]').value,
      badgeDate: tr.querySelector('[data-field="badgeDate"]').value,
      badgeVerifier: tr.querySelector('[data-field="badgeVerifier"]').value
    });
  });
  formData.badges = badges;
  
  // Save audit logs
  const audits = [];
  $$('#auditTable tbody tr').forEach(tr => {
    audits.push({
      ts: tr.querySelector('[data-field="ts"]').value,
      event: tr.querySelector('[data-field="event"]').value,
      notes: tr.querySelector('[data-field="notes"]').value
    });
  });
  formData.audits = audits;
  
  // Save metaphormic badges
  const mBadges = [];
  $$('#badgesContainer .badge-item').forEach(badge => {
    const text = badge.textContent.replace('✕', '').trim();
    const icon = badge.querySelector('i').className;
    mBadges.push({ name: text, icon: icon });
  });
  formData.metaphormicBadges = mBadges;
  
  try {
    localStorage.setItem('uhmdarc_formData', JSON.stringify(formData));
    $('autoSaveStatus').textContent = 'Auto-saved';
    $('autoSaveStatus').style.color = '#10B981';
  } catch (error) {
    console.error('Save Error:', error);
    $('autoSaveStatus').textContent = 'Save failed';
    $('autoSaveStatus').style.color = '#EF4444';
  }
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('uhmdarc_formData');
    if (!saved) return false;
    
    const formData = JSON.parse(saved);
    
    // Restore basic fields
    if (formData.learnerName) $('learnerName').value = formData.learnerName;
    if (formData.ulpToken) $('ulpToken').value = formData.ulpToken;
    if (formData.hub) $('hub').value = formData.hub;
    if (formData.learnerId) $('learnerId').value = formData.learnerId;
    if (formData.reportDate) $('reportDate').value = formData.reportDate;
    if (formData.reportPeriod) $('reportPeriod').value = formData.reportPeriod;
    if (formData.mentor) $('mentor').value = formData.mentor;
    if (formData.signature) $('signature').value = formData.signature;
    if (formData.ulciName) $('ulciName').value = formData.ulciName;
    if (formData.ulciScore) $('ulciScore').value = formData.ulciScore;
    if (formData.lmi) $('lmi').value = formData.lmi;
    if (formData.eci) $('eci').value = formData.eci;
    if (formData.ci) $('ci').value = formData.ci;
    if (formData.ras) $('ras').value = formData.ras;
    if (formData.learnerReflection) $('learnerReflection').value = formData.learnerReflection;
    if (formData.mentorReflection) $('mentorReflection').value = formData.mentorReflection;
    if (formData.peerHighlights) $('peerHighlights').value = formData.peerHighlights;
    if (formData.shortTerm) $('shortTerm').value = formData.shortTerm;
    if (formData.mediumTerm) $('mediumTerm').value = formData.mediumTerm;
    if (formData.longTerm) $('longTerm').value = formData.longTerm;
    
    // Restore photo
    if (formData.photo && formData.photo !== '') {
      const photoPreview = $('photoPreview');
      photoPreview.src = formData.photo;
      photoPreview.classList.add('active');
      $('photoUpload').querySelector('.photo-overlay').style.display = 'none';
      $('removePhoto').style.display = 'block';
    }
    
    // Restore competencies
    if (formData.competencies && formData.competencies.length > 0) {
      const tbody = document.querySelector('#competencyTable tbody');
      tbody.innerHTML = '';
      formData.competencies.forEach(comp => {
        tbody.appendChild(createCompetencyRow(comp));
      });
    }
    
    // Restore badges
    if (formData.badges && formData.badges.length > 0) {
      const tbody = document.querySelector('#badgesTable tbody');
      tbody.innerHTML = '';
      formData.badges.forEach(badge => {
        tbody.appendChild(createBadgeRow(badge));
      });
    }
    
    // Restore audits
    if (formData.audits && formData.audits.length > 0) {
      const tbody = document.querySelector('#auditTable tbody');
      tbody.innerHTML = '';
      formData.audits.forEach(audit => {
        tbody.appendChild(createAuditRow(audit));
      });
    }
    
    // Restore metaphormic badges
    if (formData.metaphormicBadges && formData.metaphormicBadges.length > 0) {
      const container = $('badgesContainer');
      container.innerHTML = '';
      formData.metaphormicBadges.forEach(badge => {
        addMetaphormicBadge(badge.name, badge.icon);
      });
    }
    
    showNotification('Previous session restored', 'success');
    return true;
  } catch (error) {
    console.error('Load Error:', error);
    return false;
  }
}

// ===================================
// Clear Form
// ===================================

function clearForm() {
  if (!confirm('Are you sure you want to clear all form data? This action cannot be undone.')) {
    return;
  }
  
  // Clear all input fields
  $$('input[type="text"], input[type="date"], input[type="number"], textarea').forEach(input => {
    input.value = '';
  });
  
  // Clear photo
  const photoPreview = $('photoPreview');
  photoPreview.src = '';
  photoPreview.classList.remove('active');
  $('photoInput').value = '';
  $('photoUpload').querySelector('.photo-overlay').style.display = 'flex';
  $('removePhoto').style.display = 'none';
  
  // Clear all tables
  document.querySelector('#competencyTable tbody').innerHTML = '';
  document.querySelector('#badgesTable tbody').innerHTML = '';
  document.querySelector('#auditTable tbody').innerHTML = '';
  
  // Clear metaphormic badges
  $('badgesContainer').innerHTML = '';
  
  // Reset QR code
  $('qrCode').innerHTML = '<span class="qr-placeholder">Enter ULP Token</span>';
  
  // Reset ULCI
  $('ulciIdDisplay').textContent = 'ULCI-2025-001';
  $('ulciScoreDisplay').textContent = '0';
  $('ulciScoreFill').style.width = '0%';
  
  // Add default sample rows
  const compTbody = document.querySelector('#competencyTable tbody');
  compTbody.appendChild(createCompetencyRow({
    dimension: 'Cognitive',
    competency: 'Evidence Synthesis',
    indicators: 'Cross-checks 3+ sources',
    score: '3',
    evidence: '',
    next: 'Practice meta-analysis'
  }));
  compTbody.appendChild(createCompetencyRow({
    dimension: 'Character',
    competency: 'Adaptive Resilience',
    indicators: 'Seeks feedback; reframe',
    score: '2',
    evidence: '',
    next: 'Reverse mentorship'
  }));
  
  // Add sample metaphormic badges
  const sampleBadges = [
    { name: 'Universal Harmony', icon: 'fas fa-globe' },
    { name: 'Cognitive Mastery', icon: 'fas fa-brain' },
    { name: 'Emotional Resonance', icon: 'fas fa-heart' }
  ];
  
  sampleBadges.forEach(badge => {
    addMetaphormicBadge(badge.name, badge.icon);
  });
  
  // Clear local storage
  localStorage.removeItem('uhmdarc_formData');
  
  // Update displays
  updateULCIDisplay();
  updateFormProgress();
  renderPreview();
  
  showNotification('Form cleared successfully', 'success');
}

// ===================================
// Event Listeners Setup
// ===================================

function setupEventListeners() {
  // Set current date as default
  if ($('reportDate')) {
    $('reportDate').valueAsDate = new Date();
  }
  
  // ULCI listeners
  if ($('ulciName')) {
    $('ulciName').addEventListener('input', debounce(() => {
      updateULCIDisplay();
      updateFormProgress();
    }, 500));
  }
  
  if ($('ulciScore')) {
    $('ulciScore').addEventListener('input', debounce(() => {
      updateULCIDisplay();
      updateFormProgress();
    }, 500));
  }
  
  // QR Code generation
  if ($('ulpToken')) {
    $('ulpToken').addEventListener('input', debounce(() => {
      generateQRCode($('ulpToken').value, 'qrCode');
      updateFormProgress();
    }, 500));
  }
  
  // Add row buttons
  if ($('addCompetency')) {
    $('addCompetency').addEventListener('click', () => {
      const tbody = document.querySelector('#competencyTable tbody');
      tbody.appendChild(createCompetencyRow());
      updateFormProgress();
    });
  }
  
  if ($('addBadge')) {
    $('addBadge').addEventListener('click', () => {
      const tbody = document.querySelector('#badgesTable tbody');
      tbody.appendChild(createBadgeRow());
      updateFormProgress();
    });
  }
  
  if ($('addAudit')) {
    $('addAudit').addEventListener('click', () => {
      const tbody = document.querySelector('#auditTable tbody');
      tbody.appendChild(createAuditRow({
        ts: new Date().toISOString().slice(0, 19).replace('T', ' '),
        event: 'AI scaffold',
        notes: 'Auto suggestion executed'
      }));
      updateFormProgress();
    });
  }
  
  // Action buttons
  if ($('btnPreview')) {
    $('btnPreview').addEventListener('click', renderPreview);
  }
  
  if ($('refreshPreview')) {
    $('refreshPreview').addEventListener('click', () => {
      renderPreview();
      showNotification('Preview refreshed', 'success');
    });
  }
  
  if ($('btnDownload')) {
    $('btnDownload').addEventListener('click', downloadPDF);
  }
  
  if ($('btnSave')) {
    $('btnSave').addEventListener('click', () => {
      saveToLocalStorage();
      showNotification('Draft saved successfully', 'success');
    });
  }
  
  if ($('btnClear')) {
    $('btnClear').addEventListener('click', clearForm);
  }
  
  // Add input listeners for all form fields
  const formInputs = $$('input, textarea, select');
  formInputs.forEach(input => {
    input.addEventListener('input', debounce(() => {
      updateFormProgress();
      
      // Reset auto-save timer
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(saveToLocalStorage, CONFIG.autoSaveInterval);
    }, 500));
  });
}

// ===================================
// Initialize Sample Data
// ===================================

function initializeSampleData() {
  const compTbody = document.querySelector('#competencyTable tbody');
  
  // Only add sample data if table is empty
  if (compTbody.children.length === 0) {
    compTbody.appendChild(createCompetencyRow({
      dimension: 'Cognitive',
      competency: 'Evidence Synthesis',
      indicators: 'Cross-checks 3+ sources',
      score: '3',
      evidence: 'Research project demonstrated thorough source validation',
      next: 'Practice meta-analysis'
    }));
    
    compTbody.appendChild(createCompetencyRow({
      dimension: 'Character',
      competency: 'Adaptive Resilience',
      indicators: 'Seeks feedback; reframe',
      score: '2',
      evidence: 'Actively requested peer feedback on presentation',
      next: 'Reverse mentorship program'
    }));
  }
}

// ===================================
// Keyboard Shortcuts
// ===================================

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S: Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveToLocalStorage();
      showNotification('Draft saved', 'success');
    }
    
    // Ctrl/Cmd + P: Preview
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      renderPreview();
      showNotification('Preview updated', 'success');
    }
    
    // Ctrl/Cmd + D: Download PDF
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      downloadPDF();
    }
  });
}

// ===================================
// Animation on Scroll
// ===================================

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  
  // Observe all sections
  $$('.rc-section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.6s ease';
    observer.observe(section);
  });
}

// ===================================
// Performance Optimization
// ===================================

// Lazy load images
function lazyLoadImages() {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  });
  
  $$('img[data-src]').forEach(img => imageObserver.observe(img));
}

// ===================================
// Main Initialization
// ===================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 UH-MDARC Dashboard Initializing...');
  
  // Check if required libraries are loaded
  if (typeof Chart === 'undefined') {
    console.error('Chart.js not loaded');
    return;
  }
  
  if (typeof html2canvas === 'undefined') {
    console.error('html2canvas not loaded');
    return;
  }
  
  if (typeof window.jspdf === 'undefined') {
    console.error('jsPDF not loaded');
    return;
  }
  
  if (typeof QRCode === 'undefined') {
    console.error('QRCode.js not loaded');
    return;
  }
  
  // Initialize components
  try {
    initPhotoUpload();
    initMetaphormicBadges();
    initCharacterCounters();
    initShareModal();
    setupEventListeners();
    initKeyboardShortcuts();
    
    // Try to load saved data
    const loaded = loadFromLocalStorage();
    
    // If no saved data, initialize sample data
    if (!loaded) {
      initializeSampleData();
    }
    
    // Initial ULCI display
    updateULCIDisplay();
    
    // Initial progress update
    updateFormProgress();
    
    // Initial preview render
    renderPreview();
    
    // Initialize scroll animations
    setTimeout(initScrollAnimations, 500);
    
    // Hide loader
    setTimeout(hideLoader, 800);
    
    // Start auto-save timer
    autoSaveTimer = setTimeout(saveToLocalStorage, CONFIG.autoSaveInterval);
    
    console.log('✅ UH-MDARC Dashboard Ready!');
    
  } catch (error) {
    console.error('Initialization Error:', error);
    showNotification('Failed to initialize dashboard', 'error');
  }
});

// ===================================
// Window Event Handlers
// ===================================

// Before unload - save data
window.addEventListener('beforeunload', (e) => {
  saveToLocalStorage();
});

// Handle visibility change - save when tab becomes hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    saveToLocalStorage();
  }
});

// Handle resize - update charts
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (charts.radar) charts.radar.resize();
    if (charts.trend) charts.trend.resize();
  }, 250);
});

// ===================================
// Service Worker Registration (Optional)
// ===================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment to enable offline support
    // navigator.serviceWorker.register('/sw.js')
    //   .then(reg => console.log('Service Worker registered'))
    //   .catch(err => console.log('Service Worker registration failed'));
  });
}

// ===================================
// Export Module (if needed)
// ===================================

window.UHMDARC = {
  renderPreview,
  downloadPDF,
  saveToLocalStorage,
  loadFromLocalStorage,
  clearForm,
  updateFormProgress,
  version: '2.0.0'
};

console.log('📊 UH-MDARC Dashboard Module Loaded - Version 2.0.0');