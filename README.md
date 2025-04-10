# VettAI Startup Idea Validation Platform

This project combines a Python FastAPI backend with a Next.js 15 frontend to analyze and validate startup ideas using local AI through Ollama.

## Project Structure

```
/
├── app/                     # Next.js frontend (App Router)
│   ├── components/          # Reusable UI components
│   ├── dashboard/           # Dashboard routes
│   │   └── results/         # Analysis results page
│   ├── submit-idea/         # Idea submission form
│   └── ...
├── backend/                 # FastAPI backend
│   ├── main.py              # FastAPI application 
│   ├── requirements.txt     # Python dependencies
│   └── README.md            # Backend-specific instructions
└── ...
```

## Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.8+
- [Ollama](https://ollama.ai/) with Mistral model installed
- PostgreSQL database

## Setup and Running

### 1. FastAPI Backend

Navigate to the backend directory and set up the Python environment:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Make sure Ollama is running with the Mistral model:

```bash
ollama run mistral
```

Start the FastAPI server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at http://localhost:8000.

### 2. Next.js Frontend

From the project root, install dependencies:

```bash
npm install
# or
yarn install
```

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000.

## Usage Flow

1. Register/login to the platform
2. Navigate to the dashboard
3. Click "Submit New Idea" 
4. Fill out the startup idea form with:
   - Title
   - Problem description
   - Solution
   - Target audience
   - Business model
5. Submit the form
6. View the detailed AI analysis with:
   - Overall score
   - Market potential score
   - Technical feasibility score
   - SWOT analysis
   - MVP suggestions
   - Business model ideas

## API Endpoints

### POST /validate

Evaluates a startup idea and returns a detailed analysis.

**Request:**
```json
{
  "title": "Your Startup Idea",
  "problem": "Problem description",
  "solution": "Solution description",
  "audience": "Target audience",
  "businessModel": "Business model approach"
}
```

**Response:**
```json
{
  "score": {
    "overall": 85,
    "marketPotential": 90,
    "technicalFeasibility": 80
  },
  "swotAnalysis": {
    "strengths": ["..."],
    "weaknesses": ["..."],
    "opportunities": ["..."],
    "threats": ["..."]
  },
  "mvpSuggestions": ["..."],
  "businessModelIdeas": ["..."]
}
```

## Technology Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, React
- **Backend**: FastAPI, Python
- **AI**: Ollama (Mistral model)
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
