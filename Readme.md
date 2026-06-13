# Onteach — Build Specification

> A SaaS platform that turns written course content into interactive, AI-avatar-delivered teaching sessions. An AI avatar reads a generated script in a video-call interface and answers student questions live via a RAG pipeline.

This document is the single source of truth for building the MVP. It is written to be handed to Claude Code as build context. Read it top to bottom before scaffolding anything.

---

## 1. Product Overview

A creator uploads course content. The system generates an editable, block-based script. The creator picks an avatar, voice, and background, then publishes. Students open a link, enter their name, and join a video-call-style session where a live AI avatar teaches the material and answers questions in real time.

### Session modes (MVP builds Individual / "Smarter Course Video" only)
| Mode | Description | MVP |
| --- | --- | --- |
| Smarter Course Video | Pre-scripted delivery; students raise hand and converse mid-session | ✅ Yes |
| AI Private Tutor | 1 student, 1 avatar, conversational | ⛔ Phase 3 |
| AI Live Classroom | Many students, shared avatar-led session | ⛔ Phase 3 |
| Always-On Assistant | Persistent Q&A avatar | ⛔ Phase 3 |

### MVP scope
- Creator: sign up (email/password + Google), create session (individual mode), upload content + additional knowledge, AI-generated editable block script, avatar + voice + background selection, AI cover image with upload override, publish, share + embed links, basic session log, basic dashboard.
- Student: join via link (name only, no account), video-call interface with live avatar, raise hand (text + voice), RAG-based Q&A, skip-to-section, student-initiated pause/resume, browser-based progress saving.

### Explicitly out of MVP
Group sessions, teams/orgs + admin dashboard, connection-dropout recovery, session recording, advanced analytics, mobile app. (Media inserts and action buttons are technically simple and included as stretch — see §10.)

---

## 2. Architecture

Three services in **one monorepo**, deployable to **one server** (two processes — PHP and Python are separate runtimes).

```
Browser (React SPA)
   │
   ├── HTTPS REST ────────────► Laravel API        (business + state)
   │
   ├── WebSocket (control) ───► FastAPI service     (AI + real-time orchestration)
   │
   └── WebRTC (media) ◄──────── Avatar provider      (HeyGen / Tavus video + voice)
```

**Division of responsibility — memorise this:**
- **Laravel owns state and business logic** — auth, users, sessions, script storage, file uploads, publishing, share/embed links, billing, logs.
- **FastAPI owns intelligence and real-time** — script generation (LLM), RAG ingestion + Q&A, the live session orchestrator, STT, the avatar provider driver.
- **The avatar provider owns video** — the avatar's video + voice + lipsync stream over WebRTC **directly to the browser**. FastAPI is the *control plane* (tells the avatar what to say and when to stop); it does **not** proxy video frames.

### The one core concept
The generated script is an **ordered list of blocks**. The FastAPI session orchestrator is a **state machine that walks this list**. Every student interaction is one of two things:
1. **Advance** — move to the next block.
2. **Interrupt → handle → resume** — pause the avatar, do something (answer a question, skip to a section), then resume from the exact block it paused on.

Raise-hand Q&A, skip-to-section, and pause all reuse the same interrupt/resume primitive.

---

## 3. Repository Structure

```
onteach/
├── frontend/                 # React + Vite SPA (creator studio + student player)
├── backend/                  # Laravel 12 API
├── ai-service/               # FastAPI (Python 3.11+) — AI + real-time
├── infra/
│   ├── nginx/                # reverse-proxy config for single-server deploy
│   └── docker-compose.yml    # local dev: mysql, redis, qdrant
├── .env.example
└── README.md                 # this file
```

---

## 4. Tech Stack

### Frontend (`frontend/`)
- React 18 + Vite + TypeScript
- React Router
- TanStack Query (server state) + Zustand (session/UI state)
- Tailwind CSS
- `@dnd-kit/core` — drag-and-drop for the block editor
- WebRTC client for the avatar stream (HeyGen `@heygen/streaming-avatar` SDK **or** Pipecat client SDK — see §11)
- `axios` for REST

### Backend (`backend/`)
- Laravel 12, PHP 8.3
- MySQL 8
- Laravel Sanctum (creator auth) + `firebase/php-jwt` or `lcobucci/jwt` (student session tokens)
- Redis (queue + cache)
- S3-compatible storage (AWS S3 or Cloudflare R2) via `league/flysystem-aws-s3-v3`
- Laravel Socialite (Google SSO)
- Filament v3 (admin panel — optional, for internal ops)

### AI service (`ai-service/`)
- FastAPI + Uvicorn, Python 3.11+
- `pydantic` v2 (schemas)
- LLM: Anthropic Claude **or** OpenAI (script generation + RAG answers)
- Embeddings + vector store: **Qdrant** (recommended) or `pgvector`
- STT: **Deepgram** streaming (low latency) — preferred over batch Whisper for live voice
- Avatar orchestration: **Pipecat** (strongly recommended — handles WebRTC transport, VAD, interruption, STT/TTS pipeline) wrapping the HeyGen driver
- `python-jose` (validate student/creator JWTs)
- `redis` (shared with Laravel for queue coordination if needed)

---

## 5. Data Model (MySQL — owned by Laravel)

### `users`
| column | type | notes |
| --- | --- | --- |
| id | bigint PK | |
| name | string | |
| email | string unique | |
| password | string nullable | null for Google-only |
| google_id | string nullable | |
| account_type | enum | `individual` \| `team` (MVP: individual) |
| created_at / updated_at | timestamps | |

### `sessions`
| column | type | notes |
| --- | --- | --- |
| id | bigint PK | |
| user_id | FK users | |
| name | string | e.g. "Introduction to Financial Modelling" |
| mode | enum | `smarter_video` (MVP), `private_tutor`, `live_classroom`, `assistant` |
| status | enum | `draft` \| `active` |
| avatar_id | string | provider avatar id |
| voice_id | string | provider voice id |
| background | string | `neutral_studio` \| `modern_office` \| `classroom` \| `solid_blue` \| custom URL |
| cover_image_url | string nullable | AI-generated or uploaded |
| share_slug | string unique nullable | set on publish |
| embed_slug | string unique nullable | set on publish |
| published_at | timestamp nullable | |
| created_at / updated_at | timestamps | |

### `script_blocks`
| column | type | notes |
| --- | --- | --- |
| id | bigint PK | |
| session_id | FK sessions | |
| order | unsigned int | sort order in the script |
| type | enum | `spoken_text` \| `media_insert` \| `action_button` \| `pause` |
| payload | json | type-specific, see §5.1 |
| bookmark_label | string nullable | if set, this block is a section start (powers skip-to-section) |
| created_at / updated_at | timestamps | |

### `uploads`
| column | type | notes |
| --- | --- | --- |
| id | bigint PK | |
| session_id | FK sessions | |
| kind | enum | `content` (required source) \| `knowledge` (extra Q&A material) |
| file_path | string | S3/R2 key |
| original_name | string | |
| mime | string | pdf, docx, pptx, txt |
| size | unsigned int | bytes (limit 100MB content) |
| ingested_at | timestamp nullable | set after FastAPI embeds it |

### `session_instances` (one per student run)
| column | type | notes |
| --- | --- | --- |
| id | uuid PK | |
| session_id | FK sessions | |
| student_name | string | collected at join |
| started_at | timestamp | |
| completed_at | timestamp nullable | |
| last_block_id | FK script_blocks nullable | resume point (also mirrored to client localStorage) |

### `qa_logs`
| column | type | notes |
| --- | --- | --- |
| id | bigint PK | |
| session_instance_id | FK | |
| question | text | |
| answer | text | |
| block_context_id | FK script_blocks nullable | which block the student was on |
| input_mode | enum | `text` \| `voice` |
| created_at | timestamp | |

> Vector embeddings live in Qdrant (owned by FastAPI), keyed by `session_id` + `upload_id`. They are **not** stored in MySQL.

### 5.1 Block `payload` JSON schemas
```jsonc
// spoken_text
{ "text": "Welcome to Intro to Financial Modelling…",
  "reading_speed": 1.0,            // 0.5–1.5
  "voice_emphasis": "neutral",     // neutral | warm | energetic
  "auto_pause_after": true }

// media_insert  (image/video/gif fills frame, avatar shrinks to PiP)
{ "url": "https://cdn…/income-statement.png",
  "media_type": "image",          // image | video | gif
  "display_duration": 20,          // seconds
  "spoken_text": "Notice how revenue flows down to net income…" } // avatar speaks this while media shows

// action_button  (overlay card with a CTA/link)
{ "label": "Visit the worked example",
  "action_type": "link",          // link | skip_to_section | download
  "target": "https://example.com"  // url, block_id, or asset url
}

// pause
{ "duration_seconds": 2 }
```

---

## 6. Laravel Backend Spec (`backend/`)

Pure REST API. No Blade views except optional Filament admin. Returns JSON. Uses API Resources.

### Responsibilities
Auth, user/session CRUD, script block storage, file uploads to S3/R2, dispatching script generation + ingestion to FastAPI, publishing (slug generation), session logs, minting student session tokens. **No LLM calls live here.**

### Endpoints
```
# Auth
POST   /api/auth/register            { name, email, password }
POST   /api/auth/login               { email, password } -> { token }
GET    /api/auth/google/redirect
GET    /api/auth/google/callback     -> { token }
GET    /api/me                       (Bearer)

# Sessions (Bearer)
GET    /api/sessions
POST   /api/sessions                 { name, mode }
GET    /api/sessions/{id}
PATCH  /api/sessions/{id}            { name, avatar_id, voice_id, background, cover_image_url }
DELETE /api/sessions/{id}

# Script (Bearer)
GET    /api/sessions/{id}/blocks
PUT    /api/sessions/{id}/blocks     full ordered array (drag-drop reorder, edits)
POST   /api/sessions/{id}/uploads    multipart { kind, file }
POST   /api/sessions/{id}/generate   -> calls FastAPI /generate-script (async); returns job status
POST   /api/sessions/{id}/publish    -> mints share_slug + embed_slug, status=active, triggers cover-image gen
GET    /api/sessions/{id}/logs       qa_logs for this session

# Public (no auth) — student entry
GET    /api/public/s/{share_slug}    -> { session name, creator, cover, avatar }
POST   /api/public/s/{share_slug}/join  { student_name }
       -> { session_instance_id, ws_url, avatar_session_token, student_token }
```

### Auth model
- **Creators:** Sanctum personal access tokens (Bearer). All `/api/sessions/*` routes guarded.
- **Students:** no account. On `join`, Laravel mints a **short-lived signed JWT** (HS256, shared secret with FastAPI) containing `{ session_id, session_instance_id, student_name, exp }`. The frontend passes this token when opening the FastAPI WebSocket. Also returns the provider's `avatar_session_token` (Laravel asks FastAPI to provision the avatar session, or FastAPI provisions it lazily on WS connect — see §11).

### Jobs (Redis queue)
- `IngestUploadsJob` — after upload, POST file refs to FastAPI `/ingest`.
- `GenerateScriptJob` — POST content refs to FastAPI `/generate-script`; on callback, persist blocks.
- `GenerateCoverImageJob` — on publish, call image-gen (DALL·E / Replicate), store to S3, set `cover_image_url`.

---

## 7. FastAPI Service Spec (`ai-service/`)

Owns all LLM, embedding, RAG, STT, and the live session orchestrator.

### Endpoints
```
POST  /generate-script        { session_id, content_refs[], knowledge_refs[] }
                              -> generates ordered blocks; callbacks Laravel to persist
POST  /ingest                 { session_id, upload_refs[] }
                              -> downloads from S3, chunks, embeds, upserts to Qdrant
WS    /session/{session_instance_id}?token=<student_jwt>
                              -> the live session control channel (see §9)
GET   /healthz
```
All endpoints validate the shared-secret JWT (creator token for `/generate-script` + `/ingest`; student token for the WS).

### Script generation
Pull content from S3 → send to LLM with a system prompt that returns **structured JSON blocks** (spoken_text segments, suggested section bookmarks). Validate against the §5.1 schemas. Callback Laravel with the block array. The script is fully editable afterward in the frontend.

### RAG pipeline
- **Ingest:** chunk content + additional knowledge (~500–800 token chunks, overlap), embed, upsert to Qdrant with metadata `{ session_id, upload_id, kind }`.
- **Query (at Q&A time):** embed the student question → vector search top-k over this session's chunks → build a grounded prompt (chunks + question + current-block context) → LLM → answer text. Stream the answer text to the chat panel immediately (latency mask), then send to the avatar to voice.

### Session orchestrator (the state machine)
On WS connect:
1. Load the session's ordered blocks + the avatar/voice config.
2. Provision the avatar streaming session (via the driver, §11). Send `session_ready` once the WebRTC stream is live in the browser.
3. **Walk the blocks one at a time:**
   - `spoken_text` → `driver.speak(text)` (REPEAT mode) → **wait for `AVATAR_STOP_TALKING`** → advance.
   - `media_insert` → send `show_media` to client; `driver.speak(payload.spoken_text)`; on stop, advance after `display_duration`.
   - `action_button` → send `show_action` to client; advance (non-blocking).
   - `pause` → wait `duration_seconds`; advance.
   - Whenever a block has `bookmark_label`, include it in `block_started.section_label` for the chapter indicator.
4. **Interrupt handlers** (raise_hand / skip_to_section / pause) call `driver.interrupt()`, do their work, then resume from the stored block pointer with a brief acknowledgement line ("Now, back to where we were…").
5. On last block → send `session_complete`.

> **CRITICAL — feed one block at a time.** The provider interrupt only stops the *currently spoken* task, not a queue. Never pre-queue the whole script. Send one `speak`, wait for `AVATAR_STOP_TALKING`, then send the next. This keeps interrupts clean.

---

## 8. Frontend Spec (`frontend/`)

### Screen inventory (matches the designs)
**Creator onboarding & build (1.x)**
- 1.1 Sign Up · 1.2 Account Type · 1.3 Welcome
- 1.4 Create Session: name + mode (Step 1 of 4)
- 1.5 Upload Content + Additional Knowledge (Step 2)
- 1.6 Script Generation Loading (poll/subscribe to generate job)
- 1.7 Script Editor — block list, drag-drop, block settings panel (reading speed, voice emphasis, auto-pause), insert media/link/bookmark, Script Assistant suggestions
- 1.8 Avatar & Voice + Background (Step 3)
- 1.9 Review & Publish (Step 4) — cover image, summary, Publish
- 1.10 Session Published — share link + embed code, copy buttons

**Creator dashboard (2.x)**
- 2.1 Dashboard Home — stat cards, recent sessions table, engagement insights, activity
- 2.2 Session Detail — overview tabs (Overview / Script / Analytics / Settings), share & embed, recent activity

**Student session player (3.x) — the live experience**
- 3.1 Join Page — cover + title + name input + Join
- 3.2 Session Loading — avatar warmup ("Getting your session ready…")
- 3.3 Active Session (Normal) — full-frame avatar video, control bar (pause, progress, section label, volume, Raise Hand)
- 3.4 Active Session (Media Insert) — chart/image fills frame, avatar shrinks to PiP (CSS transform)
- 3.5 Active Session (Action Button) — overlay link card
- 3.6 Hand Raised — question input panel (text + "or just start speaking")
- 3.7 Raise Hand Responding — chat transcript of Q + streamed A; skip-to-section menu variant
- 3.8 Skip to Section — bookmark list menu over the video
- 3.9 Session Paused / Session Complete — modals

### State & data
- **Server state:** TanStack Query against Laravel REST.
- **Editor state:** Zustand store holding the block array; `@dnd-kit` for reorder; debounced `PUT /blocks` autosave (the "Saved" indicator).
- **Session player state:** Zustand store driven by **WebSocket control messages** (current block, section label, progress %, media/action overlays, Q&A transcript, modals) + the WebRTC video element from the avatar provider.

### The player is a thin renderer
It renders the avatar's WebRTC stream and **reacts to control messages** from FastAPI. It does not contain script logic. It sends user actions (raise_hand, submit_question, submit_audio, skip_to_section, pause, resume) up the WebSocket. Progress is mirrored to `localStorage` so a returning student resumes on the same device.

---

## 9. WebSocket Protocol (Browser ↔ FastAPI)

JSON text frames; audio sent as binary frames (or base64 chunks). Connect: `WS /session/{session_instance_id}?token=<student_jwt>`.

### Server → Client
```jsonc
{ "type": "session_ready" }
{ "type": "block_started", "block_id": 12, "block_type": "spoken_text",
  "index": 3, "total": 18, "section_label": "Income Statement" }
{ "type": "avatar_speaking", "state": "start" }      // and "stop"
{ "type": "show_media", "url": "...", "media_type": "image", "display_duration": 20 }
{ "type": "show_action", "label": "Visit example", "action_type": "link", "target": "https://..." }
{ "type": "qa_answer_chunk", "text": "Depreciation is a non-cash…" } // stream
{ "type": "qa_answer_done" }
{ "type": "resume", "from_block_id": 12 }
{ "type": "session_complete" }
{ "type": "error", "message": "..." }
```

### Client → Server
```jsonc
{ "type": "raise_hand" }                               // opens Q&A, pauses avatar
{ "type": "submit_question", "text": "How does depreciation…?" }
// voice input: send binary audio frames after { "type": "audio_start" } … { "type": "audio_end" }
{ "type": "skip_to_section", "block_id": 7 }           // bookmark block id
{ "type": "pause" }
{ "type": "resume" }
{ "type": "heartbeat" }
```

### Q&A sequence (text or voice)
1. Client `raise_hand` → server interrupts avatar, sends `avatar_speaking: stop`.
2. Client `submit_question` (or audio frames → server STT → text).
3. Server runs RAG → streams `qa_answer_chunk`… `qa_answer_done` (chat shows text immediately).
4. Server `driver.speak(answer)` → `avatar_speaking: start` → on stop, sends `resume` and continues the script from the paused block.
5. Server writes a `qa_log` (via Laravel or shared DB).

---

## 10. Media Inserts & Action Buttons (stretch, simple)

Not core MVP per the product brief, but the mechanism is trivial and the designs include them:
- **Media insert:** FastAPI sends `show_media`; the SPA fills the frame from the CDN and applies a CSS transform to shrink the live avatar video into a lower-right PiP. The avatar keeps speaking `payload.spoken_text`. No provider involvement.
- **Action button:** FastAPI sends `show_action`; the SPA renders the overlay card. Click handling (open link / skip / download) is pure frontend.

Build the WS messages and renderers; the heavy work (video) is unaffected.

---

## 11. Avatar Provider Integration

**Recommended provider: HeyGen LiveAvatar (Streaming Avatar).** Tavus CVI is a viable conversational-first alternative.

### Recommended orchestration: Pipecat (Python)
Use **Pipecat** inside `ai-service/` as the real-time framework. Its HeyGen service handles bidirectional WebRTC streaming, voice-activity detection, and conversation interruption out of the box — so you don't hand-roll the VAD + interrupt + STT/TTS plumbing. The browser connects via Pipecat's client transport. Alternatively, use HeyGen's raw `@heygen/streaming-avatar` SDK on the client and drive `speak`/`interrupt` from FastAPI.

### Driver interface (provider-swappable — same idea as a payment driver)
```python
class AvatarDriverInterface(Protocol):
    async def start_session(self, avatar_id: str, voice_id: str, background: str) -> AvatarSession: ...
    async def speak(self, text: str) -> None:          # REPEAT mode: avatar says exactly this
        ...
    async def interrupt(self) -> None:                  # stop current speech immediately
        ...
    async def end_session(self) -> None: ...
    # events: on AVATAR_START_TALKING / AVATAR_STOP_TALKING
```
Implement `HeyGenDriver` first. Keep all provider specifics behind this interface.

### Key facts & gotchas
- **REPEAT mode** = you generate the answer (via your RAG/LLM) and send it as text for the avatar to say verbatim. This is exactly how Onteach's Q&A and scripted delivery work.
- **Interrupt endpoint exists** (`v1/streaming.interrupt`) but **only stops the currently spoken task**, not a queue → feed one block at a time (see §7).
- **Events** `AVATAR_START_TALKING` / `AVATAR_STOP_TALKING` drive block advancement.
- **Barge-in** ("just start speaking") needs VAD on the mic stream → Pipecat handles this. For first cut, the explicit **Raise Hand button** is the safer interrupt path; add always-listening barge-in as a fast-follow.
- **Never expose the provider API key to the browser.** FastAPI creates the session token server-side; the WebRTC media stream still flows provider → browser.
- **Cost & concurrency are hard limits, not technical blockers.** LiveAvatar bills roughly $0.10 per 30–60s of streaming (~$6–12/hour per concurrent student) and plans cap concurrent sessions (trial 3; paid tiers ~5–20). Fine for 1-on-1; a 100-student live classroom is where it bites. If costs pressure later, the optimization is hybrid: pre-render scripted blocks, go live only for Q&A.

---

## 12. Environment Variables

### `backend/.env`
```
APP_KEY=
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=onteach
DB_USERNAME=
DB_PASSWORD=
REDIS_HOST=127.0.0.1
QUEUE_CONNECTION=redis
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET=
AWS_ENDPOINT=                 # set for Cloudflare R2
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
AI_SERVICE_URL=http://127.0.0.1:8001
SESSION_JWT_SECRET=           # shared with FastAPI
```

### `ai-service/.env`
```
SESSION_JWT_SECRET=           # same value as Laravel
LARAVEL_INTERNAL_URL=http://127.0.0.1:8000
QDRANT_URL=http://127.0.0.1:6333
REDIS_URL=redis://127.0.0.1:6379
ANTHROPIC_API_KEY=            # or OPENAI_API_KEY
DEEPGRAM_API_KEY=
HEYGEN_API_KEY=
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
```

### `frontend/.env`
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8001
```

---

## 13. Local Setup & Run

```bash
# infra (mysql, redis, qdrant)
docker compose -f infra/docker-compose.yml up -d

# backend (Laravel)
cd backend
composer install
cp .env.example .env && php artisan key:generate
php artisan migrate
php artisan serve --port=8000          # API
php artisan queue:work                 # jobs (separate terminal)

# ai-service (FastAPI)
cd ai-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001

# frontend (React)
cd frontend
npm install
npm run dev                            # http://localhost:5173
```

### Single-server deploy (nginx routing — "both in one box")
```nginx
server {
    server_name app.onteach.io;

    location /api/      { proxy_pass http://127.0.0.1:8000; }   # Laravel (PHP-FPM)
    location /ai/       { proxy_pass http://127.0.0.1:8001; }   # FastAPI (uvicorn)
    location /ai/session/ {                                      # WebSocket upgrade
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    location /          { root /var/www/onteach/frontend/dist; try_files $uri /index.html; }
}
```
On DigitalOcean via Forge: Laravel as a normal site + queue worker daemon; run FastAPI as a separate uvicorn/gunicorn daemon (supervisor); build the frontend to static and serve from nginx.

---

## 14. Build Order (Milestones)

Build in this sequence — each milestone is demoable.

1. **Foundation** — monorepo, Laravel auth (email + Google) + `users`, session CRUD, React shell with routing + auth guard. Screens 1.1–1.3, 2.1 skeleton.
2. **Script editor** — `script_blocks` model + `GET/PUT /blocks`, the drag-drop block editor with settings panel and autosave. Screen 1.7.
3. **Upload + script generation** — S3 uploads, `IngestUploadsJob`, FastAPI `/generate-script`, the loading screen polling the job. Screens 1.4–1.6.
4. **RAG** — FastAPI `/ingest` + Qdrant, RAG query path (test in isolation with a fake question before wiring the avatar).
5. **Avatar + live session core** — `AvatarDriverInterface` + `HeyGenDriver` (via Pipecat), the orchestrator state machine, the full WebSocket protocol, the student player rendering the stream + reacting to control messages. Screens 3.1–3.3.
6. **Interactions** — raise-hand Q&A loop (3.6, 3.7), skip-to-section (3.8), pause/resume + complete (3.9). Stretch: media insert (3.4) + action button (3.5).
7. **Publish & distribution** — `/publish`, slug generation, share + embed links, cover image gen, the embeddable player. Screens 1.8–1.10.
8. **Dashboard & logs** — stat cards, recent sessions, session detail, `qa_logs`. Screens 2.1–2.2.

---

## 15. Consolidated Gotchas & Constraints

- **Feed the avatar one block at a time** and wait for `AVATAR_STOP_TALKING` — interrupt only kills the current task, not a queue.
- **Stream the Q&A answer text to the chat panel immediately** while the avatar catches up — this masks 2–5s of STT→retrieve→LLM→speak latency. The UX depends on it.
- **Avatar API key stays server-side.** Media plane = provider→browser (WebRTC); control plane = browser↔FastAPI (WebSocket). FastAPI never proxies video.
- **One live avatar session per concurrent student** = real per-minute cost + plan-level concurrency caps. Fine for individual mode; reassess before group mode.
- **Two shared secrets must match** across Laravel and FastAPI: `SESSION_JWT_SECRET` (token validation) and the S3 bucket creds (both read uploads).
- **No student accounts** — name only at join; progress in `localStorage` (does not cross devices, acceptable tradeoff).
- **Use Deepgram streaming, not batch Whisper**, for live voice input.
- **Barge-in via VAD** is the one genuinely fiddly part — ship the Raise Hand button first, add always-listening later (Pipecat covers it).
```