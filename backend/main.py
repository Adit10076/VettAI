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
    "score": {"overall": 75, "marketPotential": 70, "technicalFeasibility": 80},
    "swotAnalysis": {
        "strengths": [
            "Innovative concept with clear problem-solution fit",
            "Well-defined target audience",
            "Scalable business model",
        ],
        "weaknesses": [
            "May require significant development resources",
            "Potential market adoption challenges",
            "Competition from established players",
        ],
        "opportunities": [
            "Growing market trend in this space",
            "Potential for strategic partnerships",
            "Expansion into related verticals",
        ],
        "threats": [
            "Regulatory changes could impact operations",
            "New competitors entering the market",
            "Economic factors affecting user spending",
        ],
    },
    "mvpSuggestions": [
        "Focus on core functionality that solves the main pain point",
        "Implement basic user authentication and profiles",
        "Create a simple dashboard to track key metrics",
    ],
    "businessModelIdeas": [
        "Freemium with premium features",
        "Subscription-based service",
        "Usage-based pricing structure",
    ],
}


@app.post("/validate", response_model=StartupEvaluation)
async def validate_startup_idea(idea: StartupIdea):
    prompt = f"""
    You are an expert startup evaluator with deep experience in product, market, and technical analysis. Your task is to critically analyze the startup idea below and return a JSON response.

    ## Instructions:
    1. Carefully evaluate the provided idea.
    2. If the idea is **gibberish**, vague, incoherent, or nonsensical, mark `"isGibberish": true`.
    - Examples include random characters, meaningless statements, vague filler, circular logic, or empty buzzwords.
    - You must be **strict** — reject anything that doesn’t present a clear, specific problem and solution.

    3. If gibberish is detected:
    - Set all scores to **0**.
    - In each array (`swotAnalysis`, `mvpSuggestions`, `businessModelIdeas`), include **clear, human-readable reasons** explaining why the idea was rejected. Be specific.
    - DO NOT leave any arrays empty.
    - DO NOT repeat the input.

    4. If the idea is valid:
    - Set `"isGibberish": false` and provide an **insightful, original** analysis.
    - **Do not repeat** the input content — provide fresh perspectives and strategic thinking.
    - Give realistic MVPs and viable business model suggestions.

    ## Startup Idea:
    Title: {idea.title}
    Problem Statement: {idea.problem}
    Proposed Solution: {idea.solution}
    Target Audience: {idea.audience}
    Business Model Description: {idea.businessModel}

    ## Return valid JSON in this exact format:
    {{
        "isGibberish": boolean,
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

    ## Guidelines:
    - Always return valid JSON.
    - No markdown or extra text.
    - If gibberish, make every field a **clear explanation** of why it's considered invalid — especially within the arrays.
    - Maintain consistent format to prevent frontend parsing issues.
    """


    try:
        # First, check if Ollama is running
        try:
            async with httpx.AsyncClient() as client:
                # Simple health check request
                health_check = await client.get(
                    "http://localhost:11434/api/tags", timeout=5.0
                )
                if health_check.status_code != 200:
                    print("Ollama health check failed:", health_check.status_code)
                    raise HTTPException(
                        status_code=503, detail="Ollama service unavailable"
                    )
        except httpx.RequestError as e:
            print(f"Ollama connection error: {str(e)}")
            raise HTTPException(
                status_code=503,
                detail="Could not connect to Ollama. Make sure it's running.",
            )

        # Now make the actual API call
        async with httpx.AsyncClient() as client:
            print(f"Sending request to Ollama with model: mistral")
            response = await client.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "mistral",  # Using mistral model instead of llama3
                    "prompt": prompt,
                    "stream": False,
                },
                timeout=60.0,
            )

        if response.status_code != 200:
            print(f"Ollama response error: {response.status_code} - {response.text}")
            raise HTTPException(
                status_code=500, detail=f"Error from Ollama: {response.text}"
            )

        ollama_response = response.json()
        text_response = ollama_response.get("response", "")

        print("Raw model response (first 200 chars):", text_response[:200])

        # Try multiple approaches to extract JSON
        # 1. Direct JSON parsing if model returned clean JSON
        try:
            if text_response.strip().startswith("{") and text_response.strip().endswith(
                "}"
            ):
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
                if all(
                    key in result
                    for key in [
                        "score",
                        "swotAnalysis",
                        "mvpSuggestions",
                        "businessModelIdeas",
                    ]
                ):
                    return result
                else:
                    print("Missing required fields in result:", result.keys())
        except json.JSONDecodeError as e:
            print("JSON parsing error:", str(e))

        # 3. Try to fix common JSON issues and retry
        try:
            # Replace single quotes with double quotes
            fixed_json = text_response.replace("'", '"')
            # Try to find JSON in the fixed text
            json_start = fixed_json.find("{")
            json_end = fixed_json.rfind("}") + 1

            if json_start != -1 and json_end > json_start:
                json_str = fixed_json[json_start:json_end]
                result = json.loads(json_str)
                if all(
                    key in result
                    for key in [
                        "score",
                        "swotAnalysis",
                        "mvpSuggestions",
                        "businessModelIdeas",
                    ]
                ):
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
