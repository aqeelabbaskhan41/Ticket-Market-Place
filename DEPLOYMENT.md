# Deployment Guide for Hostinger VPS (KV2)

## 1. Server Preparation
- Install Node.js (v18+) and npm.
- Install PM2 globally: `npm install -g pm2`.
- Install Nginx for reverse proxy.

## 2. Clone and Setup
```bash
git clone https://github.com/aqeelabbaskhan41/Ticket-Market-Place.git
cd Ticket-Market-Place

# Backend Setup
cd BackEnd
npm install
# Ensure .env is set up with MongoDB Atlas URI

# Frontend Setup
cd ../frontend
npm install
npm run build
```

## 3. Storage Setup (100GB KV2)
Ensure the uploads directory exists in the backend:
```bash
mkdir -p BackEnd/uploads
chmod 755 BackEnd/uploads
```

## 4. Run with PM2
In the project root:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 5. Nginx Configuration
Configure Nginx to proxy `https://tixtradershub.com` to `localhost:3000` and `https://api.tixtradershub.com` to `localhost:5000`.
