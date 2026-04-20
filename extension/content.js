// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJob') {
    try {
      const jobData = extractJobData();
      sendResponse({ jobData });
    } catch (error) {
      sendResponse({ error: error.message });
    }
  }
  return true; // Keep the message channel open for async response
});

function extractJobData() {
  const currentUrl = window.location.href;
  
  if (currentUrl.includes('linkedin.com/jobs')) {
    return extractLinkedInJob();
  } else if (currentUrl.includes('indeed.com')) {
    return extractIndeedJob();
  } else {
    throw new Error('Unsupported job site');
  }
}

function extractLinkedInJob() {
  // LinkedIn job posting selectors (these may change over time)
  const jobTitle = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title')?.textContent?.trim() || '';
  
  const company = document.querySelector('.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name')?.textContent?.trim() || '';
  
  const location = document.querySelector('.job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet')?.textContent?.trim() || '';
  
  // Job description - try multiple selectors
  let description = '';
  const descriptionElement = document.querySelector('.jobs-description__content, .jobs-box__html-content, .job-view-layout, article');
  if (descriptionElement) {
    description = descriptionElement.innerText || descriptionElement.textContent || '';
  }
  
  // Extract skills if available
  const skillElements = document.querySelectorAll('.job-details-how-you-match__skills-item-subtitle, .job-details-skill-match-status-list__item');
  const skills = Array.from(skillElements).map(el => el.textContent.trim());
  
  if (!jobTitle || !description) {
    throw new Error('Could not extract job details. Please make sure you\'re viewing a job posting.');
  }
  
  return {
    title: jobTitle,
    company: company,
    location: location,
    description: description,
    skills: skills,
    url: window.location.href,
    source: 'LinkedIn'
  };
}

function extractIndeedJob() {
  // Indeed job posting selectors
  const jobTitle = document.querySelector('.jobsearch-JobInfoHeader-title, h1.icl-u-xs-mb--xs')?.textContent?.trim() || '';
  
  const company = document.querySelector('[data-company-name="true"], .jobsearch-InlineCompanyRating-companyHeader a, .jobsearch-CompanyInfoWithoutHeaderImage a')?.textContent?.trim() || '';
  
  const location = document.querySelector('[data-testid="job-location"], .jobsearch-JobInfoHeader-subtitle > div')?.textContent?.trim() || '';
  
  // Job description
  let description = '';
  const descriptionElement = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText');
  if (descriptionElement) {
    description = descriptionElement.innerText || descriptionElement.textContent || '';
  }
  
  if (!jobTitle || !description) {
    throw new Error('Could not extract job details. Please make sure you\'re viewing a job posting.');
  }
  
  return {
    title: jobTitle,
    company: company,
    location: location,
    description: description,
    skills: [],
    url: window.location.href,
    source: 'Indeed'
  };
}

// Add a subtle indicator that the extension is active (optional)
function addIndicator() {
  if (document.getElementById('job-matcher-indicator')) return;
  
  const indicator = document.createElement('div');
  indicator.id = 'job-matcher-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #667eea;
    color: white;
    padding: 10px 15px;
    border-radius: 20px;
    font-size: 12px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  indicator.textContent = '🎯 Job Matcher Active';
  document.body.appendChild(indicator);
  
  // Remove after 3 seconds
  setTimeout(() => {
    indicator.style.transition = 'opacity 0.5s';
    indicator.style.opacity = '0';
    setTimeout(() => indicator.remove(), 500);
  }, 3000);
}

// Show indicator when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addIndicator);
} else {
  addIndicator();
}
