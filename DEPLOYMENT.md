# Deployment Guide to Hostinger VPS

Follow these steps to deploy the Ticket-Market-Place project to your Hostinger VPS KV2.

## 1. Server Preparation
Connect to your VPS via SSH:
```bash
ssh root@your_vps_ip
```

Install Node.js (if not already installed):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Install PM2 globally:
```bash
npm install pm2 -g
```

## 2. Cloning the Repository
```bash
git clone https://github.com/aqeelabbaskhan41/Ticket-Market-Place.git
cd Ticket-Market-Place
```

## 3. Backend Deployment
```bash
cd BackEnd
npm install
pm2 start ../ecosystem.config.js --env production
pm2 save
```

## 4. Frontend Deployment
```bash
cd ../frontend
npm install
npm run build
pm2 start npm --name "ticket-marketplace-frontend" -- start
pm2 save
```

## 5. Storage
Your file storage path is configured as `BackEnd/uploads`. With 100GB storage, this will handle thousands of ticket and match images.

## 6. Nginx Configuration
Setup Nginx as a reverse proxy to point your domains to the respective ports:
- `api.tixtradershub.com` -> `http://localhost:5000`
- `tixtradershub.com` -> `http://localhost:3000`
