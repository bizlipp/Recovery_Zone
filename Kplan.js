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

// Card toggle elements
const cardToggles = document.querySelectorAll('.card-toggle');

// State Management
let currentFontSize = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--text-size-base'));
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let isReading = false;
let isDarkMode = false;

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
  populateSections();
  populateChecklist();
  initAccessibilityControls();
  updateStreakCount();
  initCardToggles();
  initDarkModeToggle();
  updateFloatingWidget();
  setupMarkAllDone();
  scheduleRandomEasterEgg();
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
        itemElement.style.backgroundColor = 'rgba(232, 248, 245, 0.5)';
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
        
        itemElement.style.backgroundColor = 'rgba(232, 248, 245, 0.5)';
        setTimeout(() => {
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
