// Voice Enhancement for Pops
// This script improves the text-to-speech experience with better male voices

(function() {
  // Store the selected voice
  let selectedVoice = null;
  
  // Setup when the document is ready
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize voice selection
    initVoiceSelection();
    
    // Override the read-aloud button after a small delay
    // to ensure the main script has initialized
    setTimeout(enhanceReadAloudButton, 1000);
  });
  
  // Initialize the voice selection process
  function initVoiceSelection() {
    if (window.speechSynthesis) {
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = selectBestVoice;
      } else {
        selectBestVoice();
      }
    }
  }
  
  // Select the best available male voice
  function selectBestVoice() {
    const voices = window.speechSynthesis.getVoices();
    
    // Priority list of preferred male voices
    const priorityList = [
      'Google US English',
      'Samsung US English Male',
      'en-US-Wavenet-D',
      'Microsoft David Desktop'
    ];
    
    // Try exact matches first
    for (let name of priorityList) {
      const match = voices.find(v => v.name === name);
      if (match) {
        selectedVoice = match;
        console.log('Selected voice: ' + match.name);
        return;
      }
    }
    
    // If no exact match, try to find a male-sounding voice
    const maleVoice = voices.find(voice => 
      voice.name.includes('Male') || 
      voice.name.includes('David') || 
      voice.name.includes('Tom') ||
      voice.name.includes('Mark')
    );
    
    if (maleVoice) {
      selectedVoice = maleVoice;
      console.log('Selected fallback male voice: ' + maleVoice.name);
      return;
    }
    
    // Last resort: just pick the first English voice
    const englishVoice = voices.find(voice => 
      voice.lang.includes('en-')
    );
    
    if (englishVoice) {
      selectedVoice = englishVoice;
      console.log('Selected English fallback voice: ' + englishVoice.name);
    }
  }
  
  // Enhance the read-aloud button to use our selected voice
  function enhanceReadAloudButton() {
    const readAloudBtn = document.getElementById('read-aloud');
    const stopReadingBtn = document.getElementById('stop-reading');
    
    if (readAloudBtn && selectedVoice) {
      // Store the original click handler
      const originalClickHandler = readAloudBtn.onclick;
      
      // Replace with our enhanced handler
      readAloudBtn.onclick = function() {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
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
          speakText(message);
          return;
        }
        
        // Read the text
        speakText(fullText);
      };
    }
  }
  
  // Function to speak text with the selected voice
  function speakText(text) {
    // Create and configure utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for better comprehension
    utterance.pitch = 1;
    
    // Apply our selected voice
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Visual feedback
    const readAloudBtn = document.getElementById('read-aloud');
    const stopReadingBtn = document.getElementById('stop-reading');
    
    // Add events for button state management
    utterance.onstart = function() {
      if (readAloudBtn) readAloudBtn.style.display = 'none';
      if (stopReadingBtn) stopReadingBtn.style.display = 'inline-block';
    };
    
    utterance.onend = function() {
      if (readAloudBtn) readAloudBtn.style.display = 'inline-block';
      if (stopReadingBtn) stopReadingBtn.style.display = 'none';
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  }
})(); 