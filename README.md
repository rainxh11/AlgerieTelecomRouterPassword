# Algérie Télécom's Fiberhome HG6145F1 Password Generator

A React Router v7 Framework Mode application that generates admin passwords for Fiberhome HG6145F1 routers used by Algérie Télécom.

## Stack

- React Router v7 Framework Mode with SSR
- React 19
- Vite 8
- Tailwind CSS
- Single Node-based server for both HTML and API responses
- Docker Compose for containerized deployment

## Quick Start

### Docker Compose

```bash
docker compose -f docker-compose.local.yml up --build
```

The application will be available at `http://localhost:3000`.

### Local Development

```bash
cd frontend
npm install
npm run dev
```

The React Router dev server runs on `http://localhost:3000` and serves both the UI and API routes.

## Build and Run

```bash
cd frontend
npm run build
npm run start
```

The production server listens on `PORT` and defaults to `8000`.

## API Endpoints

### `POST /api/generate`

Request body:

```json
{
  "mac": "AA:BB:CC:DD:EE:FF"
}
```

Success response:

```json
{
  "mac": "AA:BB:CC:DD:EE:FF",
  "password": "generated-password",
  "success": true
}
```

Error response:

```json
{
  "success": false,
  "error": "Invalid MAC address format. Expected format: AA:BB:CC:DD:EE:FF"
}
```

### `GET /health`

Response:

```json
{
  "status": "ok"
}
```

## Project Structure

```text
FiberHomePasswordGenerator/
├── cli_version/              # CLI-only Go reference implementation
├── frontend/
│   ├── app/
│   │   ├── lib/
│   │   │   ├── password.js
│   │   │   └── password.server.js
│   │   ├── routes/
│   │   │   ├── _index.jsx
│   │   │   ├── api.generate.js
│   │   │   └── health.js
│   │   ├── app.css
│   │   ├── root.jsx
│   │   └── routes.ts
│   ├── react-router.config.ts
│   ├── vite.config.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── docker-compose.local.yml
└── README.md
```

## Rendering Strategy

- Runtime SSR is enabled in `frontend/react-router.config.ts`.
- The index route prerender toggle is controlled in `frontend/react-router.config.ts` via the checked-in `PRERENDER_INDEX_ROUTE` constant.
- `/api/generate` and `/health` are implemented as React Router server routes, so no reverse proxy or separate backend service is required.

## Credits

The original password generation algorithm was created by [@theeyepatch07](https://github.com/theeyepatch07/HG6145F1_PasswordGen).

This project decompiled the original APK, extracted the algorithm, and now serves both the web UI and API from a single React Router server.

## Contributing

Have password generation methods for other Algérie Télécom routers?

Please share them in our Telegram group: [FTTH Algeria Group](https://t.me/FTTHALGERIAGROUP)

## Source Code

[https://github.com/rainxh11/AlgerieTelecomRouterPassword](https://github.com/rainxh11/AlgerieTelecomRouterPassword)

## License

MIT
