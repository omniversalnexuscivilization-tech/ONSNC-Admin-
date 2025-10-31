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

