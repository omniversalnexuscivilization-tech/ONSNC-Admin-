// body-script.js - UPDATED VERSION
document.addEventListener('DOMContentLoaded', function() {
  // Form submission handler
  const contactForm = document.getElementById('contactForm');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const message = formData.get('message');
      
      // In a real application, you would send this data to a server
      // For now, we'll just show a success message
      showToast('Message sent successfully! We will get back to you soon.');
      
      // Reset form
      contactForm.reset();
    });
  }
  
  // Toast notification function
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // Style the toast
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, var(--cyan), var(--violet-neon))',
      color: 'var(--navy-dark)',
      padding: '12px 20px',
      borderRadius: 'var(--border-radius)',
      boxShadow: 'var(--shadow-medium)',
      zIndex: '1000',
      fontWeight: '500',
      maxWidth: '300px',
      transform: 'translateY(100px)',
      opacity: '0',
      transition: 'all 0.3s ease'
    });
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
  
  // Add animation to cards on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe cards for animation
  const cards = document.querySelectorAll('.card, .panel, .stat');
  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
  
  // REMOVED: The code that was preventing explore links from working
  // Now explore links will work normally
});


// Firebase Initialization (replace with your Firebase credentials)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firestore document structure example:
// collection: "uhan_analytics"
// doc: "active_counts"
// fields: { learners: 125, mentors: 24, facilitators: 17, parents: 32, ueiniti: 4 }

async function loadStats() {
  try {
    const docRef = doc(db, "uhan_analytics", "active_counts");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      updateCounter("learners-count", data.learners);
      updateCounter("mentors-count", data.mentors);
      updateCounter("facilitators-count", data.facilitators);
      updateCounter("parents-count", data.parents);
      updateCounter("ueiniti-count", data.ueiniti);
    } else {
      console.log("No such document!");
    }
  } catch (e) {
    console.error("Error fetching UHAN stats:", e);
  }
}

// Smooth number animation
function updateCounter(id, endValue) {
  const element = document.getElementById(id);
  let startValue = 0;
  const duration = 1500;
  const stepTime = Math.abs(Math.floor(duration / endValue));
  const counter = setInterval(() => {
    startValue += 1;
    element.textContent = startValue;
    if (startValue >= endValue) clearInterval(counter);
  }, stepTime);
}

loadStats();
