# Algérie Télécom's Fiberhome HG6145F1 Password Generator

A web application to generate admin passwords for Fiberhome HG6145F1 routers (used by Algérie Télécom) based on MAC addresses.

## Features

- Clean, minimalist web interface
- Real-time MAC address validation
- Auto-formatting of MAC address input
- REST API backend in Go
- React + Tailwind CSS frontend
- Fully containerized with Docker

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository
2. Run the application:

```bash
docker-compose up --build
```

3. Open your browser and navigate to `http://localhost`

The backend API will be available at `http://localhost:8080`

### Manual Setup

#### Backend

```bash
cd backend
go run admin_pass.go
```

The API will start on port 8080.

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on port 3000.

## API Endpoints

### Generate Password

**POST** `/api/generate`

Request body:
```json
{
  "mac": "AA:BB:CC:DD:EE:FF"
}
```

Response:
```json
{
  "mac": "AA:BB:CC:DD:EE:FF",
  "password": "generated-password",
  "success": true
}
```

### Health Check

**GET** `/health`

Response:
```json
{
  "status": "ok"
}
```

## Development

### Backend

The backend is a single Go file (`backend/admin_pass.go`) that implements:
- Password generation algorithm
- REST API endpoints
- CORS support

### Frontend

Built with:
- React 18
- Tailwind CSS
- Vite

The frontend provides:
- MAC address input with auto-formatting
- Real-time validation
- Clean, responsive UI

### API Proxy Configuration

The application uses different proxy strategies for development and production:

**Development Mode**: Vite dev server proxies `/api` requests to `http://localhost:8080` (configured in `vite.config.js`)

**Production Mode**: Caddy reverse proxies `/api/*` requests to the backend service (configured in `Caddyfile`)

This eliminates CORS issues and provides a seamless API experience in both environments.

## Credits

### Original Algorithm
The password generation algorithm was created by [@theeyepatch07](https://github.com/theeyepatch07/HG6145F1_PasswordGen).

This project:
- Decompiled the original APK
- Extracted and converted the password generation function to Go
- Created a REST API backend
- Built a web frontend for convenience

### Contributing
Have password generation methods for other Algérie Télécom routers?

Please share them in our Telegram group: [FTTH Algeria Group](https://t.me/FTTHALGERIAGROUP)

We'll add them to this website if possible.

## Source Code

GitHub: [https://github.com/rainxh11/AlgerieTelecomRouterPassword](https://github.com/rainxh11/AlgerieTelecomRouterPassword)

## License

MIT
