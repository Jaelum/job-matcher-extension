# 🚀 Quick Start Guide

Follow these steps to get the Job Match Analyzer running in 10 minutes!

## Prerequisites

- Google Chrome browser
- Python 3.9 or higher installed
- An Anthropic API account (free to sign up)

## Step-by-Step Setup

### 1️⃣ Get Your API Key (3 minutes)

1. Go to https://console.anthropic.com/
2. Sign up for a free account
3. Click on "API Keys" in the left sidebar
4. Click "Create Key"
5. Copy your API key (starts with `sk-ant-...`)
6. **Important**: Keep this key secret!

### 2️⃣ Set Up the Backend (3 minutes)

Open Terminal/Command Prompt and run:

```bash
# Navigate to the backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# On Windows:
copy .env.example .env
# On Mac/Linux:
cp .env.example .env
```

Now open the `.env` file in a text editor and paste your API key:
```
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

Start the server:
```bash
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Keep this terminal window open!** The server needs to stay running.

### 3️⃣ Install the Chrome Extension (2 minutes)

1. Open Chrome and go to `chrome://extensions/`
2. Turn ON "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Navigate to and select the `extension` folder
5. The extension icon (purple "JM") should appear in your toolbar

### 4️⃣ Test It Out (2 minutes)

1. Click the extension icon in Chrome
2. Upload your resume (any text file or PDF)
3. Go to a LinkedIn or Indeed job posting
4. Click the extension icon again
5. Click "Analyze This Job"
6. Wait 5-10 seconds for results!

## ✅ Success Checklist

- [ ] Backend running at http://localhost:8000
- [ ] Extension loaded in Chrome
- [ ] Resume uploaded
- [ ] Analyzed at least one job posting

## 🎉 You're Done!

You now have a working AI job matcher! Try analyzing different jobs to see how well they match your skills.

## Common Issues

**"Connection failed" error**
→ Make sure the backend is running (check the terminal)

**"Could not extract job details"**
→ Make sure you're on an actual job posting page, not a search results page
→ Try refreshing the page

**"Analysis failed"**
→ Check your API key in the `.env` file
→ Make sure you have API credits (new accounts get free credits)

## Next Steps

- Read the full README.md for advanced features
- Customize the prompt in `backend/main.py` for better results
- Update the UI styling in `extension/popup.html`
- Add your own features!

## Need Help?

Check the troubleshooting section in README.md or review your console logs for error messages.

Happy job hunting! 🎯
