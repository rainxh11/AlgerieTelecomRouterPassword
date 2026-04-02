# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

FiberHomePasswordGenerator is a React Router v7 Framework Mode application for generating admin passwords for Fiberhome HG6145F1 routers used by Algérie Télécom. The app now runs as a single Node server that handles both SSR page rendering and JSON API responses.

### Credits

**Original Algorithm**: Created by [@theeyepatch07](https://github.com/theeyepatch07/HG6145F1_PasswordGen)

**This Project**:
- Decompiled the original APK
- Extracted the password generation algorithm from Java
- Serves the UI and API from one React Router server

**Community**: [FTTH Algeria Group on Telegram](https://t.me/FTTHALGERIAGROUP)

**Source Code**: [GitHub Repository](https://github.com/rainxh11/AlgerieTelecomRouterPassword)

## Architecture

### React Router Server

The web application lives entirely under `frontend/` and uses React Router framework conventions:

- `frontend/react-router.config.ts`: enables SSR and controls prerendering for `/`
- `frontend/app/root.jsx`: root HTML document and shared app shell
- `frontend/app/routes.ts`: route manifest
- `frontend/app/routes/_index.jsx`: homepage UI
- `frontend/app/routes/api.generate.js`: `POST /api/generate`
- `frontend/app/routes/health.js`: `GET /health`
- `frontend/app/lib/password.server.js`: server-side password generation, request parsing, IP extraction, and logging

### Password Algorithm

The password generation flow is unchanged:

1. Normalize the MAC address to uppercase
2. Hash `MAC + "AEJLY"` with MD5
3. Use the first 20 hex digits to build a 16-character password
4. Force inclusion of uppercase, lowercase, digit, and special characters by replacing four positions
5. Resolve collisions so the forced positions stay unique

Character sets:

- Uppercase: `ACDFGHJMNPRSTUWXY`
- Lowercase: `abcdfghjkmpstuwxy`
- Digits: `2345679`
- Specials: `!@$&%`

### API Surface

- `POST /api/generate`
- `GET /health`

These endpoints are served directly by the React Router app server, so there is no proxy layer or separate backend service.

## Development Commands

### Docker

Start the containerized app locally:

```bash
docker compose -f docker-compose.local.yml up --build
```

### Frontend

Install dependencies:

```bash
cd frontend
npm install
```

Run the SSR dev server:

```bash
npm run dev
```

Build and run production output:

```bash
npm run build
npm run start
```

## Project Structure

```text
FiberHomePasswordGenerator/
├── cli_version/               # CLI-only Go reference implementation
├── frontend/
│   ├── app/
│   │   ├── lib/
│   │   ├── routes/
│   │   ├── app.css
│   │   ├── root.jsx
│   │   └── routes.ts
│   ├── react-router.config.ts
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── docker-compose.local.yml
├── README.md
└── AGENTS.md
```

## Implementation Notes

- Runtime SSR is enabled by default.
- The checked-in `PRERENDER_INDEX_ROUTE` constant in `frontend/react-router.config.ts` toggles whether `/` is pre-rendered at build time.
- The homepage still does client-side `fetch("/api/generate")` so the UX remains the same.
- Request logging preserves method, path, client IP, and high-level outcome details.
- `cli_version/` remains as a Go reference and is not part of the deployed web stack.


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
