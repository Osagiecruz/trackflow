# TrackFlow — Production Shipping Tracker

Full-stack parcel tracking platform. Real-time updates, multi-carrier support, SMS/email notifications, agency dashboard.

## Stack
- **Backend**: Node.js + Express + PostgreSQL + Redis
- **Frontend**: React + Vite + Tailwind
- **Notifications**: Twilio (SMS) + SendGrid (Email)  
- **Maps**: Mapbox GL JS
- **Auth**: JWT + bcrypt
- **Infra**: Docker + Nginx + GitHub Actions CI/CD

## Quick Start (Local Dev)

```bash
# 1. Clone & install
git clone https://github.com/yourorg/trackflow.git
cd trackflow

# 2. Start all services
docker-compose up -d

# 3. Run migrations
cd backend && npm run migrate

# 4. Seed demo data
npm run seed

# 5. Open app
open http://localhost:3000
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your keys.

### Backend (`backend/.env`)
| Key | Description |
|-----|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | 64-char random string |
| `TWILIO_ACCOUNT_SID` | From Twilio Console |
| `TWILIO_AUTH_TOKEN` | From Twilio Console |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number |
| `SENDGRID_API_KEY` | From SendGrid dashboard |
| `SENDGRID_FROM_EMAIL` | Verified sender email |
| `DHL_API_KEY` | DHL Developer Portal |
| `FEDEX_API_KEY` | FedEx Developer Portal |
| `UPS_API_KEY` | UPS Developer Portal |
| `MAPBOX_TOKEN` | Mapbox access token |

### Frontend (`frontend/.env`)
| Key | Description |
|-----|-------------|
| `VITE_API_URL` | Backend URL (e.g. https://api.trackflow.io) |
| `VITE_MAPBOX_TOKEN` | Mapbox public token |

## Project Structure

```
trackflow/
├── backend/
│   ├── src/
│   │   ├── routes/         # Express routers
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   │   ├── carriers/   # DHL, FedEx, UPS adapters
│   │   │   ├── notifications/ # SMS + Email
│   │   │   └── tracking/   # Core tracking engine
│   │   ├── models/         # DB models (Knex)
│   │   ├── middleware/     # Auth, rate-limit, error
│   │   └── utils/          # Helpers
│   ├── migrations/         # DB migrations
│   ├── seeds/              # Demo data
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # API client, helpers
│   └── Dockerfile
├── nginx/                  # Reverse proxy config
├── docker/                 # Docker helpers
├── docker-compose.yml      # Local dev orchestration
├── docker-compose.prod.yml # Production orchestration
└── .github/workflows/      # CI/CD pipelines
```

## API Reference

### Public Endpoints
```
GET  /api/track/:trackingId          — Track a shipment
GET  /api/track/:trackingId/events   — Get all events
```

### Agency Endpoints (JWT required)
```
POST /api/auth/login                 — Login
POST /api/auth/refresh               — Refresh token

POST /api/shipments                  — Create shipment
GET  /api/shipments                  — List all shipments
GET  /api/shipments/:id              — Get shipment details
PUT  /api/shipments/:id              — Update shipment
POST /api/shipments/:id/events       — Add tracking event
POST /api/shipments/:id/notify       — Send notification

GET  /api/analytics/overview         — Dashboard stats
GET  /api/analytics/delivery-rate    — Delivery performance
```

## Deployment

### Production (VPS/Cloud)
```bash
# Copy prod env
cp .env.example .env.prod

# Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d --build
```

### Environment Setup
1. Provision a VPS (DigitalOcean Droplet, AWS EC2, etc.)
2. Install Docker + Docker Compose
3. Point your domain DNS to the server IP
4. Set up SSL with Certbot (included in prod compose)
5. Push to `main` branch — GitHub Actions handles the rest

## Carrier Integration

Carriers are pluggable via the adapter pattern in `backend/src/services/carriers/`.
Each adapter implements:
```js
class CarrierAdapter {
  async track(trackingNumber) { /* returns normalized TrackingResult */ }
  async getLabel(shipmentData) { /* returns PDF buffer */ }
}
```

Currently supported: DHL Express, FedEx International, UPS Worldwide.
Adding a carrier: create `backend/src/services/carriers/yourcarrier.js`.

## License
MIT
