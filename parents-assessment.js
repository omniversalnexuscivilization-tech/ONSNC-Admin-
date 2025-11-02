/**
 * parents-assessment.js
 * - Modular Firebase (v9+/v11) usage
 * - Replace firebaseConfig with your project's values
 * - Features: FEI calc, preview render, save/load to Firestore, download PDF
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore, doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ---------- CONFIG: replace with your Firebase project values ----------
const firebaseConfig = {
  apiKey: "REPLACE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // storageBucket, messagingSenderId, appId optional for Firestore-only demo
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------- DOM helpers ----------
const $ = id => document.getElementById(id);
const statusEl = $('status');

// ---------- FEI Calculation ----------
function calculateFEI() {
  const scores = [
    Number($('emotionalSupport').value || 0),
    Number($('communication').value || 0),
    Number($('environment').value || 0),
    Number($('ethics').value || 0)
  ];
  const sum = scores.reduce((a,b)=>a+b,0);
  // max sum = 16 (4 dims × 4 max). FEI normalized to 100
  const fei = sum ? (sum / 16) * 100 : 0;
  const feiRounded = Math.round(fei * 10) / 10;
  $('feiScore').textContent = feiRounded;
  return feiRounded;
}

// ---------- Render Preview ----------
function renderPreview(docData = null) {
  // Basic fields
  $('pv-parent').textContent = $('parentName').value || '—';
  $('pv-ulp').textContent = $('ulpID').value || '—';
  $('pv-learners').textContent = $('linkedLearners').value || '—';
  $('pv-hub').textContent = $('communityHub').value || '—';
  $('pv-date').textContent = new Date().toLocaleDateString();

  // scores
  $('pv-emotional').textContent = $('emotionalSupport').value || '—';
  $('pv-communication').textContent = $('communication').value || '—';
  $('pv-environment').textContent = $('environment').value || '—';
  $('pv-ethics').textContent = $('ethics').value || '—';
  $('pv-fei').textContent = $('feiScore').textContent || '—';

  // reflections
  $('pv-parentRef').textContent = $('parentReflection').value || '—';
  $('pv-mentorRef').textContent = $('mentorFeedback').value || '—';
  $('pv-learnerRef').textContent = $('learnerFeedback').value || '—';

  // saved info
  $('pv-savedBy').textContent = (docData && docData.savedBy) ? docData.savedBy : '—';
  $('pv-ts').textContent = docData && docData.timestamp ? new Date(docData.timestamp).toLocaleString() : new Date().toLocaleString();
}

// ---------- Save to Firestore ----------
async function saveReport() {
  const ulp = $('ulpID').value?.trim();
  if(!ulp) { statusEl.textContent = 'Enter Family / ULP ID before saving.'; return; }

  const docRef = doc(db, 'parent_assessments', ulp);
  const payload = {
    parentName: $('parentName').value || '',
    ulpID: ulp,
    linkedLearners: $('linkedLearners').value || '',
    communityHub: $('communityHub').value || '',
    emotionalSupport: Number($('emotionalSupport').value || 0),
    communication: Number($('communication').value || 0),
    environment: Number($('environment').value || 0),
    ethics: Number($('ethics').value || 0),
    parentReflection: $('parentReflection').value || '',
    mentorFeedback: $('mentorFeedback').value || '',
    learnerFeedback: $('learnerFeedback').value || '',
    feiScore: Number($('feiScore').textContent || 0),
    savedBy: 'web-client', // optionally replace with auth.uid
    timestamp: new Date().toISOString()
  };

  try {
    await setDoc(docRef, { ...payload, createdAt: serverTimestamp() });
    statusEl.textContent = '✅ Report saved successfully.';
    renderPreview(payload);
  } catch (e) {
    console.error('Save error', e);
    statusEl.textContent = '⚠️ Error saving report. Check console.';
  }
}

// ---------- Load from Firestore ----------
async function loadReport() {
  const ulp = $('ulpID').value?.trim();
  if(!ulp) { statusEl.textContent = 'Enter Family / ULP ID to load.'; return; }
  const docRef = doc(db, 'parent_assessments', ulp);
  try {
    const snap = await getDoc(docRef);
    if(!snap.exists()) {
      statusEl.textContent = 'No report found for this ULP ID.';
      return;
    }
    const data = snap.data();
    // populate form
    $('parentName').value = data.parentName || '';
    $('linkedLearners').value = data.linkedLearners || '';
    $('communityHub').value = data.communityHub || '';
    $('emotionalSupport').value = data.emotionalSupport || '';
    $('communication').value = data.communication || '';
    $('environment').value = data.environment || '';
    $('ethics').value = data.ethics || '';
    $('parentReflection').value = data.parentReflection || '';
    $('mentorFeedback').value = data.mentorFeedback || '';
    $('learnerFeedback').value = data.learnerFeedback || '';
    $('feiScore').textContent = data.feiScore || '';
    renderPreview(data);
    statusEl.textContent = 'Loaded report.';
  } catch (e) {
    console.error('Load error', e);
    statusEl.textContent = '⚠️ Error loading report. Check console.';
  }
}

// ---------- PDF Export ----------
async function downloadPDF() {
  // ensure preview updated
  renderPreview();
  const node = document.getElementById('reportPreview');
  const scale = 2;
  const canvas = await html2canvas(node, { scale: scale, useCORS: true, backgroundColor: '#ffffff' });
  const img = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: 'px', format: [canvas.width, canvas.height] });
  pdf.addImage(img, 'PNG', 0, 0, canvas.width, canvas.height);
  const name = `UHA_Parents_${($('parentName').value || 'Parent').replaceAll(' ','_')}_${new Date().toISOString().slice(0,10)}.pdf`;
  pdf.save(name);
}

// ---------- Clear form ----------
function clearForm(){
  ['parentName','ulpID','linkedLearners','communityHub','emotionalSupport','communication','environment','ethics','parentReflection','mentorFeedback','learnerFeedback','feiScore'].forEach(id=>{
    const el = $(id);
    if(!el) return;
    if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = '';
    else el.textContent = '';
  });
  $('feiScore').textContent = '—';
  renderPreview();
  statusEl.textContent = '';
}

// ---------- Event wiring ----------
document.addEventListener('DOMContentLoaded', ()=>{
  // buttons
  $('calcFei').addEventListener('click', ()=> {
    calculateFEI();
    renderPreview();
    statusEl.textContent = 'FEI calculated.';
  });
  $('saveBtn').addEventListener('click', saveReport);
  $('loadBtn').addEventListener('click', loadReport);
  $('downloadPdf').addEventListener('click', downloadPDF);
  $('clearBtn').addEventListener('click', ()=> {
    if(confirm('Clear form?')) clearForm();
  });

  // keep preview live on input change for key fields
  ['parentName','ulpID','linkedLearners','communityHub','emotionalSupport','communication','environment','ethics','parentReflection','mentorFeedback','learnerFeedback'].forEach(id=>{
    const el = $(id);
    if(!el) return;
    el.addEventListener('input', ()=> {
      // recalc FEI if relevant
      if(['emotionalSupport','communication','environment','ethics'].includes(id)) calculateFEI();
      renderPreview();
    });
  });

  // initial preview timestamp
  renderPreview();
});

