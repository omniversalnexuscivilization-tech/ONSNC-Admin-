// Firebase integration for Mentor Assessment
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔐 Firebase Config (Replace with your project values)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_APP.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_APP.appspot.com",
  messagingSenderId: "YOUR_MSG_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Update slider value in real-time
document.querySelectorAll("input[type='range']").forEach(slider => {
  slider.addEventListener("input", () => {
    document.getElementById(slider.id + "Value").textContent = slider.value;
  });
});

// Save mentor report
document.getElementById("saveBtn").addEventListener("click", async () => {
  const mentorData = {
    name: document.getElementById("mentorName").value,
    ulpToken: document.getElementById("ulpToken").value,
    institution: document.getElementById("institution").value,
    facilitation: document.getElementById("facilitation").value,
    guidance: document.getElementById("guidance").value,
    innovation: document.getElementById("innovation").value,
    ethics: document.getElementById("ethics").value,
    community: document.getElementById("community").value,
    comments: document.getElementById("mentorComments").value,
    timestamp: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, "mentor_assessments", mentorData.ulpToken), mentorData);
    alert("✅ Mentor report saved successfully!");
  } catch (e) {
    console.error("Error saving data:", e);
  }
});

// Load mentor report
document.getElementById("loadBtn").addEventListener("click", async () => {
  const ulpToken = document.getElementById("ulpToken").value;
  const ref = doc(db, "mentor_assessments", ulpToken);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    document.getElementById("mentorName").value = data.name;
    document.getElementById("institution").value = data.institution;
    document.getElementById("facilitation").value = data.facilitation;
    document.getElementById("guidance").value = data.guidance;
    document.getElementById("innovation").value = data.innovation;
    document.getElementById("ethics").value = data.ethics;
    document.getElementById("community").value = data.community;
    document.getElementById("mentorComments").value = data.comments;
  } else {
    alert("❌ No report found for this ULP Token.");
  }
});

