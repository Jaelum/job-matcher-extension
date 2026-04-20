from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from anthropic import Anthropic
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Job Match Analyzer API")

# Enable CORS for Chrome extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your extension ID
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Anthropic client
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Request models
class JobData(BaseModel):
    title: str
    company: str
    location: str
    description: str
    skills: list[str] = []
    url: str
    source: str

class AnalysisRequest(BaseModel):
    resume: str
    job: JobData

class AnalysisResponse(BaseModel):
    matchScore: int
    matchingSkills: list[str]
    missingSkills: list[str]
    recommendations: list[str]

@app.get("/")
def read_root():
    return {"status": "Job Match Analyzer API is running"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_job(request: AnalysisRequest):
    """
    Analyze how well a resume matches a job posting using Claude AI
    """
    try:
        # Check if API key is set
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            print("ERROR: ANTHROPIC_API_KEY not found in environment variables")
            raise HTTPException(status_code=500, detail="API key not configured")
        
        print(f"API Key found: {api_key[:10]}...")  # Print first 10 chars for debugging
        print(f"Analyzing job: {request.job.title} at {request.job.company}")
        
        # Create the prompt for Claude
        prompt = f"""You are an expert career counselor and recruiter with deep knowledge of transferable skills and equivalent experience. Analyze how well this resume matches the job posting.

CRITICAL ANALYSIS RULES:
1. Look for EQUIVALENT and RELATED experience, not just exact keyword matches
2. Recognize transferable skills (e.g., "Salesforce CRM" = "CRM experience", "qualified contacts" = "lead generation")
3. Value demonstrated outcomes and responsibilities over exact tool names
4. Consider the SUBSTANCE of what they've done, not just the specific terminology used
5. Be generous in recognizing relevant experience that demonstrates the same competencies

RESUME:
{request.resume}

JOB POSTING:
Title: {request.job.title}
Company: {request.job.company}
Location: {request.job.location}

Description:
{request.job.description}

ANALYSIS APPROACH:
- If the resume shows they've done something similar or related to a requirement, count it as matching
- Only mark skills as "missing" if they truly have NO related experience
- For matching skills, cite the SPECIFIC resume bullet points that demonstrate that skill
- Be especially careful to recognize: CRM experience, sales tools, marketing platforms, data analysis, client management, business development, and technical skills even if different tools were used

Please provide a detailed analysis in the following JSON format:
{{
  "matchScore": <number 0-100>,
  "matchingSkills": ["skill/qualification + brief evidence from resume", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...]
}}

Guidelines:
- matchScore: Overall match percentage (0-100) based on skills, experience, and requirements
- matchingSkills: List 5-8 key skills/qualifications from the job that the candidate HAS (include brief proof from their resume)
- missingSkills: ONLY list 2-4 skills the candidate truly lacks any related experience in (be strict here - only include if NO related experience exists)
- recommendations: Provide 3-5 specific, actionable recommendations to improve their application (focus on how to highlight existing relevant experience better)

Return ONLY valid JSON, no additional text."""

        print("Calling Claude API...")
        
        # Call Claude API
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        print("Claude API response received")
        
        # Parse the response
        response_text = message.content[0].text
        print(f"Raw response: {response_text[:200]}...")  # Print first 200 chars
        
        # Clean up the response - handle various formats Claude might return
        # Sometimes Claude adds text before the JSON, so we need to extract it
        
        # Try to find JSON in the response
        if "```json" in response_text:
            # Extract content between ```json and ```
            start = response_text.find("```json") + 7
            end = response_text.find("```", start)
            response_text = response_text[start:end].strip()
        elif "```" in response_text:
            # Extract content between ``` markers
            start = response_text.find("```") + 3
            end = response_text.find("```", start)
            response_text = response_text[start:end].strip()
        elif response_text.strip().startswith("{"):
            # Already clean JSON
            response_text = response_text.strip()
        else:
            # Try to find the first { and last } to extract JSON
            start = response_text.find("{")
            end = response_text.rfind("}") + 1
            if start != -1 and end != 0:
                response_text = response_text[start:end].strip()
        
        # Parse JSON
        analysis = json.loads(response_text)
        print("Successfully parsed JSON response")
        
        return AnalysisResponse(
            matchScore=analysis["matchScore"],
            matchingSkills=analysis["matchingSkills"],
            missingSkills=analysis["missingSkills"],
            recommendations=analysis["recommendations"]
        )
        
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {str(e)}")
        print(f"Response text was: {response_text}")
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
