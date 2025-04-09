# Startup Idea Validation Backend

This FastAPI backend evaluates startup ideas using a local Mistral model running via Ollama.

## Prerequisites

- Python 3.8+
- Ollama installed with Mistral model
- Ollama running locally on port 11434

## Setup

1. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install the required packages:

```bash
pip install -r requirements.txt
```

## Running the Backend

Start the FastAPI server:

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

## API Endpoints

### POST /validate

Evaluates a startup idea and returns a detailed analysis.

**Request Body:**
```json
{
  "title": "string",
  "problem": "string",
  "solution": "string",
  "audience": "string",
  "businessModel": "string"
}
```

**Response:**
```json
{
  "score": {
    "overall": 0,
    "marketPotential": 0,
    "technicalFeasibility": 0
  },
  "swotAnalysis": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "opportunities": ["string"],
    "threats": ["string"]
  },
  "mvpSuggestions": ["string"],
  "businessModelIdeas": ["string"]
}
``` 