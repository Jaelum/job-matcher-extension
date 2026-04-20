# 🧪 Testing Guide

This guide helps you test the Job Match Analyzer with sample data.

## Quick Backend Test

Test if your backend is working without the extension:

### Using curl (Command Line)

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "resume": "Software Engineer with 5 years of experience in Python, JavaScript, and React. Built scalable web applications. Strong in API development and cloud technologies.",
    "job": {
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "description": "We are looking for a Senior Software Engineer with experience in Python, React, and AWS. Must have 5+ years of experience building web applications.",
      "skills": ["Python", "React", "AWS"],
      "url": "https://example.com/job",
      "source": "LinkedIn"
    }
  }'
```

### Using Python

Create a file `test_api.py`:

```python
import requests
import json

url = "http://localhost:8000/analyze"

data = {
    "resume": "Software Engineer with 5 years of experience in Python, JavaScript, and React. Built scalable web applications. Strong in API development and cloud technologies.",
    "job": {
        "title": "Senior Software Engineer",
        "company": "Tech Corp",
        "location": "San Francisco, CA",
        "description": "We are looking for a Senior Software Engineer with experience in Python, React, and AWS. Must have 5+ years of experience building web applications.",
        "skills": ["Python", "React", "AWS"],
        "url": "https://example.com/job",
        "source": "LinkedIn"
    }
}

response = requests.post(url, json=data)
print(json.dumps(response.json(), indent=2))
```

Run it:
```bash
pip install requests
python test_api.py
```

**Expected Output:**
```json
{
  "matchScore": 85,
  "matchingSkills": [
    "Python - 5 years experience",
    "React - Front-end development",
    "Web application development",
    "API development",
    "5+ years experience requirement met"
  ],
  "missingSkills": [
    "AWS / Cloud infrastructure",
    "Senior-level leadership",
    "System architecture"
  ],
  "recommendations": [
    "Emphasize your 5 years of Python experience prominently",
    "Consider obtaining AWS certification to fill the cloud skills gap",
    "Highlight any scalable systems you've built"
  ]
}
```

## Sample Resumes for Testing

### Sample 1: Entry-Level Developer
```
John Doe
Software Developer

EDUCATION
B.S. Computer Science, State University, 2023

SKILLS
- Python, JavaScript, HTML/CSS
- React, Node.js
- Git, GitHub
- SQL databases

EXPERIENCE
Intern, Web Developer | Tech Startup | Summer 2022
- Built responsive web pages using React
- Wrote REST APIs with Node.js
- Collaborated with team using Git

PROJECTS
- E-commerce website (React, Node.js)
- Weather app (JavaScript, API integration)
```

### Sample 2: Mid-Level Engineer
```
Jane Smith
Senior Software Engineer

EXPERIENCE
Software Engineer | Big Tech Co | 2019-Present
- Led development of microservices architecture
- Reduced API latency by 40%
- Mentored 3 junior developers
- Technologies: Python, Django, PostgreSQL, Docker, AWS

Software Developer | Startup Inc | 2017-2019
- Built full-stack web applications
- Implemented CI/CD pipelines
- Technologies: JavaScript, React, Node.js, MongoDB

SKILLS
- Languages: Python, JavaScript, TypeScript, Go
- Frameworks: Django, React, Express
- Cloud: AWS (EC2, S3, Lambda), Docker, Kubernetes
- Databases: PostgreSQL, MongoDB, Redis
```

## Testing Different Scenarios

### Scenario 1: Perfect Match
- Resume: Has all required skills, experience level matches
- Expected: Match score 90-100%

### Scenario 2: Skill Gap
- Resume: Missing 2-3 key technical skills
- Expected: Match score 60-75%, missing skills identified

### Scenario 3: Experience Mismatch
- Resume: Has skills but wrong experience level (junior applying for senior)
- Expected: Match score 50-70%, recommendation about experience

### Scenario 4: Career Change
- Resume: Different industry, transferable skills
- Expected: Match score 40-60%, recommendations to highlight transferable skills

## Extension Testing Checklist

### UI Testing
- [ ] Extension icon appears in Chrome toolbar
- [ ] Popup opens when clicking icon
- [ ] File upload button works
- [ ] "Analyze This Job" button enables after resume upload
- [ ] Loading spinner appears during analysis
- [ ] Results display correctly with score, skills, recommendations

### Functionality Testing
- [ ] Works on LinkedIn job postings
- [ ] Works on Indeed job postings
- [ ] Extracts job title correctly
- [ ] Extracts company name correctly
- [ ] Extracts full job description
- [ ] Shows error on non-job pages
- [ ] Resume persists after closing popup

### Job Sites to Test

**LinkedIn URLs:**
- https://www.linkedin.com/jobs/view/[any-job-id]
- Make sure you're logged into LinkedIn

**Indeed URLs:**
- https://www.indeed.com/viewjob?jk=[job-id]
- https://www.indeed.com/rc/clk?jk=[job-id]

## Debugging Tips

### Check Extension Console
1. Right-click the extension icon
2. Select "Inspect popup"
3. Look for errors in Console tab

### Check Content Script Console
1. Open the job posting page
2. Press F12 to open DevTools
3. Look for errors or console.log messages

### Check Backend Logs
Look at the terminal where you ran `python main.py` for error messages

### Common Issues

**"Could not extract job details"**
- Log the extracted data in content.js:
```javascript
console.log('Extracted job:', jobData);
```

**API returns error**
- Check the full error message in Network tab
- Verify API key is correct
- Check if you have API credits

**Match score seems wrong**
- The AI's analysis may vary
- Try adjusting the prompt in `backend/main.py`
- Test with multiple resumes and jobs

## Performance Testing

Typical response times:
- Job extraction: < 100ms
- API call to backend: 200-500ms
- Claude AI analysis: 3-8 seconds
- **Total**: 4-9 seconds

If it's taking longer:
- Check your internet connection
- Verify the backend isn't overloaded
- Claude API may be experiencing delays

## Tips for Better Results

1. **Resume Quality**: More detailed resumes = better analysis
2. **Job Descriptions**: Longer descriptions = more context for AI
3. **Specific Skills**: List concrete technologies, not just "programming"
4. **Quantify Experience**: Include years of experience with each skill

## Next Steps

Once everything works:
1. Try different job postings
2. Test with your actual resume
3. Customize the UI colors/styling
4. Adjust the AI prompt for better recommendations
5. Add new features!

Happy testing! 🧪
