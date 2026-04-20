// Get DOM elements
const resumeUpload = document.getElementById('resume-upload');
const resumeStatus = document.getElementById('resume-status');
const uploadSection = document.getElementById('upload-section');
const analyzeBtn = document.getElementById('analyze-btn');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const error = document.getElementById('error');
const info = document.getElementById('info');

// Check if resume is already stored
chrome.storage.local.get(['resumeText'], (result) => {
  if (result.resumeText) {
    resumeStatus.style.display = 'block';
    uploadSection.classList.add('has-resume');
    analyzeBtn.disabled = false;
  }
});

// Handle resume upload
resumeUpload.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  try {
    const text = await readFileAsText(file);
    
    // Store resume text in Chrome storage
    chrome.storage.local.set({ resumeText: text }, () => {
      resumeStatus.style.display = 'block';
      uploadSection.classList.add('has-resume');
      analyzeBtn.disabled = false;
      showError('', false);
    });
  } catch (err) {
    showError('Failed to read resume file. Please try again.');
  }
});

// Handle analyze button click
analyzeBtn.addEventListener('click', async () => {
  // Hide previous results/errors
  results.style.display = 'none';
  info.style.display = 'none';
  showError('', false);
  loading.style.display = 'block';
  
  try {
    // Get the current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're on a supported job site
    if (!tab.url.includes('linkedin.com/jobs') && !tab.url.includes('indeed.com')) {
      throw new Error('Please navigate to a LinkedIn or Indeed job posting first');
    }
    
    // Send message to content script to extract job details
    chrome.tabs.sendMessage(tab.id, { action: 'extractJob' }, async (response) => {
      if (chrome.runtime.lastError) {
        throw new Error('Could not extract job details. Please refresh the page and try again.');
      }
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Get stored resume
      chrome.storage.local.get(['resumeText'], async (result) => {
        if (!result.resumeText) {
          throw new Error('Please upload your resume first');
        }
        
        // Send to backend for analysis
        const analysis = await analyzeJob(result.resumeText, response.jobData);
        
        // Display results
        displayResults(analysis);
        loading.style.display = 'none';
        results.style.display = 'block';
      });
    });
  } catch (err) {
    loading.style.display = 'none';
    showError(err.message);
  }
});

// Read file as text
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Call backend API for job analysis
async function analyzeJob(resumeText, jobData) {
  // TODO: Replace with your actual backend URL
  const API_URL = 'http://localhost:8000/analyze';
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      resume: resumeText,
      job: jobData
    })
  });
  
  if (!response.ok) {
    throw new Error('Analysis failed. Please try again.');
  }
  
  return await response.json();
}

// Display analysis results
function displayResults(analysis) {
  // Set match score
  document.getElementById('match-score').textContent = analysis.matchScore + '%';
  
  // Set color based on score
  const scoreElement = document.getElementById('match-score');
  if (analysis.matchScore >= 80) {
    scoreElement.style.color = '#4CAF50';
  } else if (analysis.matchScore >= 60) {
    scoreElement.style.color = '#FF9800';
  } else {
    scoreElement.style.color = '#F44336';
  }
  
  // Display matching skills
  const matchingSkillsList = document.getElementById('matching-skills');
  matchingSkillsList.innerHTML = '';
  analysis.matchingSkills.forEach(skill => {
    const li = document.createElement('li');
    li.textContent = skill;
    matchingSkillsList.appendChild(li);
  });
  
  // Display missing skills
  const missingSkillsList = document.getElementById('missing-skills');
  missingSkillsList.innerHTML = '';
  analysis.missingSkills.forEach(skill => {
    const li = document.createElement('li');
    li.textContent = skill;
    missingSkillsList.appendChild(li);
  });
  
  // Display recommendations
  const recommendationsList = document.getElementById('recommendations');
  recommendationsList.innerHTML = '';
  analysis.recommendations.forEach(rec => {
    const li = document.createElement('li');
    li.textContent = rec;
    recommendationsList.appendChild(li);
  });
}

// Show error message
function showError(message, show = true) {
  if (show && message) {
    error.textContent = message;
    error.style.display = 'block';
  } else {
    error.style.display = 'none';
  }
}
