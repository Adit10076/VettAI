from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import json
from typing import List, Dict, Any, Optional

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class StartupIdea(BaseModel):
    title: str
    problem: str
    solution: str
    audience: str
    businessModel: str

class Score(BaseModel):
    overall: int
    marketPotential: int
    technicalFeasibility: int

class SwotAnalysis(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    opportunities: List[str]
    threats: List[str]

class StartupEvaluation(BaseModel):
    score: Score
    swotAnalysis: SwotAnalysis
    mvpSuggestions: List[str]
    businessModelIdeas: List[str]

# Fallback response in case of parsing issues
FALLBACK_RESPONSE = {
    "score": {
        "overall": 75,
        "marketPotential": 70,
        "technicalFeasibility": 80
    },
    "swotAnalysis": {
        "strengths": [
            "Innovative concept with clear problem-solution fit",
            "Well-defined target audience",
            "Scalable business model"
        ],
        "weaknesses": [
            "May require significant development resources",
            "Potential market adoption challenges",
            "Competition from established players"
        ],
        "opportunities": [
            "Growing market trend in this space",
            "Potential for strategic partnerships",
            "Expansion into related verticals"
        ],
        "threats": [
            "Regulatory changes could impact operations",
            "New competitors entering the market",
            "Economic factors affecting user spending"
        ]
    },
    "mvpSuggestions": [
        "Focus on core functionality that solves the main pain point",
        "Implement basic user authentication and profiles",
        "Create a simple dashboard to track key metrics"
    ],
    "businessModelIdeas": [
        "Freemium with premium features",
        "Subscription-based service",
        "Usage-based pricing structure"
    ]
}

@app.post("/validate", response_model=StartupEvaluation)
async def validate_startup_idea(idea: StartupIdea):
    prompt = f"""
    Please evaluate this startup idea and return your analysis in JSON format:

    Title: {idea.title}
    Problem: {idea.problem}
    Solution: {idea.solution}
    Target Audience: {idea.audience}
    Business Model: {idea.businessModel}

    Analyze the startup idea and provide:
    1. A score (0-100) with three components: overall, marketPotential, and technicalFeasibility
    2. A SWOT analysis with strengths, weaknesses, opportunities, and threats as string arrays
    3. Three MVP suggestions as a string array
    4. Two to three business model ideas as a string array

    Return ONLY valid JSON in exactly this format without any additional text or markdown:
    {{
        "score": {{
            "overall": number,
            "marketPotential": number,
            "technicalFeasibility": number
        }},
        "swotAnalysis": {{
            "strengths": [string, string, ...],
            "weaknesses": [string, string, ...],
            "opportunities": [string, string, ...],
            "threats": [string, string, ...]
        }},
        "mvpSuggestions": [string, string, string],
        "businessModelIdeas": [string, string, ...]
    }}
    """

    try:
        # First, check if Ollama is running
        try:
            async with httpx.AsyncClient() as client:
                # Simple health check request
                health_check = await client.get("http://localhost:11434/api/tags", timeout=5.0)
                if health_check.status_code != 200:
                    print("Ollama health check failed:", health_check.status_code)
                    raise HTTPException(status_code=503, detail="Ollama service unavailable")
        except httpx.RequestError as e:
            print(f"Ollama connection error: {str(e)}")
            raise HTTPException(status_code=503, detail="Could not connect to Ollama. Make sure it's running.")

        # Now make the actual API call
        async with httpx.AsyncClient() as client:
            print(f"Sending request to Ollama with model: mistral")
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "mistral",  # Using mistral model instead of llama3
                    "prompt": prompt,
                    "stream": False
                },
                timeout=60.0
            )

        if response.status_code != 200:
            print(f"Ollama response error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=500, detail=f"Error from Ollama: {response.text}")

        ollama_response = response.json()
        text_response = ollama_response.get("response", "")
        
        print("Raw model response (first 200 chars):", text_response[:200])

        # Try multiple approaches to extract JSON
        # 1. Direct JSON parsing if model returned clean JSON
        try:
            if text_response.strip().startswith("{") and text_response.strip().endswith("}"):
                return json.loads(text_response)
        except json.JSONDecodeError:
            pass  # Continue to next approach if this fails
            
        # 2. Find JSON within the text using brackets
        try:
            json_start = text_response.find("{")
            json_end = text_response.rfind("}") + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = text_response[json_start:json_end]
                print("Extracted JSON string (first 100 chars):", json_str[:100])
                result = json.loads(json_str)
                
                # Validate required fields
                if all(key in result for key in ["score", "swotAnalysis", "mvpSuggestions", "businessModelIdeas"]):
                    return result
                else:
                    print("Missing required fields in result:", result.keys())
        except json.JSONDecodeError as e:
            print("JSON parsing error:", str(e))
            
        # 3. Try to fix common JSON issues and retry
        try:
            # Replace single quotes with double quotes
            fixed_json = text_response.replace("'", "\"")
            # Try to find JSON in the fixed text
            json_start = fixed_json.find("{")
            json_end = fixed_json.rfind("}") + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = fixed_json[json_start:json_end]
                result = json.loads(json_str)
                if all(key in result for key in ["score", "swotAnalysis", "mvpSuggestions", "businessModelIdeas"]):
                    return result
        except Exception:
            pass

        # If all parsing attempts fail, return fallback response
        print("All parsing attempts failed, using fallback response")
        return FALLBACK_RESPONSE

    except Exception as e:
        print(f"Unexpected error: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# Run using: uvicorn main:app --reload
