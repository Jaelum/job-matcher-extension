# 📚 Complete Tutorial: Building the Job Match Analyzer

This tutorial explains how each part works and how you can customize it.

## 🎓 Learning Objectives

By the end of this tutorial, you'll understand:
- How Chrome extensions work
- How to scrape web pages with JavaScript
- How to build REST APIs with FastAPI
- How to integrate LLMs into applications
- How to make different parts of an application communicate

---

## Part 1: Understanding Chrome Extensions

### What is a Chrome Extension?

A Chrome extension is a small program that adds functionality to your browser. They're built with HTML, CSS, and JavaScript - the same technologies used for websites!

### Key Components

**1. manifest.json** - The "brain"
- Tells Chrome what your extension does
- Lists permissions it needs
- Defines which scripts run where

**2. Content Scripts** (`content.js`)
- Run on specific web pages (LinkedIn, Indeed)
- Can read and modify page content
- Extract information from the page

**3. Popup** (`popup.html` + `popup.js`)
- The UI that appears when you click the extension icon
- Where users interact with your extension
- Can't directly access page content

**4. Background Scripts** (`background.js`)
- Run in the background
- Handle events and messaging
- Coordinate between different parts

### How They Communicate

```
Website Page
    ↓
Content Script (extracts job data)
    ↓
Popup (receives data, shows to user)
    ↓
Backend API (analyzes with AI)
    ↓
Popup (displays results)
```

---

## Part 2: Content Script Deep Dive

### How `content.js` Works

```javascript
// 1. Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractJob') {
    // 2. Extract data from page
    const jobData = extractJobData();
    // 3. Send back to popup
    sendResponse({ jobData });
  }
});
```

### DOM Scraping Techniques

The key is finding the right "selectors" - CSS patterns that identify elements:

```javascript
// LinkedIn uses classes like 'jobs-unified-top-card__job-title'
const jobTitle = document.querySelector('.jobs-unified-top-card__job-title');

// Get the text content
const title = jobTitle?.textContent?.trim();
```

**Tips for finding selectors:**
1. Right-click element → Inspect
2. Look at the element's classes and IDs
3. Use querySelector to test in Console
4. Have fallbacks in case the page changes

### Handling Different Sites

```javascript
function extractJobData() {
  const url = window.location.href;
  
  if (url.includes('linkedin.com')) {
    return extractLinkedInJob();
  } else if (url.includes('indeed.com')) {
    return extractIndeedJob();
  }
}
```

Each site has different HTML structure, so we need different extraction logic.

---

## Part 3: Popup Interface

### State Management

The popup needs to track several things:
- Is a resume uploaded?
- Is analysis in progress?
- What are the results?

```javascript
// Check if resume exists when popup opens
chrome.storage.local.get(['resumeText'], (result) => {
  if (result.resumeText) {
    // Enable analyze button
    analyzeBtn.disabled = false;
  }
});
```

### Chrome Storage API

```javascript
// Save data
chrome.storage.local.set({ resumeText: text }, () => {
  console.log('Resume saved!');
});

// Retrieve data
chrome.storage.local.get(['resumeText'], (result) => {
  console.log('Resume:', result.resumeText);
});
```

Storage persists even after closing the browser!

### File Reading

```javascript
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
```

This converts PDF/DOC files to plain text.

---

## Part 4: Backend API with FastAPI

### Why FastAPI?

- Fast and modern Python framework
- Automatic API documentation
- Built-in data validation
- Easy async support

### Basic Structure

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.post("/analyze")
def analyze(data: RequestModel):
    # Process data
    return results
```

### Data Models with Pydantic

```python
class JobData(BaseModel):
    title: str
    company: str
    description: str
    # ... more fields
```

Pydantic automatically:
- Validates incoming data
- Converts types
- Provides clear error messages

### CORS Middleware

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_methods=["*"],
    allow_headers=["*"],
)
```

This lets your extension talk to the backend (cross-origin requests).

---

## Part 5: Working with LLMs

### Anthropic Claude API

```python
from anthropic import Anthropic

client = Anthropic(api_key="your-key")

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1000,
    messages=[{"role": "user", "content": "Your prompt here"}]
)

response_text = message.content[0].text
```

### Prompt Engineering

The key to good results is a good prompt:

```python
prompt = f"""You are an expert career counselor.

RESUME:
{resume}

JOB:
{job_description}

Analyze the match and return JSON:
{{
  "matchScore": <0-100>,
  "matchingSkills": [...],
  "missingSkills": [...],
  "recommendations": [...]
}}
"""
```

**Prompt Tips:**
1. Be specific about the role ("You are an expert...")
2. Provide clear input sections
3. Show the exact output format you want
4. Use examples if needed
5. Request JSON for structured data

### Handling JSON Responses

```python
import json

# Clean the response (remove markdown if present)
if response_text.startswith("```json"):
    response_text = response_text.strip("```json").strip("```")

# Parse JSON
data = json.loads(response_text)
```

---

## Part 6: Customization Ideas

### Change the Scoring Algorithm

Modify the prompt to weight different factors:

```python
prompt = f"""
Score based on:
- Technical skills match (40%)
- Experience level match (30%)
- Education requirements (20%)
- Cultural fit indicators (10%)
"""
```

### Add New Features

**1. Save Analysis History**
```javascript
// In popup.js
function saveAnalysis(jobUrl, results) {
  chrome.storage.local.get(['history'], (result) => {
    const history = result.history || [];
    history.push({ url: jobUrl, results, date: new Date() });
    chrome.storage.local.set({ history });
  });
}
```

**2. Generate Cover Letters**
```python
# In backend/main.py
@app.post("/generate-cover-letter")
def generate_cover_letter(request: CoverLetterRequest):
    prompt = f"""Write a cover letter for:
    Resume: {request.resume}
    Job: {request.job_description}
    """
    # Call Claude API
    return cover_letter
```

**3. Multi-job Comparison**
```javascript
// Store multiple jobs
const jobs = [];
jobs.push({ title, company, score, date });
// Show comparison table
```

### Improve the UI

**Add animations:**
```css
.results {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

**Add charts:**
```html
<!-- Use Chart.js -->
<canvas id="skillsChart"></canvas>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

---

## Part 7: Deployment

### Deploying the Backend

**Option 1: Heroku** (Simple)
```bash
# Add Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port $PORT" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

**Option 2: Railway** (Free tier)
- Connect your GitHub repo
- Railway auto-detects Python
- Add ANTHROPIC_API_KEY as environment variable

**Option 3: AWS Lambda** (Serverless)
- Use Mangum adapter for FastAPI
- Deploy with AWS SAM or Serverless Framework

### Publishing the Extension

1. Create a developer account ($5 one-time fee)
2. Zip your extension folder
3. Upload to Chrome Web Store
4. Fill out listing details
5. Submit for review

**Before publishing:**
- Add privacy policy
- Update API URL from localhost to production
- Add better icons
- Test thoroughly
- Write clear description

---

## Part 8: Best Practices

### Security

```javascript
// ✅ DO: Validate user input
if (!file.type.includes('pdf') && !file.type.includes('doc')) {
  throw new Error('Invalid file type');
}

// ❌ DON'T: Expose API keys in frontend
const API_KEY = "sk-ant-..."; // Never do this!
```

### Error Handling

```python
try:
    result = process_data()
except ValueError as e:
    raise HTTPException(status_code=400, detail=str(e))
except Exception as e:
    raise HTTPException(status_code=500, detail="Internal error")
```

### Performance

```javascript
// Cache results to avoid re-analysis
const cacheKey = `analysis_${jobUrl}`;
chrome.storage.local.get([cacheKey], (result) => {
  if (result[cacheKey]) {
    // Use cached result
    return displayResults(result[cacheKey]);
  }
  // Otherwise, fetch new analysis
});
```

---

## Part 9: Common Challenges

### Challenge 1: LinkedIn Changes HTML

**Solution:** Use multiple selectors with fallbacks
```javascript
const title = 
  document.querySelector('.selector-1')?.textContent ||
  document.querySelector('.selector-2')?.textContent ||
  'Title not found';
```

### Challenge 2: API Costs

**Solution:** Implement caching and rate limiting
```python
from functools import lru_cache
from time import time

@lru_cache(maxsize=100)
def analyze_with_cache(resume_hash, job_hash):
    # Only calls API for unique combinations
    pass
```

### Challenge 3: Resume Parsing

**Solution:** Use specialized libraries
```bash
pip install pdfplumber python-docx
```

```python
import pdfplumber

def extract_pdf_text(file_path):
    with pdfplumber.open(file_path) as pdf:
        text = ' '.join(page.extract_text() for page in pdf.pages)
    return text
```

---

## Part 10: Next Level Features

### 1. AI-Powered Resume Tailoring
```python
@app.post("/tailor-resume")
def tailor_resume(resume: str, job: str):
    prompt = f"""
    Rewrite these resume bullets to better match this job:
    Resume: {resume}
    Job: {job}
    
    Return improved bullets that:
    - Use keywords from job posting
    - Quantify achievements
    - Match job requirements
    """
```

### 2. Interview Prep
```python
@app.post("/generate-interview-questions")
def generate_questions(job_description: str):
    prompt = f"""
    Based on this job description, generate:
    - 10 technical interview questions
    - 5 behavioral questions
    - Sample answers
    
    Job: {job_description}
    """
```

### 3. Salary Insights
```python
# Integrate with salary APIs
import requests

def get_salary_data(job_title, location):
    # Use Glassdoor API, Indeed Salary API, etc.
    pass
```

---

## 🎯 Conclusion

You now have:
- ✅ A working Chrome extension
- ✅ A FastAPI backend
- ✅ LLM integration
- ✅ Complete documentation
- ✅ Ideas for expansion

### Portfolio Tips

When showcasing this project:
1. **Demo video**: Record yourself using it
2. **Architecture diagram**: Show how components connect
3. **Code highlights**: Explain interesting technical decisions
4. **Results**: Share example match scores
5. **Challenges**: Discuss what you learned

### Keep Learning

- Read FastAPI docs: https://fastapi.tiangolo.com/
- Study Chrome extension samples: https://github.com/GoogleChrome/chrome-extensions-samples
- Experiment with Claude: https://docs.anthropic.com/
- Build more features!

**Remember**: The best way to learn is by building. Start with this project, then make it your own!

Good luck with your portfolio! 🚀
