// Global variables for theme management
let themeToggle;
let body;

// --- Ensure page always starts at the top on refresh ---
// This script runs very early to intercept browser's scroll restoration.
if (window.location.hash) {
  const cleanURL = window.location.origin + window.location.pathname + window.location.search;
  window.location.replace(cleanURL);
}

// Enhanced contact form functionality
function initializeContactForm() {
  const form = document.getElementById('contact-form');
  const messageArea = document.getElementById('contact-messages');
  const submitBtn = document.getElementById('submit-btn');
  const charCount = document.getElementById('char-count');
  const messageTextarea = document.getElementById('message');

  if (!form) return;

  // Character counter for message
  if (messageTextarea && charCount) {
    messageTextarea.addEventListener('input', function () {
      const length = this.value.length;
      charCount.textContent = length;

      if (length > 900) {
        charCount.style.color = '#dc3545';
      } else if (length > 800) {
        charCount.style.color = '#ffc107';
      } else {
        charCount.style.color = '';
      }
    });
  }

  // Form submission
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').style.display = 'none';
    submitBtn.querySelector('.btn-loading').style.display = 'inline';

    // Clear previous messages
    messageArea.innerHTML = '';
    messageArea.className = 'contact-messages';

    try {
      const formData = new FormData(form);
      const response = await fetch('/contact', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        messageArea.className = 'contact-messages success';
        messageArea.innerHTML = `<strong>Success!</strong> ${result.message}`;
        form.reset();
        charCount.textContent = '0';
      } else {
        messageArea.className = 'contact-messages error';
        messageArea.innerHTML = `<strong>Error:</strong> ${result.message}`;
      }
    } catch (error) {
      messageArea.className = 'contact-messages error';
      messageArea.innerHTML = '<strong>Error:</strong> Network error. Please try again.';
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').style.display = 'inline';
      submitBtn.querySelector('.btn-loading').style.display = 'none';
    }
  });

  // Real-time validation
  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', function () {
      validateField(this);
    });

    input.addEventListener('input', function () {
      clearFieldError(this);
    });
  });
}

function validateField(field) {
  const errorElement = document.getElementById(`${field.id}-error`);
  if (!errorElement) return;

  let isValid = true;
  let errorMessage = '';

  switch (field.type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
      break;
    case 'text':
      if (field.required && field.value.trim().length < 2) {
        isValid = false;
        errorMessage = 'This field is required and must be at least 2 characters';
      }
      break;
  }

  if (field.tagName === 'TEXTAREA') {
    if (field.required && field.value.trim().length < 10) {
      isValid = false;
      errorMessage = 'Message must be at least 10 characters long';
    }
  }

  if (!isValid) {
    errorElement.textContent = errorMessage;
    field.style.borderColor = '#dc3545';
  } else {
    clearFieldError(field);
  }
}

function clearFieldError(field) {
  const errorElement = document.getElementById(`${field.id}-error`);
  if (errorElement) {
    errorElement.textContent = '';
  }
  field.style.borderColor = '';
}

// Loading spinner functionality
function showLoading() {
  document.body.classList.add('loading');
}

function hideLoading() {
  document.body.classList.remove('loading');
}

// Enhanced smooth scrolling
function initializeSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Enhanced mobile menu functionality
function initializeMobileMenu() {
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (!mobileBtn || !navLinks) return;

  mobileBtn.addEventListener('click', function () {
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', !isExpanded);
    navLinks.classList.toggle('active');
  });

  // Close menu when clicking on a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      mobileBtn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function (e) {
    if (!mobileBtn.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('active');
      mobileBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// Enhanced theme toggle with animation
// Removed: initializeThemeToggle, setTheme(mode), and their event listeners

// Load theme from localStorage or server default
async function initializeTheme() {
  try {
    // Always fetch the latest settings from server first
    const response = await fetch('/api/portfolio_data');
    if (response.ok) {
      const data = await response.json();
      const serverTheme = data.settings?.default_theme || 'Default Dark';
      console.log('Server theme setting:', serverTheme);

      // Convert server theme setting to mode
      let serverThemeMode = 'dark'; // default fallback
      if (serverTheme.includes('Light')) {
        serverThemeMode = 'light';
      } else if (serverTheme.includes('Dark')) {
        serverThemeMode = 'dark';
      }

      // Check if user has a saved preference
      const savedTheme = localStorage.getItem("theme");

      if (savedTheme) {
        // User has a preference - check if it matches server setting
        if (savedTheme === serverThemeMode) {
          // User preference matches server setting, use it
          console.log('Using user preference (matches server):', savedTheme);
          setThemeMode(savedTheme === 'dark'); // Pass boolean for setThemeMode
        } else {
          // Server setting has changed, update user preference
          console.log('Server theme changed, updating user preference from', savedTheme, 'to', serverThemeMode);
          setThemeMode(serverThemeMode === 'dark'); // Pass boolean for setThemeMode
          localStorage.setItem("theme", serverThemeMode);
        }
      } else {
        // No user preference, use server setting
        console.log('No user preference, using server setting:', serverThemeMode);
        setThemeMode(serverThemeMode === 'dark'); // Pass boolean for setThemeMode
      }
    } else {
      // Fallback to dark theme if API fails
      console.log('API failed, using fallback dark theme');
      setThemeMode(true); // Fallback to dark
    }
  } catch (error) {
    console.error('Error loading theme:', error);
    // Fallback to dark theme
    setThemeMode(true);
  }
}

// Initialize theme when page loads
initializeTheme();

// Function to check for server-side theme changes
async function checkForThemeChanges() {
  try {
    const response = await fetch('/api/portfolio_data');
    if (response.ok) {
      const data = await response.json();
      const serverTheme = data.settings?.default_theme || 'Default Dark';

      // Convert server theme setting to mode
      let serverThemeMode = 'dark';
      if (serverTheme.includes('Light')) {
        serverThemeMode = 'light';
      } else if (serverTheme.includes('Dark')) {
        serverThemeMode = 'dark';
      }

      const savedTheme = localStorage.getItem("theme");

      // If server theme is different from current theme, update it
      if (savedTheme !== serverThemeMode) {
        console.log('Theme change detected: server =', serverThemeMode, 'current =', savedTheme);
        setThemeMode(serverThemeMode === 'dark'); // Pass boolean for setThemeMode
        localStorage.setItem("theme", serverThemeMode);

        // Show notification to user
        showThemeChangeNotification(serverThemeMode);
      }
    }
  } catch (error) {
    console.error('Error checking for theme changes:', error);
  }
}

// Function to show theme change notification
function showThemeChangeNotification(themeMode) {
  // Remove existing notification if any
  const existingNotification = document.getElementById('theme-change-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'theme-change-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(90deg, #ff6a00, #ee0979, #00c3ff);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 10000;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideInRight 0.3s ease-out;
    max-width: 300px;
  `;

  notification.innerHTML = `
    <span style="font-size: 18px;">🎨</span>
    <span>Theme updated to ${themeMode} mode</span>
    <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px; margin-left: auto;">×</button>
  `;

  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  // Add to page
  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = 'slideInRight 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// Check for theme changes every 30 seconds
setInterval(checkForThemeChanges, 30000);

// Also check when the page becomes visible (user switches back to tab)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    checkForThemeChanges();
  }
});

// Toggle theme on swipe switch
// Removed: themeToggle.addEventListener("change", () => { ... });

// Function to render skills
function renderSkills(skills) {
  const technicalSkillsList = document.getElementById('technical-skills');
  const softSkillsList = document.getElementById('soft-skills');

  if (!technicalSkillsList || !softSkillsList) {
    console.warn('Skills containers not found');
    return;
  }

  // Clear existing content
  technicalSkillsList.innerHTML = '';
  softSkillsList.innerHTML = '';

  // Add technical skills
  if (skills.technical && Array.isArray(skills.technical)) {
    skills.technical.forEach(skill => {
      const li = document.createElement('li');
      const icon = skill.icon || '⚡';
      if (icon.startsWith('<svg') || icon.startsWith('<i')) {
        li.insertAdjacentHTML('beforeend', icon + ' ');
        li.appendChild(document.createTextNode(skill.name || 'Unknown Skill'));
      } else {
        li.innerHTML = `${icon} ${skill.name || 'Unknown Skill'}`;
      }
      technicalSkillsList.appendChild(li);
    });
  }

  // Add soft skills
  if (skills.soft && Array.isArray(skills.soft)) {
    skills.soft.forEach(skill => {
      const li = document.createElement('li');
      const icon = skill.icon || '✨';
      if (icon.startsWith('<svg') || icon.startsWith('<i')) {
        li.insertAdjacentHTML('beforeend', icon + ' ');
        li.appendChild(document.createTextNode(skill.name || 'Unknown Skill'));
      } else {
        li.innerHTML = `${icon} ${skill.name || 'Unknown Skill'}`;
      }
      softSkillsList.appendChild(li);
    });
  }
}

// Function to render projects
function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  if (!container) {
    console.warn('Projects container not found');
    return;
  }

  container.innerHTML = '';

  if (!Array.isArray(projects)) {
    console.warn('Projects data is not an array');
    return;
  }

  projects.forEach(project => {
    const projectCard = document.createElement('div');
    projectCard.className = 'project-card color-card';
    projectCard.innerHTML = `
      <h3>${project.title || 'Untitled Project'}</h3>
      <p>${project.description || 'No description available'}</p>
      <div class="project-tech">
        ${(project.technologies && Array.isArray(project.technologies) ? project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('') : '')}
      </div>
      ${project.link ? `<a href="${project.link}" target="_blank" class="project-link-tag">View Project</a>` : ''}
    `;
    container.appendChild(projectCard);
  });
}

// Function to render internships
function renderInternships(internships) {
  const container = document.getElementById('internships-container');
  if (!container) {
    console.warn('Internships container not found');
    return;
  }

  container.innerHTML = '';

  if (!Array.isArray(internships)) {
    console.warn('Internships data is not an array');
    return;
  }

  internships.forEach(internship => {
    const internshipCard = document.createElement('div');
    internshipCard.className = 'timeline-item';
    internshipCard.innerHTML = `
      <div class="timeline-content color-card">
        <h4>${internship.title || 'Untitled Internship'}</h4>
        <p class="company">${internship.company || 'Unknown Company'}</p>
        <p class="duration">${internship.duration || 'Duration not specified'}</p>
        <p>${internship.description || 'No description available'}</p>
      </div>
    `;
    container.appendChild(internshipCard);
  });
}

// Function to render thesis
function renderThesis(thesis) {
  const container = document.getElementById('thesis-container');
  container.innerHTML = ''; // Clear existing content for thesis

  thesis.forEach(item => {
    const thesisCard = document.createElement('div');
    thesisCard.className = 'timeline-item';
    thesisCard.innerHTML = `
      <div class="timeline-content color-card">
        <h4>${item.title}</h4>
        <p>${item.description}</p>
        <p class="university">${item.university}, ${item.year}</p>
      </div>
    `;
    container.appendChild(thesisCard);
  });
}

// Function to render certifications
function renderCertifications(certifications) {
  const container = document.getElementById('certifications-container');
  container.innerHTML = '';

  certifications.forEach(cert => {
    const certCard = document.createElement('div');
    certCard.className = 'timeline-item';
    certCard.innerHTML = `
      <div class="timeline-content color-card">
        <h4>${cert.title}</h4>
        <p class="issuer">${cert.issuer}</p>
        <p class="date">${cert.year}</p>
        ${cert.link ? `<a href="${cert.link}" target="_blank" class="cert-link">View Certificate</a>` : ''}
      </div>
    `;
    container.appendChild(certCard);
  });
}

// Function to render education
function renderEducation(education) {
  const container = document.getElementById('education-container');
  if (!container) return;
  container.innerHTML = '';
  education.forEach(edu => {
    const eduCard = document.createElement('div');
    eduCard.className = 'timeline-item';
    eduCard.innerHTML = `
      <div class="timeline-content color-card">
        <h4>${edu.degree}</h4>
        <p class="university">${edu.university}</p>
        <p class="date">${edu.year}</p>
        ${edu.gpa ? `<p class="gpa"><strong>GPA:</strong> ${edu.gpa}</p>` : ''}
        ${edu.honors ? `<p class="honors"><strong>Honors:</strong> ${edu.honors}</p>` : ''}
        <p>${edu.description}</p>
        ${edu.certificate_link ? `<a href="${edu.certificate_link}" target="_blank" class="cert-link">View Certificate</a>` : ''}
      </div>
    `;
    container.appendChild(eduCard);
  });
}

// Function to render achievements
function renderAchievements(achievements) {
  const container = document.getElementById('achievements-container');
  if (!container) return;
  container.innerHTML = '';
  achievements.forEach(achievement => {
    const achievementCard = document.createElement('div');
    achievementCard.className = 'achievement-item';
    achievementCard.innerHTML = `
      <div class="achievement-title">${achievement.title}</div>
      <div class="achievement-category">${achievement.category}</div>
      <div class="achievement-description">${achievement.description}</div>
      <div class="achievement-year">${achievement.year}</div>
    `;
    container.appendChild(achievementCard);
  });
}

// Function to render interests
function renderInterests(interests) {
  const container = document.getElementById('interests-container');
  if (!container) return;
  container.innerHTML = '';
  interests.forEach(interest => {
    const interestTag = document.createElement('div');
    interestTag.className = 'interest-tag';
    interestTag.textContent = interest;
    container.appendChild(interestTag);
  });
}

// Function to render about highlights
function renderAboutHighlights(about) {
  const container = document.getElementById('about-highlights-container');
  if (!container) return; // Ensure the container exists
  container.innerHTML = ''; // Clear existing content

  // Create highlights array from individual properties
  const highlights = [];
  for (let i = 1; i <= 3; i++) {
    const emoji = about[`highlight${i}_emoji`];
    const title = about[`highlight${i}_title`];
    const description = about[`highlight${i}_description`];

    if (emoji && title && description) {
      highlights.push({ emoji, title, description });
    }
  }

  highlights.forEach(highlight => {
    const highlightItem = document.createElement('div');
    highlightItem.className = 'highlight-item';
    highlightItem.innerHTML = `
            <span class="emoji">${highlight.emoji}</span>
            <h4>${highlight.title}</h4>
            <p>${highlight.description}</p>
        `;
    container.appendChild(highlightItem);
  });
}

// Scroll-triggered animations using Intersection Observer
function initializeScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all cards and sections
  const elementsToAnimate = document.querySelectorAll('.card, .project-card, .timeline-content, .highlight-item');
  elementsToAnimate.forEach(el => {
    el.classList.add('scroll-animate');
    observer.observe(el);
  });
}

// Enhanced error handling and user feedback
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span class="notification-text">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Navbar Scroll Effect
function initializeNavbarScrollEffect() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// Scroll Spy for Active Link Highlighting
function initializeScrollSpy() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (sections.length === 0 || navLinks.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px', // Activate when section is near top
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');

        // Remove active class from all links
        navLinks.forEach(link => {
          link.classList.remove('active');
          // Check if link href matches the section id
          const href = link.getAttribute('href');
          if (href === `#${id}` || href === id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });
}

// Enhanced portfolio data loading with better error handling
async function fetchAndRenderPortfolioData() {
  showLoading();

  try {
    const response = await fetch('/api/portfolio_data');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Portfolio data received:', data);

    // Check if we have the required data structure
    if (!data.about || !data.skills || !data.projects) {
      throw new Error('Invalid data structure received from server');
    }

    // Render all sections
    console.log('Rendering about highlights...');
    renderAboutHighlights(data.about);

    console.log('Rendering skills...');
    renderSkills(data.skills);

    console.log('Rendering projects...');
    renderProjects(data.projects);

    console.log('Rendering experience sections...');
    renderInternships(data.experience?.internships || []);
    renderThesis(data.experience?.thesis || []);
    renderCertifications(data.experience?.certifications || []);
    renderEducation(data.experience?.education || []);

    console.log('Rendering achievements...');
    renderAchievements(data.experience?.achievements || []);

    console.log('Rendering interests...');
    renderInterests(data.experience?.interests || []);

    // Initialize theme from server settings
    if (data.settings?.default_theme) {
      const serverTheme = data.settings.default_theme.toLowerCase().includes('light') ? 'light' : 'dark';
      await initializeTheme(); // Call initializeTheme to handle loading from server
    } else {
      await initializeTheme();
    }

    // Initialize scroll animations after content is loaded
    setTimeout(() => {
      initializeScrollAnimations();
    }, 100);

    showNotification('Portfolio loaded successfully!', 'success');

  } catch (error) {
    console.error('Error loading portfolio data:', error);
    showNotification('Failed to load portfolio content. Please refresh the page.', 'error');

    // Show error message to user
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="card">
          <h2>⚠️ Error Loading Content</h2>
          <p>Sorry, there was an error loading the portfolio content. Please refresh the page or try again later.</p>
          <p><strong>Error:</strong> ${error.message}</p>
          <button onclick="location.reload()" class="cta-btn primary-btn">🔄 Refresh Page</button>
        </div>
      `;
    }
  } finally {
    hideLoading();
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM loaded, initializing portfolio...');

  try {
    initializeContactForm();
    initializeSmoothScrolling();
    initializeMobileMenu();
    initializeScrollSpy();
    initializeNavbarScrollEffect();
    fetchAndRenderPortfolioData();
  } catch (error) {
    console.error('Error during initialization:', error);
    showNotification('Error initializing portfolio. Please refresh the page.', 'error');
  }

  // Add CSS for animations and notifications
  const style = document.createElement('style');
  style.textContent = `
    .theme-transitioning * {
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
    }
    
    .scroll-animate {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s ease-out;
    }
    
    .scroll-animate.animate-in {
      opacity: 1;
      transform: translateY(0);
    }
    
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
    }
    
    .notification-success {
      background: #28a745;
    }
    
    .notification-error {
      background: #dc3545;
    }
    
    .notification-info {
      background: #17a2b8;
    }
    
    .notification-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .notification-close {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      margin-left: 10px;
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    body.light-mode .notification {
      background: #f8f9fa;
      color: #333;
      border: 1px solid #dee2e6;
    }
  `;
  document.head.appendChild(style);
});

// Hide/show navbar on scroll direction
let lastScrollY = window.scrollY;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  if (!navbar) return;
  if (window.scrollY > lastScrollY && window.scrollY > 100) {
    // Scrolling down
    navbar.classList.add('hide-navbar');
  } else {
    // Scrolling up
    navbar.classList.remove('hide-navbar');
  }
  lastScrollY = window.scrollY;
});

// Theme toggle logic for both desktop and mobile
function setThemeMode(isDark) {
  if (isDark) {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  }
  // Save preference
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  syncThemeToggles(isDark); // Always sync toggles after setting theme
}

function syncThemeToggles(isDark) {
  var desktopToggle = document.getElementById('theme-toggle');
  var mobileToggle = document.getElementById('theme-toggle-mobile');
  if (desktopToggle) desktopToggle.checked = isDark;
  if (mobileToggle) mobileToggle.checked = isDark;
}

function handleThemeToggle(e) {
  var isDark = e.target.checked;
  setThemeMode(isDark);
  // syncThemeToggles(isDark); // This line is removed as it's now handled by setThemeMode
}

document.addEventListener('DOMContentLoaded', function () {
  var desktopToggle = document.getElementById('theme-toggle');
  var mobileToggle = document.getElementById('theme-toggle-mobile');

  // Load theme from localStorage
  var savedTheme = localStorage.getItem('theme');
  var isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  setThemeMode(isDark);
  // syncThemeToggles(isDark); // This line is removed as it's now handled by setThemeMode

  if (desktopToggle) desktopToggle.addEventListener('change', handleThemeToggle);
  if (mobileToggle) mobileToggle.addEventListener('change', handleThemeToggle);
});