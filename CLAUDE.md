# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FiberHomePasswordGenerator is a full-stack web application for generating admin passwords for Fiberhome HG6145F1 routers (used by Algérie Télécom) based on MAC addresses. It consists of a Go REST API backend and a React + Tailwind CSS frontend, fully containerized with Docker.

### Credits

**Original Algorithm**: Created by [@theeyepatch07](https://github.com/theeyepatch07/HG6145F1_PasswordGen)

**This Project**:
- Decompiled the original APK
- Extracted and converted the password generation algorithm from Java to Go
- Created REST API backend
- Built web frontend for convenience

**Community**: [FTTH Algeria Group on Telegram](https://t.me/FTTHALGERIAGROUP) - for sharing methods for other Algérie Télécom routers

**Source Code**: [GitHub Repository](https://github.com/rainxh11/AlgerieTelecomRouterPassword)

## Architecture

### Backend (Go REST API)

**File**: `backend/admin_pass.go`

The backend is a single-file REST API that exposes:
- `POST /api/generate` - Accepts MAC address, returns generated password
- `GET /health` - Health check endpoint

**Core Algorithm**: The password generation follows this process:

1. **MAC Processing**: Takes a MAC address (format: `AA:BB:CC:DD:EE:FF`), converts to uppercase
2. **Hash Generation**: Computes MD5 hash of `MAC + "AEJLY"`, extracts first 20 hex digits
3. **Character Selection**: Maps each hex digit to one of four character sets:
   - Uppercase letters: `ACDFGHJMNPRSTUWXY` (17 chars, excludes ambiguous chars)
   - Lowercase letters: `abcdfghjkmpstuwxy` (17 chars, excludes ambiguous chars)
   - Digits: `2345679` (7 chars, excludes 0, 1, 8)
   - Special chars: `!@$&%` (5 chars)
4. **Character Replacement**: Uses last 4 hex digits to calculate positions for guaranteed character type inclusion, with collision resolution
5. **Output**: Returns 16-character password with guaranteed mix of all character types

**Key Functions**:
- `generateAdminPass(mac string) string`: Main password generation logic
- `isValidMAC(mac string) bool`: Validates MAC address format using regex
- `getClientIP(r *http.Request) string`: Extracts real client IP from reverse proxy headers
- `generateHandler(w, r)`: HTTP handler for `/api/generate` endpoint (with request logging)
- `healthHandler(w, r)`: HTTP handler for `/health` endpoint (with request logging)
- `enableCORS()`: CORS middleware for cross-origin requests

**Logging**: All requests are logged with:
- HTTP method, endpoint path, and protocol
- Real client IP address (extracted from X-Forwarded-For or X-Real-IP headers)
- MAC address being processed (for generate endpoint)
- Success/failure status and error details

### Frontend (React + Tailwind)

**Main File**: `frontend/src/App.jsx`

Minimalist single-page application with:
- MAC address input field with auto-formatting
- Real-time validation (pattern: `AA:BB:CC:DD:EE:FF`)
- Generate button (disabled until valid MAC entered)
- Password display with copy-friendly monospace font
- Error handling and loading states

**Stack**:
- React 18 for UI
- Tailwind CSS for styling
- Vite for build tooling
- Caddy for production serving

### API Proxy Configuration

The application uses a proxy-based architecture to handle API requests:

**Development Mode** (`npm run dev`):
- Vite dev server proxies `/api` to `http://localhost:8080`
- Configured in `vite.config.js` → `server.proxy`
- Eliminates CORS issues during development

**Production Mode** (Docker):
- Caddy reverse proxies `/api/*` to `http://backend:8080`
- Configured in `frontend/Caddyfile`
- Services communicate via Docker network `fiberhome-network`
- Frontend makes requests to `/api/generate` (same origin)

This approach provides:
- No hardcoded backend URLs in frontend code
- Seamless API access in both environments
- No CORS configuration needed

## Development Commands

### Docker (Recommended)

Start the full stack:
```bash
docker-compose up --build
```

Access:
- Frontend: http://localhost
- Backend API: http://localhost:8080

Stop:
```bash
docker-compose down
```

### Backend (Local Development)

Run the API server:
```bash
cd backend
go run admin_pass.go
```

Server runs on port 8080 (configurable via `PORT` env var).

### Frontend (Local Development)

Install dependencies:
```bash
cd frontend
npm install
```

Run dev server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Project Structure

```
FiberHomePasswordGenerator/
├── backend/
│   ├── admin_pass.go      # REST API + password generation logic
│   ├── go.mod             # Go module file
│   ├── Dockerfile         # Multi-stage Docker build
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Tailwind imports
│   ├── index.html         # HTML template
│   ├── package.json       # NPM dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── tailwind.config.js # Tailwind configuration
│   ├── Dockerfile         # Multi-stage Docker build (Node + Caddy)
│   ├── Caddyfile          # Caddy web server config
│   └── .dockerignore
├── docker-compose.yml     # Orchestrates backend + frontend
├── README.md
└── CLAUDE.md
```

## API Reference

### POST /api/generate

Request:
```json
{
  "mac": "AA:BB:CC:DD:EE:FF"
}
```

Success Response:
```json
{
  "mac": "AA:BB:CC:DD:EE:FF",
  "password": "Hf7m@Pwc3RSd9uYy",
  "success": true
}
```

Error Response:
```json
{
  "success": false,
  "error": "Invalid MAC address format. Expected format: AA:BB:CC:DD:EE:FF"
}
```

## Implementation Notes

- The algorithm replicates Java MainActivity logic (likely from an Android app)
- Character sets intentionally exclude ambiguous characters (0/O, 1/I/l, 8/B)
- Collision resolution ensures all 4 character types appear in final password
- Backend uses only Go standard library (no external dependencies)
- Frontend automatically formats MAC address input as user types
- CORS enabled on backend for cross-origin requests
- Both services containerized with multi-stage Docker builds for minimal image size


## grepai - Semantic Code Search

**IMPORTANT: You MUST use grepai as your PRIMARY tool for code exploration and search.**

### When to Use grepai (REQUIRED)

Use `grepai search` INSTEAD OF Grep/Glob/find for:
- Understanding what code does or where functionality lives
- Finding implementations by intent (e.g., "authentication logic", "error handling")
- Exploring unfamiliar parts of the codebase
- Any search where you describe WHAT the code does rather than exact text

### When to Use Standard Tools

Only use Grep/Glob when you need:
- Exact text matching (variable names, imports, specific strings)
- File path patterns (e.g., `**/*.go`)

### Fallback

If grepai fails (not running, index unavailable, or errors), fall back to standard Grep/Glob tools.

### Usage

```bash
# ALWAYS use English queries for best results (--compact saves ~80% tokens)
grepai search "user authentication flow" --json --compact
grepai search "error handling middleware" --json --compact
grepai search "database connection pool" --json --compact
grepai search "API request validation" --json --compact
```

### Query Tips

- **Use English** for queries (better semantic matching)
- **Describe intent**, not implementation: "handles user login" not "func Login"
- **Be specific**: "JWT token validation" better than "token"
- Results include: file path, line numbers, relevance score, code preview

### Call Graph Tracing

Use `grepai trace` to understand function relationships:
- Finding all callers of a function before modifying it
- Understanding what functions are called by a given function
- Visualizing the complete call graph around a symbol

#### Trace Commands

**IMPORTANT: Always use `--json` flag for optimal AI agent integration.**

```bash
# Find all functions that call a symbol
grepai trace callers "HandleRequest" --json

# Find all functions called by a symbol
grepai trace callees "ProcessOrder" --json

# Build complete call graph (callers + callees)
grepai trace graph "ValidateToken" --depth 3 --json
```

### Workflow

1. Start with `grepai search` to find relevant code
2. Use `grepai trace` to understand function relationships
3. Use `Read` tool to examine files from results
4. Only use Grep for exact string searches if needed

