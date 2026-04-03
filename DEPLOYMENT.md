# TrackFlow — Production Deployment Guide

Complete step-by-step guide to deploy TrackFlow on a VPS (DigitalOcean, AWS EC2, Hetzner, etc.)

---

## 1. Provision Your Server

Recommended: **DigitalOcean Droplet** or **Hetzner CX21**
- Ubuntu 24.04 LTS
- 2 vCPU / 4GB RAM minimum (4 vCPU / 8GB for production)
- 80GB SSD

```bash
# Create on DigitalOcean (replace with your SSH key ID)
doctl compute droplet create trackflow-prod \
  --size s-2vcpu-4gb \
  --image ubuntu-24-04-x64 \
  --region nyc3 \
  --ssh-keys YOUR_KEY_ID
```

---

## 2. Initial Server Setup

SSH into your server and run:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker ubuntu

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Git
apt install -y git

# Create app directory
mkdir -p /opt/trackflow
cd /opt/trackflow

# Clone your repo
git clone https://github.com/yourorg/trackflow.git .
```

---

## 3. Configure Environment

```bash
cd /opt/trackflow

# Copy env template
cp .env.example .env

# Edit with your real values
nano .env
```

Fill in all values in `.env`. Critical ones:
- `POSTGRES_PASSWORD` — use a strong random password
- `JWT_SECRET` — run `openssl rand -hex 64` and paste the output
- `JWT_REFRESH_SECRET` — run `openssl rand -hex 64` again
- `TWILIO_*` — from https://console.twilio.com
- `SENDGRID_API_KEY` — from https://app.sendgrid.com
- `DHL_API_KEY`, `FEDEX_API_KEY`, `UPS_CLIENT_ID` — from each carrier's developer portal
- `VITE_MAPBOX_TOKEN` — from https://account.mapbox.com

---

## 4. Point Your Domain

In your domain registrar's DNS settings:

```
A    @          YOUR_SERVER_IP
A    www        YOUR_SERVER_IP
A    api        YOUR_SERVER_IP   (optional, if using subdomain for API)
```

Wait for DNS propagation (usually 5–30 minutes).

---

## 5. Get SSL Certificate

```bash
# Install Certbot
apt install -y certbot

# Get certificate (stop nginx first if running)
certbot certonly --standalone -d trackflow.io -d www.trackflow.io

# Certificates will be at:
# /etc/letsencrypt/live/trackflow.io/fullchain.pem
# /etc/letsencrypt/live/trackflow.io/privkey.pem
```

---

## 6. Deploy

```bash
cd /opt/trackflow

# Start all services
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

# (Optional) Load demo data
docker-compose -f docker-compose.prod.yml exec backend npm run seed

# Check everything is running
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f backend
```

---

## 7. Setup GitHub Actions CI/CD

In your GitHub repository, go to **Settings → Secrets → Actions** and add:

| Secret | Value |
|--------|-------|
| `PROD_HOST` | Your server IP address |
| `PROD_USER` | `ubuntu` (or your SSH user) |
| `PROD_SSH_KEY` | Your private SSH key (`cat ~/.ssh/id_rsa`) |
| `VITE_MAPBOX_TOKEN` | Your Mapbox public token |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL (optional) |

After this, every push to `main` will automatically:
1. Run tests
2. Build Docker images
3. Push to GitHub Container Registry
4. SSH into your server and deploy

---

## 8. Register Carrier Webhooks

### DHL
1. Go to https://developer.dhl.com
2. Create an app and get API key
3. Register webhook URL: `https://trackflow.io/api/webhooks/dhl`
4. Select events: `shipment-tracking`

### FedEx
1. Go to https://developer.fedex.com
2. Create a project and get credentials
3. Register webhook URL: `https://trackflow.io/api/webhooks/fedex`

---

## 9. Register Twilio (SMS)

1. Sign up at https://www.twilio.com
2. Get a phone number (~$1/month)
3. Add to `.env`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxx
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
   ```

---

## 10. Register SendGrid (Email)

1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Create an API key with "Mail Send" permission
3. Verify your sender domain in SendGrid settings
4. Add to `.env`:
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@trackflow.io
   ```

---

## 11. Monitoring

```bash
# View live logs
docker-compose -f docker-compose.prod.yml logs -f

# Check resource usage
docker stats

# Database backup
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U trackflow trackflow > backup_$(date +%Y%m%d).sql

# Restart a service
docker-compose -f docker-compose.prod.yml restart backend
```

---

## 12. Firewall Setup

```bash
# Allow only necessary ports
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Block direct database access from internet
ufw deny 5432/tcp
ufw deny 6379/tcp
```

---

## Troubleshooting

**Backend won't start:**
```bash
docker-compose -f docker-compose.prod.yml logs backend
# Check DATABASE_URL and JWT_SECRET are set correctly
```

**SSL certificate issues:**
```bash
certbot renew --dry-run
# Check nginx logs
docker-compose -f docker-compose.prod.yml logs nginx
```

**Database connection failed:**
```bash
docker-compose -f docker-compose.prod.yml exec postgres psql -U trackflow
# Check POSTGRES_PASSWORD matches in .env
```

**Emails not sending:**
```bash
# Check SendGrid API key is valid
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"noreply@trackflow.io"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'
```
