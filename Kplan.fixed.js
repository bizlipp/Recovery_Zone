// DOM Elements
const storySection = document.getElementById('story-section');
const toolkitSection = document.getElementById('toolkit-section');
const routineSection = document.getElementById('routine-section');
const checklistContainer = document.getElementById('checklist-container');
const streakCount = document.getElementById('streak-count');
const streakMessage = document.getElementById('streak-message');
const increaseTextBtn = document.getElementById('increase-text');
const decreaseTextBtn = document.getElementById('decrease-text');
const readAloudBtn = document.getElementById('read-aloud');
const stopReadingBtn = document.getElementById('stop-reading');
const modeToggle = document.getElementById('mode-toggle');
const floatingStreakCount = document.getElementById('floating-streak-count');
const completedCount = document.getElementById('completed-count');
const totalCount = document.getElementById('total-count');
const progressBar = document.getElementById('progress-bar');
const markAllDoneBtn = document.getElementById('mark-all-done');
const easterEgg = document.getElementById('easter-egg');
const medicationSection = document.getElementById('medication-section');
const offlineMessage = document.getElementById('offline-message');

// Card toggle elements
const cardToggles = document.querySelectorAll('.card-toggle');

// State Management
let currentFontSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--text-size-base'));
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let isReading = false;
let isDarkMode = false;
let medicationReminders = [];

// List of friendly easter egg messages
const easterEggMessages = [
  "Still got it, Pops. Still got it.",
  "You're tougher than the rest.",
  "One step at a time keeps the doctor away.",
  "Taking care of yourself is the manliest thing you can do.",
  "Remember when you fixed that old truck? Your body's not much different.",
  "Not trying to live forever, just trying to live well.",
  "Tough guys take care of themselves too.",
  "Strong enough to care for yourself. Smart enough to do it right."
];

// Enhanced milestone messages
const milestoneMessages = {
  streaks: {
    3: "Three days strong - you're building momentum!",
    7: "A full week streak! Your kidneys are starting to feel the difference.",
    14: "Two weeks of consistency - this is how lasting change happens.",
    21: "Three weeks in! You've built a real habit now.",
    30: "A WHOLE MONTH! That's the kind of commitment that moves mountains.",
    60: "Two months of taking care. Remember how you used to feel compared to now?",
    90: "Three months strong! Your discipline is something to be proud of.",
    100: "Triple digits! This isn't just a phase - it's who you are now.",
    365: "A FULL YEAR of taking care of yourself. Incredible commitment, Pops."
  },
  progressMessages: {
    halfwayDone: "Halfway there today. Keep it up!",
    firstItemDone: "First step done. Good start to the day.",
    almostDone: "Just one more to go. Finish strong!",
    allDone: [
      "Engine sounds smoother already.",
      "That's how a wise man takes care of business.",
      "Your body's thanking you for that.",
      "Truck's running better with that clean filter.",
      "Taking care of business like you always have."
    ]
  },
  specialOccasions: {
    monday: "Starting the week off right.",
    friday: "Finishing the week strong, just like you.",
    newMonth: "New month, same commitment. That's how it's done.",
    milestone10: "That's 10 completed days. The small things add up."
  }
};

// Load saved data
document.addEventListener('DOMContentLoaded', function() {
  loadLocalStorage();
  showDailyProgressReport();
  populateSections();
  populateChecklist();
  initAccessibilityControls();
  updateStreakCount();
  initCardToggles();
  initDarkModeToggle();
  updateFloatingWidget();
  setupMarkAllDone();
  scheduleRandomEasterEgg();
  
  // Initialize medication features
  loadMedicationReminders();
  setupMedicationUI();
  checkMedicationReminders();
  
  // Initialize lab results tracking
  initializeLabResults();
  
  // Initialize UI components previously in HTML
  initializeProgressChart();
  initializeAchievements();
  initializeShoppingFilters();
  setupMobileOptimizations();
  setupNetworkMonitoring();
  registerServiceWorker();
});

// Card Toggle Functionality
function initCardToggles() {
  cardToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const section = this.closest('.content-section');
      const toggleText = this.querySelector('.toggle-text');
      const toggleIcon = this.querySelector('.toggle-icon');
      
      section.classList.toggle('card-collapsed');
      
      if (section.classList.contains('card-collapsed')) {
        toggleText.textContent = 'Show';
        toggleIcon.classList.remove('fa-chevron-up');
        toggleIcon.classList.add('fa-chevron-down');
      } else {
        toggleText.textContent = 'Hide';
        toggleIcon.classList.remove('fa-chevron-down');
        toggleIcon.classList.add('fa-chevron-up');
      }

      // Save state to localStorage
      const sectionId = section.id;
      const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '[]');
      
      if (section.classList.contains('card-collapsed')) {
        if (!collapsedSections.includes(sectionId)) {
          collapsedSections.push(sectionId);
        }
      } else {
        const index = collapsedSections.indexOf(sectionId);
        if (index > -1) {
          collapsedSections.splice(index, 1);
        }
      }
      
      localStorage.setItem('collapsedSections', JSON.stringify(collapsedSections));
    });
  });
}

// Dark Mode Toggle
function initDarkModeToggle() {
  modeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    isDarkMode = document.body.classList.contains('dark-mode');
    
    // Update icon
    const icon = this.querySelector('i');
    if (isDarkMode) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
    
    // Save preference
    localStorage.setItem('darkMode', isDarkMode);
  });
  
  // Apply saved preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    const icon = modeToggle.querySelector('i');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
    isDarkMode = true;
  }
}

// Mark All Done button functionality
function setupMarkAllDone() {
  markAllDoneBtn.addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('#checklist-container input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
      if (!checkbox.checked) {
        checkbox.checked = true;
        saveChecklistItem(checkbox.id, true);
        
        // Add visual feedback
        const itemElement = checkbox.closest('.checklist-item');
        itemElement.style.backgroundColor = 'var(--highlight-background)';
        setTimeout(() => {
          itemElement.style.backgroundColor = '';
        }, 1000);
      }
    });
    
    // Play satisfying sound
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
    audio.volume = 0.3;
    audio.play();
    
    // Update counts
    updateStreakCount();
    updateFloatingWidget();
    
    // Show congratulatory easter egg - use enhanced version
    const completionMessages = milestoneMessages.progressMessages.allDone;
    const randomMessage = completionMessages[Math.floor(Math.random() * completionMessages.length)];
    showEasterEgg(randomMessage);
    
    // Check for total completed days milestone
    checkCompletedDaysMilestone();
  });
}

// Random Easter Egg
function scheduleRandomEasterEgg() {
  // Show first easter egg after 30 seconds
  setTimeout(function() {
    showRandomEasterEgg();
    
    // Then schedule random appearances
    setInterval(showRandomEasterEgg, Math.floor(Math.random() * (10 * 60 * 1000)) + (5 * 60 * 1000)); // Between 5-15 minutes
  }, 30 * 1000);
}

function showRandomEasterEgg() {
  const randomMessage = easterEggMessages[Math.floor(Math.random() * easterEggMessages.length)];
  showEasterEgg(randomMessage);
}

function showEasterEgg(message) {
  easterEgg.textContent = message;
  easterEgg.classList.add('show');
  
  setTimeout(() => {
    easterEgg.classList.remove('show');
  }, 8000); // Show for 8 seconds
}

// Local Storage Functions
function loadLocalStorage() {
  // Load font size preference
  const savedFontSize = localStorage.getItem('fontSizePreference');
  if (savedFontSize) {
    currentFontSize = parseInt(savedFontSize);
    document.documentElement.style.setProperty('--text-size-base', `${currentFontSize}px`);
  }
  
  // Load checklist data for today
  const today = new Date().toISOString().split('T')[0];
  const checklistData = JSON.parse(localStorage.getItem('checklistData') || '{}');
  
  // Initialize today's data if not exists
  if (!checklistData[today]) {
    checklistData[today] = {};
    localStorage.setItem('checklistData', JSON.stringify(checklistData));
  }
  
  // Load collapsed sections
  const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '[]');
  setTimeout(() => {
    collapsedSections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.classList.add('card-collapsed');
        const toggleText = section.querySelector('.toggle-text');
        const toggleIcon = section.querySelector('.toggle-icon');
        
        if (toggleText && toggleIcon) {
          toggleText.textContent = 'Show';
          toggleIcon.classList.remove('fa-chevron-up');
          toggleIcon.classList.add('fa-chevron-down');
        }
      }
    });
  }, 100);
  
  // Check for special day messages
  checkForSpecialDayMessages();
}

// Check for special day messages (Monday, Friday, New Month)
function checkForSpecialDayMessages() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dayOfMonth = today.getDate();
  
  // Monday message
  if (dayOfWeek === 1) {
    setTimeout(() => {
      showEasterEgg(milestoneMessages.specialOccasions.monday);
    }, 60 * 1000); // Show after 1 minute
  }
  
  // Friday message
  if (dayOfWeek === 5) {
    setTimeout(() => {
      showEasterEgg(milestoneMessages.specialOccasions.friday);
    }, 45 * 1000); // Show after 45 seconds
  }
  
  // New month message (1st of month)
  if (dayOfMonth === 1) {
    setTimeout(() => {
      showEasterEgg(milestoneMessages.specialOccasions.newMonth);
    }, 15 * 1000); // Show after 15 seconds
  }
}

function saveChecklistItem(id, isChecked) {
  const today = new Date().toISOString().split('T')[0];
  const checklistData = JSON.parse(localStorage.getItem('checklistData') || '{}');
  
  if (!checklistData[today]) {
    checklistData[today] = {};
  }
  
  checklistData[today][id] = isChecked;
  localStorage.setItem('checklistData', JSON.stringify(checklistData));
  
  updateStreakCount();
  updateFloatingWidget();
  
  // Check for progress-based messages
  checkForProgressMessage();
}

// Check for progress-based messages (halfway, almost done, etc.)
function checkForProgressMessage() {
  const today = new Date().toISOString().split('T')[0];
  const checklistData = JSON.parse(localStorage.getItem('checklistData') || '{}');
  const todayData = checklistData[today] || {};
  
  // Count completed items
  const completed = Object.values(todayData).filter(value => value === true).length;
  const total = document.querySelectorAll('#checklist-container .checklist-item').length;
  
  // First item done
  if (completed === 1) {
    showEasterEgg(milestoneMessages.progressMessages.firstItemDone);
  }
  
  // Halfway done
  if (completed === Math.ceil(total / 2) && total > 1) {
    showEasterEgg(milestoneMessages.progressMessages.halfwayDone);
  }
  
  // Almost done (all but 1)
  if (completed === total - 1 && total > 1) {
    showEasterEgg(milestoneMessages.progressMessages.almostDone);
  }
  
  // All done message handled in the checkbox event listener
}

// Check for milestone based on total completed days
function checkCompletedDaysMilestone() {
  const checklistData = JSON.parse(localStorage.getItem('checklistData') || '{}');
  
  // Count days with at least one completed task
  const completedDays = Object.keys(checklistData).filter(date => {
    return Object.values(checklistData[date]).filter(v => v === true).length > 0;
  }).length;
  
  // Check for 10th completed day
  if (completedDays === 10) {
    setTimeout(() => {
      showEasterEgg(milestoneMessages.specialOccasions.milestone10);
    }, 2000); // Show after 2 seconds
  }
}

// Update floating widget with current progress
function updateFloatingWidget() {
  const today = new Date().toISOString().split('T')[0];
  const checklistData = JSON.parse(localStorage.getItem('checklistData') || '{}');
  const todayData = checklistData[today] || {};
  
  // Count completed items
  const completed = Object.values(todayData).filter(value => value === true).length;
  const total = document.querySelectorAll('#checklist-container .checklist-item').length;
  
  // Update UI
  completedCount.textContent = completed;
  totalCount.textContent = total;
  floatingStreakCount.textContent = streakCount.textContent;
  
  // Update progress bar
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  progressBar.style.width = `${percentage}%`;
  
  // If all done, update button state
  if (completed === total && total > 0) {
    markAllDoneBtn.textContent = "All Done Today!";
    markAllDoneBtn.disabled = true;
  } else {
    markAllDoneBtn.textContent = "Mark Today Complete";
    markAllDoneBtn.disabled = false;
  }
}

// Content Population
function populateSections() {
  // Story Section - Content is now in the card-content div
  const storyContent = storySection.querySelector('.card-content');
  storyContent.innerHTML = `
    <div class="quote-box">
      The engine's running hotter now, and the filter's starting to clog.
    </div>
    <p>You've carried a lot. Worked hard. Didn't always eat right, but you kept going.</p>
    <p>Now your body's whispering something—it's not broken, but it's <span class="highlight-text">wearing thin</span>.</p>
    <p>Your kidneys? They're like the oil filter on a truck that's been running too hard without a flush. 
       Doesn't mean the whole truck's shot—just means if you keep pushing it the same way, you might not make it up the next hill.</p>
  <p>That number they gave you—creatinine 2.62—means your kidneys are tired. Time to lighten the load and give 'em a fighting chance.</p>
    <div class="quote-box">
      No one's asking you to give up your fire.<br>
      Just don't burn down the house with it.
    </div>
`;

// Toolkit Section
  const toolkitContent = toolkitSection.querySelector('.card-content');
  toolkitContent.innerHTML = `
    <ul>
      <li><strong><i class="fas fa-fire icon"></i> Castor Oil Packs</strong> – Warm oil on a cloth, place over lower back 3x/week, helps blood flow and healing.</li>
      <li><strong><i class="fas fa-tint icon"></i> Structured Water</strong> – Lemon, Himalayan salt, or minerals added. Sip all day, not chug.</li>
      <li><strong><i class="fas fa-leaf icon"></i> Nettle Seed Tincture</strong> – 1-2 dropperfuls twice a day. Helps kidney tissue recover.</li>
      <li><strong><i class="fas fa-wind icon"></i> Breath Work</strong> – Inhale 4s, exhale 6s for 5 mins. Drops blood pressure, calms kidneys.</li>
      <li><strong><i class="fas fa-bath icon"></i> Magnesium</strong> – Soak in Epsom salt or spray magnesium oil at night. Helps relax vessels and heal.</li>
      <li><strong><i class="fas fa-heartbeat icon"></i> CoQ10 + Fish Oil</strong> – Protects kidneys on a cellular level. Clinically backed.</li>
      <li><strong><i class="fas fa-moon icon"></i> Jing Practices</strong> – Go to bed early, slow movements, rub lower back.</li>
      <li><strong><i class="fas fa-water icon"></i> Energetic Healing</strong> – Talk, sit by a river, let old wounds breathe.</li>
      <li><strong><i class="fas fa-shield-alt icon"></i> Protective Mindset</strong> – This isn't about quitting. It's about reinforcing.</li>
  </ul>
    <div class="quote-box">
      "It's not about what you cut out. It's about what you rebuild."
    </div>
`;

// Routine Section
  const routineContent = routineSection.querySelector('.card-content');
  routineContent.innerHTML = `
    <h3><i class="fas fa-sun icon"></i> Morning</h3>
  <ul>
    <li>Lemon water + pinch of salt</li>
    <li>Nettle tea bag in hot water</li>
  </ul>
    <h3><i class="fas fa-hamburger icon"></i> Midday</h3>
  <ul>
    <li>Castor oil pack while resting</li>
    <li>Hot molasses drink</li>
  </ul>
    <h3><i class="fas fa-moon icon"></i> Evening</h3>
  <ul>
    <li>Foot soak: Epsom + ginger slice</li>
    <li>Spray magnesium oil on legs/back</li>
  </ul>
    <div class="quote-box">
      "You don't have to change everything. Just change one or two things—and do them every damn day."
    </div>
  `;
}

function populateChecklist() {
  // Define checklist items
  const checklistItems = [
    { id: 'water', text: 'Drank extra water today', info: 'Every glass of water helps your kidneys filter better. Try for 6-8 glasses.' },
    { id: 'walk', text: 'Took a short walk', info: 'Even 5 minutes of walking improves blood flow to your kidneys.' },
    { id: 'tea', text: 'Had a cup of kidney-supporting tea', info: 'Nettle, corn silk, or dandelion tea all help your kidneys work better.' },
    { id: 'salt', text: 'Went easy on the salt today', info: 'Less salt means less work for your kidneys to filter it out.' },
    { id: 'rest', text: 'Took time to rest', info: 'Rest lets your body repair itself, especially your kidneys.' }
  ];
  
  // Set the total items on the page
  totalCount.textContent = checklistItems.length;
  
  // Get today's saved data
  const today = new Date().toISOString().split('T')[0];
  const checklistData = JSON.parse(localStorage.getItem('checklistData') || '{}');
  const todayData = checklistData[today] || {};
  
  // Generate checklist HTML
  checklistContainer.innerHTML = '';
  checklistItems.forEach(item => {
    const isChecked = todayData[item.id] === true;
    
    const itemElement = document.createElement('div');
    itemElement.className = 'checklist-item';
    itemElement.innerHTML = `
      <input type="checkbox" id="${item.id}" ${isChecked ? 'checked' : ''}>
      <label for="${item.id}">${item.text}</label>
      <div class="checklist-info"><i class="fas fa-info-circle"></i></div>
      <div class="info-tooltip">${item.info}</div>
    `;
    
    checklistContainer.appendChild(itemElement);
    
    // Add event listeners
    const checkbox = itemElement.querySelector(`#${item.id}`);
    checkbox.addEventListener('change', function() {
      saveChecklistItem(item.id, this.checked);
      
      // Add satisfaction feedback
      if (this.checked) {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3');
        audio.volume = 0.3;
        audio.play();
        
        // Use a CSS variable compatible background color
        itemElement.style.backgroundColor = 'var(--highlight-background)';
        setTimeout(() => {
          // Reset to CSS variable based background
          itemElement.style.backgroundColor = '';
        }, 1000);

        // Show encouraging easter egg occasionally
        if (Math.random() > 0.7) {
          showEasterEgg("That's how it's done. Small steps, big difference.");
        }
      }
    });
    
    // Info tooltip toggle
    const infoBtn = itemElement.querySelector('.checklist-info');
    infoBtn.addEventListener('click', function() {
      itemElement.classList.toggle('show-info');
    });
  });
  
  // Update the floating widget
  updateFloatingWidget();
}

function updateStreakCount() {
  const checklistData = JSON.parse(localStorage.getItem('checklistData') || '{}');
  let currentStreak = 0;
  let today = new Date();
  
  // Check backwards from yesterday
  for (let i = 1; i <= 100; i++) { // Limit to 100 days back
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateString = checkDate.toISOString().split('T')[0];
    
    const dayData = checklistData[dateString];
    if (!dayData || Object.values(dayData).filter(v => v === true).length === 0) {
      break; // Break on first day with no completed items
    }
    
    currentStreak++;
  }
  
  // Update the UI
  streakCount.textContent = currentStreak;
  floatingStreakCount.textContent = currentStreak;
  
  // Check for milestone streak achievements and display special messages
  const milestoneMessage = milestoneMessages.streaks[currentStreak];
  if (milestoneMessage) {
    streakMessage.textContent = milestoneMessage;
    // Also show as an easter egg for important milestones
    if ([7, 30, 100, 365].includes(currentStreak)) {
      showEasterEgg(milestoneMessage);
    }
  } else {
    // Default messages when not at specific milestone
    if (currentStreak === 0) {
      streakMessage.textContent = "Today's a great day to start taking care of yourself.";
    } else if (currentStreak < 3) {
      streakMessage.textContent = "You're getting started! Keep it up.";
    } else if (currentStreak < 7) {
      streakMessage.textContent = "You're building momentum! Your kidneys thank you.";
    } else if (currentStreak < 14) {
      streakMessage.textContent = "Over a week of consistent care - that's impressive!";
    } else if (currentStreak < 30) {
      streakMessage.textContent = "Several weeks strong! You're making real changes that matter.";
    } else if (currentStreak < 60) {
      streakMessage.textContent = "Over a month of daily care - your body notices the difference.";
    } else if (currentStreak < 90) {
      streakMessage.textContent = "Almost three months of this new habit. That's real commitment.";
    } else {
      streakMessage.textContent = "What an incredible streak! Your consistency is inspiring.";
    }
  }
}

// Accessibility Controls
function initAccessibilityControls() {
  // Text size controls
  increaseTextBtn.addEventListener('click', function() {
    if (currentFontSize < 28) { // Max size limit
      currentFontSize += 2;
      document.documentElement.style.setProperty('--text-size-base', `${currentFontSize}px`);
      localStorage.setItem('fontSizePreference', currentFontSize);
    }
  });
  
  decreaseTextBtn.addEventListener('click', function() {
    if (currentFontSize > 16) { // Min size limit
      currentFontSize -= 2;
      document.documentElement.style.setProperty('--text-size-base', `${currentFontSize}px`);
      localStorage.setItem('fontSizePreference', currentFontSize);
    }
  });
  
  // Read aloud functionality
  readAloudBtn.addEventListener('click', function() {
    if (isReading) return;
    
    // Stop any current speech
    speechSynthesis.cancel();
    
    // Collect content from visible sections
    let textToRead = [];
    
    document.querySelectorAll('.content-section:not(.card-collapsed) .card-content').forEach(content => {
      textToRead.push(content.textContent);
    });
    
    // Join collected text
    const fullText = textToRead.join(' ');
    
    // If no visible sections, read a message
    if (fullText.trim() === '') {
      const message = "Please open a section to read its content aloud.";
      currentUtterance = new SpeechSynthesisUtterance(message);
      speechSynthesis.speak(currentUtterance);
      return;
    }
    
    // Create and configure utterance
    currentUtterance = new SpeechSynthesisUtterance(fullText);
    currentUtterance.rate = 0.9; // Slightly slower
    currentUtterance.pitch = 1;
    
    // Get available voices and select a good one
    let voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Try to find a male voice
      const maleVoice = voices.find(voice => 
        voice.name.includes('Male') || 
        voice.name.includes('David') || 
        voice.name.includes('Tom') ||
        voice.name.includes('Mark')
      );
      
      if (maleVoice) {
        currentUtterance.voice = maleVoice;
      }
    }
    
    // Add events
    currentUtterance.onstart = function() {
      isReading = true;
      readAloudBtn.style.display = 'none';
      stopReadingBtn.style.display = 'inline-block';
    };
    
    currentUtterance.onend = function() {
      isReading = false;
      readAloudBtn.style.display = 'inline-block';
      stopReadingBtn.style.display = 'none';
    };
    
    // Start speaking
    speechSynthesis.speak(currentUtterance);
  });
  
  stopReadingBtn.addEventListener('click', function() {
    speechSynthesis.cancel();
    isReading = false;
    readAloudBtn.style.display = 'inline-block';
    stopReadingBtn.style.display = 'none';
  });
  
  // Initially hide stop button
  stopReadingBtn.style.display = 'none';
}

// Add active section tracking for better UI feedback
document.addEventListener('scroll', function() {
  const sections = document.querySelectorAll('.content-section');
  let currentActiveSection = null;
  let smallestDistance = Infinity;
  
  sections.forEach(section => {
    // Skip collapsed sections
    if (section.classList.contains('card-collapsed')) return;
    
    const rect = section.getBoundingClientRect();
    const distance = Math.abs(rect.top);
    
    if (distance < smallestDistance) {
      smallestDistance = distance;
      currentActiveSection = section;
    }
    
    // Remove active class from all sections
    section.classList.remove('active-section');
  });
  
  // Add active class to the current section
  if (currentActiveSection) {
    currentActiveSection.classList.add('active-section');
  }
});

// Daily Progress Report
function showDailyProgressReport() {
  const today = new Date().toISOString().split('T')[0];
  const lastViewedDate = localStorage.getItem('lastViewedDate');
  const checklistData = JSON.parse(localStorage.getItem('checklistData') || '{}');

  if (lastViewedDate === today) return; // Already viewed today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];
  const yData = checklistData[yStr];

  if (!yData) return;

  const completed = Object.values(yData).filter(v => v === true).length;
  const total = 5; // adjust if dynamic
  const percent = Math.round((completed / total) * 100);

  const streakData = parseInt(localStorage.getItem('streakCount') || '0');
  
  // Get appropriate message based on completion and streak
  let message = '';
  
  // Check streak milestones first
  if (streakData === 3) {
    message = `"You've got momentum, old man. Three days strong!"`;
  } else if (streakData === 7) {
    message = `"A full week! Your kidneys are starting to feel the difference."`;
  } else if (streakData === 14) {
    message = `"Two weeks of consistency - this is how lasting change happens."`;
  } else if (streakData === 21) {
    message = `"Three weeks in! You've built a real habit now."`;
  } else if (streakData === 30) {
    message = `"A WHOLE MONTH! That's the kind of commitment that moves mountains."`;
  } else if (streakData >= 60 && streakData % 30 === 0) {
    message = `"${streakData} days. Remember how you used to feel compared to now?"`;
  } else {
    // If not a streak milestone, use the completion percentage
    if (percent === 100) {
      message = `"You nailed it yesterday. Your kidneys are smiling today."`;
    } else if (percent >= 60) {
      message = `"More than halfway. Today's a chance to top that."`;
    } else {
      message = `"Every day's a reset button. Let's aim higher today."`;
    }
  }

  const report = document.createElement('div');
  report.className = 'quote-box daily-report';
  report.innerHTML = `
    <span class="close-report" title="Close this message">&times;</span>
    <strong>Yesterday's Progress</strong><br>
    ✅ ${completed} of ${total} tasks completed<br>
    🔁 Current streak: <strong>${streakData} days</strong><br><br>
    <em>${message}</em>
  `;

  document.querySelector('main').prepend(report);
  localStorage.setItem('lastViewedDate', today);
  
  // Add close button functionality
  const closeButton = report.querySelector('.close-report');
  closeButton.addEventListener('click', () => {
    report.style.opacity = '0';
    report.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      if (report.parentNode) report.parentNode.removeChild(report);
    }, 500);
  });
  
  // Auto-hide after 30 seconds
  setTimeout(() => {
    if (report.parentNode) {
      report.style.opacity = '0';
      report.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        if (report.parentNode) report.parentNode.removeChild(report);
      }, 500);
    }
  }, 30000);
}

// Medication Reminder Functions
function loadMedicationReminders() {
  const savedReminders = localStorage.getItem('medicationReminders');
  
  if (savedReminders) {
    medicationReminders = JSON.parse(savedReminders);
  } else {
    // Default empty state
    medicationReminders = [];
    localStorage.setItem('medicationReminders', JSON.stringify(medicationReminders));
  }
}

function saveMedicationReminders() {
  localStorage.setItem('medicationReminders', JSON.stringify(medicationReminders));
}

function setupMedicationUI() {
  if (!medicationSection) return;
  
  const medicationContent = medicationSection.querySelector('.card-content');
  
  // Generate the medication UI
  medicationContent.innerHTML = `
    <p class="subtitle">Keep track of your medications and get timely reminders.</p>
    
    <div class="medication-list">
      <div id="medication-items">
        <!-- Populated via JS -->
      </div>
      
      <div class="add-medication">
        <h3>Add New Medication</h3>
        <div class="medication-form">
          <div class="form-group">
            <label for="med-name">Medication Name:</label>
            <input type="text" id="med-name" placeholder="e.g., Blood Pressure Pills">
          </div>
          
          <div class="form-group">
            <label for="med-time">Reminder Time:</label>
            <input type="time" id="med-time" value="08:00">
          </div>
          
          <div class="form-group">
            <label for="med-dosage">Dosage:</label>
            <input type="text" id="med-dosage" placeholder="e.g., 1 pill">
          </div>
          
          <button id="add-medication-btn" class="medication-btn">
            <i class="fas fa-plus"></i> Add Medication
          </button>
        </div>
      </div>
    </div>
    
    <div class="notification-permission" id="notification-permission">
      <p><i class="fas fa-bell"></i> Enable notifications to get medication reminders</p>
      <button id="enable-notifications" class="medication-btn">Enable Notifications</button>
    </div>
    
    <div class="quote-box">
      "The best medicine won't work if you don't take it consistently."
    </div>
  `;
  
  // Add event listeners
  const addMedicationBtn = document.getElementById('add-medication-btn');
  const enableNotificationsBtn = document.getElementById('enable-notifications');
  
  if (addMedicationBtn) {
    addMedicationBtn.addEventListener('click', addNewMedication);
  }
  
  if (enableNotificationsBtn) {
    enableNotificationsBtn.addEventListener('click', requestNotificationPermission);
  }
  
  // Check notification permission status
  updateNotificationPermissionUI();
  
  // Populate medication items
  renderMedicationItems();
}

function renderMedicationItems() {
  const medicationItemsContainer = document.getElementById('medication-items');
  if (!medicationItemsContainer) return;
  
  if (medicationReminders.length === 0) {
    medicationItemsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-pills"></i>
        <p>No medications added yet.</p>
      </div>
    `;
    return;
  }
  
  let itemsHTML = '';
  
  medicationReminders.forEach((med, index) => {
    const takenToday = isMedicationTakenToday(med);
    
    itemsHTML += `
      <div class="medication-item ${takenToday ? 'taken' : ''}">
        <div class="med-info">
          <h4>${med.name}</h4>
          <p><i class="fas fa-clock"></i> ${formatTime(med.time)}</p>
          <p><i class="fas fa-prescription-bottle"></i> ${med.dosage}</p>
        </div>
        <div class="med-actions">
          <button class="med-taken-btn" data-index="${index}" ${takenToday ? 'disabled' : ''}>
            <i class="fas ${takenToday ? 'fa-check-circle' : 'fa-circle'}"></i> 
            ${takenToday ? 'Taken' : 'Mark Taken'}
          </button>
          <button class="med-delete-btn" data-index="${index}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });
  
  medicationItemsContainer.innerHTML = itemsHTML;
  
  // Add event listeners
  document.querySelectorAll('.med-taken-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      markMedicationTaken(index);
    });
  });
  
  document.querySelectorAll('.med-delete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      deleteMedication(index);
    });
  });
}

function addNewMedication() {
  const nameInput = document.getElementById('med-name');
  const timeInput = document.getElementById('med-time');
  const dosageInput = document.getElementById('med-dosage');
  
  // Validate inputs
  if (!nameInput.value.trim()) {
    nameInput.focus();
    return;
  }
  
  // Create new medication reminder
  const newMedication = {
    name: nameInput.value.trim(),
    time: timeInput.value,
    dosage: dosageInput.value.trim() || '1 dose',
    takenDates: []
  };
  
  // Add to reminders array
  medicationReminders.push(newMedication);
  
  // Save to localStorage
  saveMedicationReminders();
  
  // Clear form
  nameInput.value = '';
  dosageInput.value = '';
  
  // Update UI
  renderMedicationItems();
  
  // Set up notification for this medication
  scheduleNotification(newMedication);
  
  // Show confirmation message
  showEasterEgg("Medication reminder added. We'll help you remember.");
}

function markMedicationTaken(index) {
  const today = new Date().toISOString().split('T')[0];
  
  // Add today to the taken dates for this med
  if (!medicationReminders[index].takenDates) {
    medicationReminders[index].takenDates = [];
  }
  
  if (!medicationReminders[index].takenDates.includes(today)) {
    medicationReminders[index].takenDates.push(today);
  }
  
  // Save and update UI
  saveMedicationReminders();
  renderMedicationItems();
  
  // Show confirmation
  showEasterEgg("Medication marked as taken. Good job keeping on track!");
}

function deleteMedication(index) {
  // Ask for confirmation
  if (confirm("Are you sure you want to delete this medication reminder?")) {
    medicationReminders.splice(index, 1);
    saveMedicationReminders();
    renderMedicationItems();
  }
}

function isMedicationTakenToday(medication) {
  const today = new Date().toISOString().split('T')[0];
  return medication.takenDates && medication.takenDates.includes(today);
}

function formatTime(timeString) {
  try {
    const [hours, minutes] = timeString.split(':');
    let period = 'AM';
    let hour = parseInt(hours);
    
    if (hour >= 12) {
      period = 'PM';
      if (hour > 12) hour -= 12;
    }
    
    if (hour === 0) hour = 12;
    
    return `${hour}:${minutes} ${period}`;
  } catch (e) {
    return timeString;
  }
}

function requestNotificationPermission() {
  if (!('Notification' in window)) {
    alert('This browser does not support notifications');
    return;
  }
  
  Notification.requestPermission().then(permission => {
    updateNotificationPermissionUI();
    
    if (permission === 'granted') {
      // Schedule notifications for existing medications
      medicationReminders.forEach(med => {
        scheduleNotification(med);
      });
      
      // Show confirmation
      showEasterEgg("Notifications enabled. We'll remind you when it's time to take your medicine.");
    }
  });
}

function updateNotificationPermissionUI() {
  const permissionContainer = document.getElementById('notification-permission');
  
  if (!permissionContainer) return;
  
  if (!('Notification' in window)) {
    permissionContainer.innerHTML = '<p>Your browser does not support notifications</p>';
    return;
  }
  
  if (Notification.permission === 'granted') {
    permissionContainer.innerHTML = '<p><i class="fas fa-check-circle"></i> Notifications are enabled</p>';
  }
}

function scheduleNotification(medication) {
  if (Notification.permission !== 'granted') return;
  
  // Calculate when to send notification based on time
  const now = new Date();
  const [hours, minutes] = medication.time.split(':');
  
  const notificationTime = new Date();
  notificationTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  // If the time is already past for today, don't schedule
  if (notificationTime < now) return;
  
  // Calculate delay
  const delay = notificationTime.getTime() - now.getTime();
  
  // Set timeout for notification
  setTimeout(() => {
    // Check if already taken before showing notification
    if (!isMedicationTakenToday(medication)) {
      showMedicationNotification(medication);
    }
  }, delay);
}

function showMedicationNotification(medication) {
  if (Notification.permission !== 'granted') return;
  
  const notification = new Notification('Medication Reminder', {
    body: `Time to take your ${medication.name} (${medication.dosage})`,
    icon: './assets/icon-192.png'
  });
  
  notification.onclick = function() {
    window.focus();
    notification.close();
  };
}

function checkMedicationReminders() {
  // Schedule checks for today's medications
  medicationReminders.forEach(med => {
    scheduleNotification(med);
  });
  
  // Also set up check for tomorrow (at midnight)
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const delay = tomorrow.getTime() - now.getTime();
  
  setTimeout(() => {
    // Re-check all medications for the new day
    checkMedicationReminders();
  }, delay);
}

// Lab Results Tracking
let labResults = [];

// Initialize lab results tracking
function initializeLabResults() {
  loadLabResults();
  setupLabResultsUI();
  renderLabChart();
}

// Load lab results from localStorage
function loadLabResults() {
  const savedResults = localStorage.getItem('labResults');
  
  if (savedResults) {
    labResults = JSON.parse(savedResults);
  } else {
    // Default with a sample starting point
    labResults = [
      {
        date: '2023-11-15',
        creatinine: 2.62,
        egfr: 28,
        notes: 'Starting values from doctor'
      }
    ];
    saveLabResults();
  }
}

// Save lab results to localStorage
function saveLabResults() {
  localStorage.setItem('labResults', JSON.stringify(labResults));
}

// Set up lab results UI
function setupLabResultsUI() {
  const labResultsSection = document.getElementById('lab-results-section');
  if (!labResultsSection) return;
  
  const labContent = labResultsSection.querySelector('.card-content');
  
  labContent.innerHTML = `
    <p class="subtitle">Track your kidney function lab results to see your progress over time.</p>
    
    <div class="lab-chart-container">
      <h3>Your Creatinine Trend</h3>
      <div class="lab-chart" id="lab-chart"></div>
      <p class="chart-note">Lower numbers show improvement. Your starting creatinine was 2.62 mg/dL.</p>
    </div>
    
    <div class="lab-list">
      <h3>Your Lab History</h3>
      <div id="lab-history">
        <!-- Populated via JS -->
      </div>
    </div>
    
    <div class="add-lab">
      <h3>Add New Lab Results</h3>
      <div class="lab-form">
        <div class="form-group">
          <label for="lab-date">Test Date:</label>
          <input type="date" id="lab-date" value="${new Date().toISOString().split('T')[0]}">
        </div>
        
        <div class="form-group">
          <label for="creatinine">Creatinine (mg/dL):</label>
          <input type="number" id="creatinine" step="0.01" min="0.1" max="10" placeholder="e.g., 2.62">
        </div>
        
        <div class="form-group">
          <label for="egfr">eGFR (if available):</label>
          <input type="number" id="egfr" step="1" min="1" max="120" placeholder="e.g., 28">
        </div>
        
        <div class="form-group">
          <label for="lab-notes">Notes:</label>
          <textarea id="lab-notes" rows="2" placeholder="Any other notes about this test"></textarea>
        </div>
        
        <button id="add-lab-btn" class="lab-btn">
          <i class="fas fa-plus"></i> Add Lab Results
        </button>
      </div>
    </div>
    
    <div class="quote-box">
      <p>"Keep tracking your numbers. They're the scoreboard for all your good work."</p>
    </div>
  `;
  
  // Add event listeners
  const addLabBtn = document.getElementById('add-lab-btn');
  
  if (addLabBtn) {
    addLabBtn.addEventListener('click', addNewLabResult);
  }
  
  // Render lab history
  renderLabHistory();
}

// Render lab history table
function renderLabHistory() {
  const labHistoryContainer = document.getElementById('lab-history');
  if (!labHistoryContainer) return;
  
  if (labResults.length === 0) {
    labHistoryContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-vial"></i>
        <p>No lab results added yet.</p>
      </div>
    `;
    return;
  }
  
  // Create a table
  let tableHTML = `
    <table class="lab-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Creatinine</th>
          <th>eGFR</th>
          <th>Notes</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
  `;
  
  // Sort by date descending (newest first)
  const sortedResults = [...labResults].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  sortedResults.forEach((result, index) => {
    // Check if values have improved from previous test
    const isImproved = index < sortedResults.length - 1 && 
                      result.creatinine < sortedResults[index + 1].creatinine;
    
    const improvedClass = isImproved ? 'improved' : '';
    
    tableHTML += `
      <tr class="${improvedClass}">
        <td>${formatDate(result.date)}</td>
        <td>${result.creatinine} mg/dL</td>
        <td>${result.egfr || '-'}</td>
        <td>${result.notes || '-'}</td>
        <td>
          <button class="lab-delete-btn" data-index="${labResults.indexOf(result)}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
  
  tableHTML += `
      </tbody>
    </table>
  `;
  
  labHistoryContainer.innerHTML = tableHTML;
  
  // Add event listeners to delete buttons
  document.querySelectorAll('.lab-delete-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      deleteLabResult(index);
    });
  });
}

// Chart rendering for lab results trend
function renderLabChart() {
  const chartContainer = document.getElementById('lab-chart');
  if (!chartContainer) return;
  
  chartContainer.innerHTML = '';
  
  if (labResults.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-chart';
    emptyMessage.textContent = 'No lab results available yet. Add your first result to start tracking.';
    chartContainer.appendChild(emptyMessage);
    return;
  }
  
  // Clone the array to avoid modifying original data
  const sortedResults = [...labResults].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // SVG setup
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  const chartWidth = sortedResults.length * 100;
  const chartHeight = 200;
  const padding = 40;
  const pointRadius = 5;
  
  svg.setAttribute("width", chartWidth);
  svg.setAttribute("height", chartHeight);
  svg.setAttribute("viewBox", `0 0 ${chartWidth} ${chartHeight}`);
  
  // Create path for the line
  const path = document.createElementNS(svgNS, "path");
  let pathData = "";
  
  // Get min and max values to scale the chart
  const values = sortedResults.map(r => parseFloat(r.creatinine) || 0);
  const maxValue = Math.max(...values, 1.2) * 1.2; // Always include the goal (1.2) in the scale
  
  // Plot points and generate path
  sortedResults.forEach((result, index) => {
    // Ensure the creatinine value is a valid number
    const creatinineValue = parseFloat(result.creatinine);
    if (isNaN(creatinineValue)) {
      console.warn(`Invalid creatinine value for entry dated ${result.date}`);
      return; // Skip this point
    }
    
    // Calculate coordinates
    const x = index * 100 + 50;
    // Map the creatinine value to the chart height (inverted, since SVG y increases downward)
    const y = chartHeight - padding - ((creatinineValue / maxValue) * (chartHeight - (padding * 2)));
    
    // Ensure y is a valid number before using it
    if (isNaN(y)) {
      console.warn(`Calculated NaN y value for creatinine: ${creatinineValue}, maxValue: ${maxValue}`);
      return; // Skip this point
    }
    
    // Add to path
    if (index === 0) {
      pathData = `M ${x} ${y}`;
    } else {
      pathData += ` L ${x} ${y}`;
    }
    
    // Create circle for point
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", pointRadius);
    circle.setAttribute("class", "chart-point");
    
    // Create date label
    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", x);
    text.setAttribute("y", chartHeight - 5);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("class", "chart-label");
    text.textContent = formatShortDate(result.date);
    
    // Create value label
    const valueText = document.createElementNS(svgNS, "text");
    valueText.setAttribute("x", x);
    valueText.setAttribute("y", y - 15);
    text.setAttribute("text-anchor", "middle");
    valueText.setAttribute("class", "chart-value");
    valueText.textContent = creatinineValue.toFixed(2);
    
    svg.appendChild(circle);
    svg.appendChild(text);
    svg.appendChild(valueText);
  });
  
  // Only set the path if we have valid data
  if (pathData) {
    path.setAttribute("d", pathData);
    path.setAttribute("class", "chart-line");
    path.setAttribute("fill", "none");
    
    // Add line before points so points appear on top
    svg.insertBefore(path, svg.firstChild);
    
    // Add goal line if we have a target
    const goalLine = document.createElementNS(svgNS, "line");
    const goalY = chartHeight - padding - ((1.2 / maxValue) * (chartHeight - (padding * 2)));
    
    // Only add goal line if y value is valid
    if (!isNaN(goalY)) {
      goalLine.setAttribute("x1", "0");
      goalLine.setAttribute("y1", goalY);
      goalLine.setAttribute("x2", chartWidth);
      goalLine.setAttribute("y2", goalY);
      goalLine.setAttribute("class", "goal-line");
      
      const goalText = document.createElementNS(svgNS, "text");
      goalText.setAttribute("x", 10);
      goalText.setAttribute("y", goalY - 5);
      goalText.setAttribute("class", "goal-text");
      goalText.textContent = "Goal: <1.2";
      
      svg.insertBefore(goalLine, svg.firstChild);
      svg.appendChild(goalText);
    }
  }
  
  chartContainer.appendChild(svg);
  
  // Check for improvement and show encouraging message
  if (sortedResults.length >= 2) {
    const latest = sortedResults[sortedResults.length - 1];
    const previous = sortedResults[sortedResults.length - 2];
    
    const latestValue = parseFloat(latest.creatinine);
    const previousValue = parseFloat(previous.creatinine);
    
    // Only show improvement message if values are valid numbers
    if (!isNaN(latestValue) && !isNaN(previousValue) && latestValue < previousValue) {
      const improvement = ((previousValue - latestValue) / previousValue * 100).toFixed(1);
      const message = `Great progress! Your creatinine has improved by ${improvement}% since your last test.`;
      
      const improvementMsg = document.createElement('div');
      improvementMsg.className = 'improvement-message';
      improvementMsg.innerHTML = `<i class="fas fa-trophy"></i> ${message}`;
      
      chartContainer.appendChild(improvementMsg);
      
      // Also show as easter egg
      showEasterEgg(message);
    }
  }
}

// Add new lab result
function addNewLabResult() {
  const dateInput = document.getElementById('lab-date');
  const creatinineInput = document.getElementById('creatinine');
  const egfrInput = document.getElementById('egfr');
  const notesInput = document.getElementById('lab-notes');
  
  // Validate inputs
  if (!dateInput.value || !creatinineInput.value) {
    if (!dateInput.value) dateInput.focus();
    else creatinineInput.focus();
    return;
  }
  
  // Create new lab result
  const newResult = {
    date: dateInput.value,
    creatinine: parseFloat(creatinineInput.value),
    egfr: egfrInput.value ? parseInt(egfrInput.value) : null,
    notes: notesInput.value.trim()
  };
  
  // Add to results array
  labResults.push(newResult);
  
  // Save to localStorage
  saveLabResults();
  
  // Clear form
  creatinineInput.value = '';
  egfrInput.value = '';
  notesInput.value = '';
  
  // Update UI
  renderLabHistory();
  renderLabChart();
  
  // Show confirmation
  showEasterEgg("Lab results saved. Keep up the good work!");
}

// Delete lab result
function deleteLabResult(index) {
  if (confirm("Are you sure you want to delete this lab result?")) {
    labResults.splice(index, 1);
    saveLabResults();
    renderLabHistory();
    renderLabChart();
  }
}

// Format date for display
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format short date for chart labels
function formatShortDate(dateString) {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// Progress chart functionality moved from inline script
function initializeProgressChart() {
  const weeklyChart = document.getElementById('weekly-chart');
  if (!weeklyChart) return;
  
  const checklistData = JSON.parse(localStorage.getItem('checklistData') || '{}');
  const today = new Date();
  
  // Clear existing content
  weeklyChart.innerHTML = '';
  
  // Generate bars for the past 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    const dayData = checklistData[dateString] || {};
    
    // Calculate completion percentage
    const totalItems = 5; // Same as our checklist items
    const completedItems = Object.values(dayData).filter(v => v === true).length;
    const percentage = Math.min(100, (completedItems / totalItems) * 100);
    
    // Create the bar
    const barContainer = document.createElement('div');
    barContainer.style.position = 'absolute';
    barContainer.style.left = `${(6-i) * 14 + 2}%`;
    barContainer.style.bottom = '0';
    barContainer.style.width = '10%';
    barContainer.style.textAlign = 'center';
    
    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    bar.style.height = `${percentage}%`;
    bar.style.maxHeight = '160px';
    bar.style.left = '50%';
    bar.style.transform = 'translateX(-50%)';
    bar.style.backgroundColor = percentage === 100 ? 'var(--success-color)' : 'var(--accent-color)';
    
    // Create day label
    const label = document.createElement('div');
    label.className = 'chart-label';
    label.style.width = '100%';
    label.textContent = date.getDate() + '/' + (date.getMonth() + 1);
    
    barContainer.appendChild(bar);
    barContainer.appendChild(label);
    weeklyChart.appendChild(barContainer);
  }
}

// Shopping filters functionality moved from inline script
function initializeShoppingFilters() {
  const showMiller = document.getElementById('show-miller');
  const showPharmacy = document.getElementById('show-pharmacy');
  const showDollar = document.getElementById('show-dollar');
  const showAll = document.getElementById('show-all');
  
  if (!showMiller || !showPharmacy || !showDollar || !showAll) return;
  
  const millerItems = document.querySelectorAll('.miller');
  const pharmacyItems = document.querySelectorAll('.pharmacy');
  const dollarItems = document.querySelectorAll('.dollar');
  const allItems = document.querySelectorAll('.shopping-table tbody tr');
  
  showMiller.addEventListener('click', function() {
    allItems.forEach(item => {
      item.style.display = 'none';
    });
    millerItems.forEach(item => {
      item.style.display = '';
    });
    highlightActiveButton(this);
  });
  
  showPharmacy.addEventListener('click', function() {
    allItems.forEach(item => {
      item.style.display = 'none';
    });
    pharmacyItems.forEach(item => {
      item.style.display = '';
    });
    highlightActiveButton(this);
  });
  
  showDollar.addEventListener('click', function() {
    allItems.forEach(item => {
      item.style.display = 'none';
    });
    dollarItems.forEach(item => {
      item.style.display = '';
    });
    highlightActiveButton(this);
  });
  
  showAll.addEventListener('click', function() {
    allItems.forEach(item => {
      item.style.display = '';
    });
    highlightActiveButton(this);
  });
  
  // Initially highlight "Show All" as active
  highlightActiveButton(showAll);
}

function highlightActiveButton(activeButton) {
  if (!activeButton) return;
  
  const allButtons = [
    document.getElementById('show-miller'),
    document.getElementById('show-pharmacy'),
    document.getElementById('show-dollar'),
    document.getElementById('show-all')
  ].filter(btn => btn); // Filter out any null elements
  
  allButtons.forEach(button => {
    button.classList.remove('shopping-button-active');
    if (button === activeButton) {
      button.classList.add('shopping-button-active');
    }
  });
}

// Achievements functionality moved from inline script
function initializeAchievements() {
  const achievementsContainer = document.getElementById('achievements-container');
  if (!achievementsContainer) return;
  
  const achievements = [
    { id: 'first-day', name: 'First Steps', icon: 'fa-shoe-prints', requirement: 'Complete your first day', unlocked: false },
    { id: 'three-day', name: 'Building Habits', icon: 'fa-seedling', requirement: '3 day streak', unlocked: false },
    { id: 'week-streak', name: 'Steady Progress', icon: 'fa-fire', requirement: '7 day streak', unlocked: false },
    { id: 'two-week', name: 'Committed', icon: 'fa-calendar-check', requirement: '14 day streak', unlocked: false },
    { id: 'month-streak', name: 'New Lifestyle', icon: 'fa-medal', requirement: '30 day streak', unlocked: false },
    { id: 'perfect-week', name: 'Perfect Week', icon: 'fa-star', requirement: 'Complete all tasks for 7 days straight', unlocked: false }
  ];
  
  // Get user streak and completed days
  const streak = parseInt(document.getElementById('streak-count')?.textContent || '0');
  const checklistData = JSON.parse(localStorage.getItem('checklistData') || '{}');
  
  // Count days with at least one completed task
  const completedDays = Object.keys(checklistData).filter(date => {
    return Object.values(checklistData[date]).filter(v => v === true).length > 0;
  }).length;
  
  // Determine which achievements are unlocked
  let unlockedAchievements = [];
  
  if (completedDays >= 1) achievements[0].unlocked = true;
  if (streak >= 3) achievements[1].unlocked = true;
  if (streak >= 7) achievements[2].unlocked = true;
  if (streak >= 14) achievements[3].unlocked = true;
  if (streak >= 30) achievements[4].unlocked = true;
  
  // Check for perfect week
  let perfectWeek = true;
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    const dayData = checklistData[dateString] || {};
    const completed = Object.values(dayData).filter(v => v === true).length;
    
    if (completed < 5) { // 5 is the total checklist items
      perfectWeek = false;
      break;
    }
  }
  if (perfectWeek) achievements[5].unlocked = true;
  
  // Generate achievements HTML
  achievementsContainer.innerHTML = '';
  
  achievements.forEach(achievement => {
    const item = document.createElement('div');
    item.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;
    item.innerHTML = `
      <i class="fas ${achievement.icon}"></i>
      <div>
        <strong>${achievement.name}</strong>
        <div>${achievement.requirement}</div>
      </div>
    `;
    achievementsContainer.appendChild(item);
    
    // Store unlocked achievements for potential display
    if (achievement.unlocked) {
      unlockedAchievements.push(achievement);
    }
  });
  
  // Save achievements state
  const savedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
  
  // Check for newly unlocked achievements
  const newlyUnlocked = unlockedAchievements.filter(a => !savedAchievements.includes(a.id));
  
  // If there's a new achievement, show the badge
  if (newlyUnlocked.length > 0) {
    const firstNew = newlyUnlocked[0];
    
    // Update achievement badge and show it
    const badge = document.getElementById('achievement-badge');
    if (badge) {
      const badgeText = document.getElementById('achievement-text');
      const badgeIcon = badge.querySelector('.icon-container i');
      
      if (badgeIcon) badgeIcon.className = `fas ${firstNew.icon}`;
      if (badgeText) badgeText.textContent = `${firstNew.name}: ${firstNew.requirement}`;
      
      setTimeout(() => {
        badge.classList.add('show');
        
        // Hide after 5 seconds
        setTimeout(() => {
          badge.classList.remove('show');
        }, 5000);
      }, 1000);
      
      // Save that we've shown this achievement
      savedAchievements.push(firstNew.id);
      localStorage.setItem('unlockedAchievements', JSON.stringify(savedAchievements));
    }
  }
}

// Mobile optimizations moved from inline script
function setupMobileOptimizations() {
  // Prevent zooming on double-tap for Samsung browsers
  document.addEventListener('dblclick', function(e) {
    e.preventDefault();
  });
  
  // Add swipe capability for card toggling
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => {
    let touchStartY;
    let touchEndY;
    
    section.addEventListener('touchstart', function(e) {
      touchStartY = e.changedTouches[0].screenY;
    }, {passive: true});
    
    section.addEventListener('touchend', function(e) {
      touchEndY = e.changedTouches[0].screenY;
      const diff = touchStartY - touchEndY;
      
      // If swipe distance is significant
      if (Math.abs(diff) > 30) {
        const header = section.querySelector('.card-header');
        const toggle = header.querySelector('.card-toggle');
        
        // Swipe up to close, swipe down to open
        if ((diff > 0 && section.classList.contains('expanded')) || 
            (diff < 0 && !section.classList.contains('expanded'))) {
          toggle.click();
        }
      }
    }, {passive: true});
  });
  
  // Add vibration feedback for completed tasks
  const checkItems = document.querySelectorAll('.checklist-item input');
  checkItems.forEach(item => {
    item.addEventListener('change', function() {
      if (this.checked && 'vibrate' in navigator) {
        navigator.vibrate(50); // Short vibration feedback
      }
    });
  });
  
  // Enable 'Add to Home Screen' instruction after 3 visits
  const visitCount = parseInt(localStorage.getItem('visitCount') || '0') + 1;
  localStorage.setItem('visitCount', visitCount.toString());
  
  if (visitCount === 3) {
    // Show Add to Home Screen guidance for Samsung browsers
    setTimeout(() => {
      const homePrompt = document.createElement('div');
      homePrompt.className = 'home-screen-prompt';
      homePrompt.innerHTML = `
        <div class="prompt-content">
          <i class="fas fa-mobile-alt"></i>
          <p>Add this app to your home screen for easier access!</p>
          <p class="prompt-instructions">Tap the menu (⋮) then "Add to Home screen"</p>
          <button id="close-prompt">Got it</button>
        </div>
      `;
      document.body.appendChild(homePrompt);
      
      document.getElementById('close-prompt')?.addEventListener('click', function() {
        homePrompt.style.display = 'none';
        localStorage.setItem('homeScreenPromptShown', 'true');
      });
    }, 3000);
  }
  
  // Check if it's a PWA (installed to home screen)
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                window.navigator.standalone;
  
  if (isPWA) {
    // If running as installed app, make minor UI adjustments
    document.body.classList.add('pwa-mode');
  }
}

// Register service worker with security check
function registerServiceWorker() {
  // Check if we're in a secure context (https:// or localhost)
  const isSecureContext = window.isSecureContext || 
                          location.protocol === 'https:' || 
                          location.hostname === 'localhost' ||
                          location.hostname === '127.0.0.1';
  
  // Only register service worker in secure contexts
  if ('serviceWorker' in navigator && isSecureContext) {
    navigator.serviceWorker.register('service-worker.js')
      .then(function(registration) {
        console.log('Service worker registered successfully');
      })
      .catch(function(error) {
        console.log('Service worker registration failed:', error);
      });
  } else if ('serviceWorker' in navigator) {
    console.log('Service worker registration skipped: not in a secure context');
  }
}

// Network monitoring moved from inline script
function setupNetworkMonitoring() {
  // Initial check
  if (!navigator.onLine) {
    offlineMessage.classList.add('show');
    document.body.classList.add('offline');
  }
  
  // Listen for online/offline events
  window.addEventListener('online', function() {
    offlineMessage.classList.remove('show');
    document.body.classList.remove('offline');
    
    // Notify service worker
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'NETWORK_STATUS',
        online: true
      });
    }
    
    // Show a temporary "back online" message
    const onlineMessage = document.createElement('div');
    onlineMessage.className = 'offline-indicator';
    onlineMessage.style.backgroundColor = 'var(--success-color)';
    onlineMessage.innerHTML = '<i class="fas fa-wifi"></i> Connected again! Your progress is synced.';
    document.body.appendChild(onlineMessage);
    
    setTimeout(() => {
      onlineMessage.classList.add('show');
      
      setTimeout(() => {
        onlineMessage.classList.remove('show');
        setTimeout(() => onlineMessage.remove(), 300);
      }, 3000);
    }, 100);
  });
  
  window.addEventListener('offline', function() {
    offlineMessage.classList.add('show');
    document.body.classList.add('offline');
    
    // Notify service worker
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'NETWORK_STATUS',
        online: false
      });
    }
  });
  
  // Listen for messages from service worker
  if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'OFFLINE') {
        offlineMessage.classList.add('show');
        document.body.classList.add('offline');
      } else if (event.data && event.data.type === 'ONLINE') {
        offlineMessage.classList.remove('show');
        document.body.classList.remove('offline');
      }
    });
  }
  
  // Add battery-saving mode for Samsung AMOLED screens
  if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
      // If battery level is below 15%, enable battery saving mode
      if (battery.level < 0.15) {
        document.body.classList.add('battery-saving-mode');
      }
      
      // Listen for battery level changes
      battery.addEventListener('levelchange', () => {
        if (battery.level < 0.15) {
          document.body.classList.add('battery-saving-mode');
        } else {
          document.body.classList.remove('battery-saving-mode');
        }
      });
    });
  }
}

// Helper function to safely initialize UI components
function safelyInitialize(elementId, callback) {
  const element = document.getElementById(elementId);
  if (element) {
    callback(element);
    return true;
  }
  return false;
}

// Update initial progress bar width
function updateInitialProgressBar() {
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    const today = new Date().toISOString().split('T')[0];
    const checklistData = JSON.parse(localStorage.getItem('checklistData') || '{}');
    const todayData = checklistData[today] || {};
    
    // Count completed items
    const completed = Object.values(todayData).filter(value => value === true).length;
    const total = document.querySelectorAll('#checklist-container .checklist-item').length || 5;
    
    // Update progress bar
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    progressBar.style.width = `${percentage}%`;
  }
}