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

## 2. Cloning/Updating the Repository
If you haven't cloned yet:
```bash
git clone https://github.com/aqeelabbaskhan41/Ticket-Market-Place.git
cd Ticket-Market-Place
```
If you already cloned, pull the latest changes (after pushing from local):
```bash
git pull origin main
```

## 3. Backend Deployment
```bash
# Run from the project root!
npm install --prefix BackEnd
pm2 start ecosystem.config.js --env production
pm2 save
```

## 4. Frontend Deployment
```bash
# Run from the project root or frontend folder
cd frontend
npm install
npm run build
pm2 start npm --name "ticket-marketplace-frontend" -- start
pm2 save
```

## 5. Storage
Your file storage path is configured as `BackEnd/uploads`. With 100GB storage, this will handle thousands of ticket and match images.

## 6. Nginx Configuration
Setup Nginx to point your domain to the respective ports:
```nginx
server {
    listen 80;
    server_name tixtradershub.com www.tixtradershub.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
```
