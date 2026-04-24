# Studio Wars

An AI-powered troop creation pipeline for a Clash of Clans-style strategy game. Players design troops through a guided builder, a multi-agent AI pipeline generates balanced stats and artwork, and a human director approves each troop before it joins the live roster.

Built for the **Agentic Frontier Hackathon** — Supercell track + Best Trust Implementation.

---

## How It Works

```
Player fills Troop Builder → 4 AI Agents run in sequence → Director approves → Troop joins roster + gets 3D model
```

### The 4-Agent Pipeline

| Agent | What it does |
|-------|-------------|
| **Portrait Agent** | Generates a full-body troop portrait via DALL-E 3 |
| **Character Agent** | Designs stats and lore — constrained by archetype rules, hidden normalization prevents broken troops |
| **Balance Agent** | Validates stat totals, type alignment, and fit against the live roster |
| **Safety Agent** | Screens for harmful content, IP violations, age-appropriateness across 5 checks |

All agent reasoning is stored as transcripts — full auditability for every troop.

### Guided Troop Builder

Players don't input raw stats. Instead they choose:
- **Base archetype** — Barbarian / Giant / Archer / Wizard / Balloon (sets hidden stat ranges)
- **Target preference** — Ground / Air / Both
- **Special ability** — Splash / Rage / Freeze / Chain / Heal
- **Weakness trade-off** — forced downside that keeps the troop balanced
- **Creative vision** — optional prompt for appearance and lore only

The AI generates stats within locked ranges for each archetype. Players can never create infinite-damage or unkillable troops.

### Trust & Safety

- Every troop gets an AI trust score (0–100) with 5 named checks
- Human director must approve before anything goes live
- Full agent transcripts stored and visible in the admin panel
- Rejection notes feed back into the next generation (the AI learns from director decisions)

### Community Voting

Approved troops go to the public roster where players vote them up or down. The most-voted troop gets selected for the main Studio Wars game.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy, SQLite, Uvicorn |
| AI | OpenAI GPT-4o-mini + DALL-E 3 |
| 3D Generation | Meshy API (image-to-3D) |
| Image Hosting | ImgBB API |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Streaming | Server-Sent Events (SSE) |
| 3D Viewer | @google/model-viewer |

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- API keys for OpenAI, Meshy, and ImgBB

### 1. Clone the repo

```bash
git clone https://github.com/your-username/studio-wars.git
cd studio-wars
```

### 2. Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys
```

**.env file:**
```
OPENAI_API_KEY=your_openai_api_key
MESHY_API_KEY=your_meshy_api_key
IMGBB_API_KEY=your_imgbb_api_key
```

```bash
# Start the backend
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment (optional — defaults to localhost:8000)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## API Keys

| Key | Where to get it |
|-----|----------------|
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |
| `MESHY_API_KEY` | [meshy.ai](https://www.meshy.ai) |
| `IMGBB_API_KEY` | [api.imgbb.com](https://api.imgbb.com) |

---

## Project Structure

```
studio-wars/
├── backend/
│   ├── agents/
│   │   ├── portrait_agent.py     # DALL-E 3 portrait generation
│   │   ├── character_agent.py    # Stat design with archetype constraints
│   │   ├── balance_agent.py      # Stat validation + roster-aware balancing
│   │   ├── safety_agent.py       # Content moderation (5-check system)
│   │   └── mesh_agent.py         # Meshy API 3D model generation
│   ├── routes/
│   │   ├── characters.py         # Generation pipeline + voting endpoint
│   │   └── admin.py              # Approval queue + mesh retry
│   ├── models.py                 # SQLAlchemy Character model
│   ├── schemas.py                # Pydantic request/response schemas
│   ├── database.py               # SQLite setup
│   ├── storage.py                # File + ImgBB upload helpers
│   ├── streaming.py              # SSE event helpers
│   ├── main.py                   # FastAPI app entry point
│   ├── migrate_votes.py          # One-time DB migration for vote columns
│   ├── requirements.txt
│   ├── .env.example
│   └── storage/
│       ├── portraits/            # Local portrait cache
│       └── meshes/               # Downloaded GLB files
└── frontend/
    ├── app/
    │   ├── page.tsx              # Home / pipeline overview
    │   ├── create/page.tsx       # Guided Troop Builder
    │   ├── roster/page.tsx       # Public roster + voting + 3D viewer
    │   └── admin/page.tsx        # Director approval queue
    ├── components/
    │   ├── character-card.tsx    # Troop card with vote buttons + trust badge
    │   ├── model-viewer.tsx      # @google/model-viewer wrapper with polling
    │   ├── trust-dashboard.tsx   # AI safety score display
    │   └── agent-pipeline.tsx    # Real-time agent step display
    ├── hooks/
    │   ├── use-character-stream.ts  # SSE stream consumer
    │   └── use-vote.ts              # Vote state + localStorage dedup
    └── lib/
        ├── api.ts                # Typed API client
        └── types.ts              # TypeScript interfaces
```

---

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Project overview and pipeline explanation |
| Create | `/create` | Guided Troop Builder with real-time agent pipeline |
| Roster | `/roster` | Approved troops with voting and 3D viewer |
| Admin | `/admin` | Director approval queue with trust dashboard |

---

## Key Features

- **Real-time streaming** — SSE stream shows each agent step as it runs
- **Hidden stat normalization** — archetype + ability + weakness choices lock stat ranges; players can't create broken troops
- **Roster-aware balancing** — balance agent compares new troops against existing roster
- **Rejection feedback loop** — director rejection notes are injected into the next generation prompt
- **Community voting** — upvote/downvote per session (localStorage dedup), top pick joins Studio Wars
- **3D model generation** — approved troops automatically get a GLB model via Meshy, viewable in-browser
- **Full audit trail** — every agent's reasoning transcript stored per troop
