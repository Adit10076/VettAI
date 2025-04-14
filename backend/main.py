from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import httpx
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class StartupIdea(BaseModel):
    title: str
    problem: str
    solution: str
    audience: str
    businessModel: str

class Score(BaseModel):
    overall: float
    marketPotential: float
    technicalFeasibility: float

class SwotAnalysis(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    opportunities: List[str]
    threats: List[str]

class MarketAnalysis(BaseModel):
    targetMarket: str
    tam: str
    sam: str
    som: str
    growthRate: str
    trends: List[str]
    competitors: List[str]
    customerNeeds: List[str]
    barriersToEntry: List[str]

class StartupEvaluation(BaseModel):
    score: Score
    swotAnalysis: SwotAnalysis
    mvpSuggestions: List[str]
    businessModelIdeas: List[str]
    marketAnalysis: MarketAnalysis

FALLBACK_RESPONSE = {
    "score": {"overall": 75, "marketPotential": 70, "technicalFeasibility": 80},
    "swotAnalysis": {
        "strengths": ["Innovative", "Scalable", "Well-targeted"],
        "weaknesses": ["High dev cost", "Low adoption risk", "Unclear pricing"],
        "opportunities": ["Growing market", "Tech trends", "Global reach"],
        "threats": ["Regulations", "Competitors", "Economic instability"]
    },
    "mvpSuggestions": ["Build landing page", "Create waitlist", "Offer demo"],
    "businessModelIdeas": ["Subscription", "Freemium", "Tiered pricing"],
    "marketAnalysis": {
        "targetMarket": "Urban eco-conscious youth",
        "tam": "$50000000000",
        "sam": "$5000000000",
        "som": "$100000000",
        "growthRate": "15% CAGR due to rising demand for sustainable consumer products globally",
        "trends": ["AI for sustainability", "Eco-lifestyle tracking"],
        "competitors": ["Greenly", "Joro"],
        "customerNeeds": ["Actionable tips", "Progress tracking"],
        "barriersToEntry": ["Trust", "Accuracy", "Engagement"]
    }
}

@app.post("/validate", response_model=StartupEvaluation)
async def validate_startup_idea(idea: StartupIdea):
    prompt = f"""
You are a startup evaluator. Analyze the following startup idea and return valid JSON only. Do not repeat input.

Startup:
Title: {idea.title}
Problem: {idea.problem}
Solution: {idea.solution}
Audience: {idea.audience}
Business Model: {idea.businessModel}

Output JSON format:
{{
  "isGibberish": boolean,
  "score": {{
    "overall": number,
    "marketPotential": number,
    "technicalFeasibility": number
  }},
  "swotAnalysis": {{
    "strengths": [string, ...],
    "weaknesses": [string, ...],
    "opportunities": [string, ...],
    "threats": [string, ...]
  }},
  "mvpSuggestions": [string, string, string],
  "businessModelIdeas": [string, ...],
  "marketAnalysis": {{
    "targetMarket": string,
    "tam": string,
    "sam": string,
    "som": string,
    "growthRate": string,
    "trends": [string, ...],
    "competitors": [string, ...],
    "customerNeeds": [string, ...],
    "barriersToEntry": [string, ...]
  }}
}}
Only output valid JSON. No comments or markdown.
"""

    headers = {
        "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
        "Content-Type": "application/json"
    }

    body = {
        "model": "meta-llama/llama-4-scout-17b-16e-instruct", 
        "messages": [{"role": "user", "content": prompt}]
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=body
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            return parsed
    except Exception as e:
        print("Groq error:", e)
        return FALLBACK_RESPONSE
