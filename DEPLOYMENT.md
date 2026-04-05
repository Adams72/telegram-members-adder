# Deployment Guide - Telegram Members Adder

This guide covers deploying the Telegram Members Adder application to various hosting platforms.

## Vercel Deployment (Recommended)

Vercel's experimental Services feature allows you to run both Next.js and Python services in one project.

### Prerequisites

- GitHub account with the repository pushed
- Vercel account (free tier works)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Telegram Members Adder Web"
git branch -M main
git remote add origin https://github.com/yourusername/telegram-members-adder.git
git push -u origin main
```

### Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com/dashboard)
2. Click "New Project"
3. Select "Import Git Repository"
4. Choose your `telegram-members-adder` repository
5. Click "Import"

### Step 3: Configure Project Settings

1. **Build Settings:**
   - Framework: Select "Services" from dropdown
   - Root Directory: `.`
   
2. **Environment Variables:**
   - Add any custom env vars if needed
   - Vercel auto-handles `PYTHON_API_URL` for inter-service communication

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app is live at `https://your-project.vercel.app`

### Step 5: Test the Deployment

1. Open your Vercel URL
2. Upload a test CSV file
3. Enter Telegram credentials
4. Test adding a member

## Docker Deployment

If you want to self-host using Docker:

### Create Dockerfile

```dockerfile
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim AS runtime
WORKDIR /app

# Install Node for frontend
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Copy frontend build
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci --only=production

# Copy backend
COPY backend/ ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Expose ports
EXPOSE 3000 8000

# Start both services
CMD ["sh", "-c", "cd backend && python main.py & cd frontend && npm start"]
```

### Build and Run

```bash
docker build -t telegram-members-adder .
docker run -p 3000:3000 -p 8000:8000 telegram-members-adder
```

## Railway Deployment

### Prerequisites

- Railway account (free tier with $5/month credit)
- GitHub repository

### Step 1: Connect Repository

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Connect your GitHub account and select the repository

### Step 2: Configure Services

1. **Add Python Backend Service:**
   - Create new service
   - Connect to `backend/` directory
   - Set start command: `python main.py`
   - Python version: 3.11

2. **Add Next.js Frontend Service:**
   - Create new service
   - Connect to `frontend/` directory
   - Build command: `npm run build`
   - Start command: `npm start`
   - Node version: 18

### Step 3: Configure Environment Variables

In Railway project settings:
```
PYTHON_API_URL=http://localhost:8000
```

### Step 4: Deploy

Click "Deploy" and Railway will automatically build and deploy both services.

## Self-Hosted Linux Server

### Prerequisites

- Linux server (Ubuntu 20.04 or newer)
- Node.js 18+
- Python 3.11+
- Nginx (optional, for reverse proxy)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/telegram-members-adder.git
cd telegram-members-adder

# Install dependencies
cd frontend && npm install && cd ..
cd backend && pip install -r requirements.txt && cd ..

# Create .env file
cat > .env << EOF
PYTHON_API_URL=http://localhost:8000
NODE_ENV=production
EOF
```

### Running Services

**Option 1: Using PM2 (Recommended)**

```bash
npm install -g pm2

# Start backend
pm2 start "python main.py" --name "telegram-adder-backend" --cwd backend

# Start frontend
pm2 start "npm start" --name "telegram-adder-frontend" --cwd frontend

# Save PM2 config
pm2 save
pm2 startup
```

**Option 2: Using Systemd**

Create `/etc/systemd/system/telegram-adder-backend.service`:
```ini
[Unit]
Description=Telegram Members Adder Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/telegram-members-adder/backend
ExecStart=/usr/bin/python3 main.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/telegram-adder-frontend.service`:
```ini
[Unit]
Description=Telegram Members Adder Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/telegram-members-adder/frontend
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start services
sudo systemctl enable telegram-adder-backend
sudo systemctl enable telegram-adder-frontend
sudo systemctl start telegram-adder-backend
sudo systemctl start telegram-adder-frontend
```

### Configure Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## AWS Deployment

### Using Elastic Beanstalk

1. **Prepare for EB:**
   ```bash
   eb init -p "Docker running on 64bit Amazon Linux 2" telegram-adder
   ```

2. **Deploy:**
   ```bash
   eb create telegram-adder-env
   eb deploy
   ```

### Using EC2 + Manual Setup

1. Launch EC2 instance (Ubuntu 20.04)
2. Follow "Self-Hosted Linux Server" section above
3. Configure security groups to allow ports 80, 443
4. Use Route 53 for domain
5. Use ACM for SSL certificates

## Environment Variables

### Frontend Environment Variables

```env
# .env.local in frontend/
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend Environment Variables

```env
# .env in backend/
TELEGRAM_SESSION_DIR=/tmp/sessions
LOG_LEVEL=INFO
```

## Monitoring & Maintenance

### Health Checks

```bash
# Check backend health
curl http://localhost:8000/health

# Check frontend
curl http://localhost:3000
```

### Logs

**Vercel:** View in Vercel dashboard → Deployments → Logs

**Self-hosted:**
```bash
# PM2 logs
pm2 logs

# Systemd logs
journalctl -u telegram-adder-backend -f
journalctl -u telegram-adder-frontend -f
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild frontend
cd frontend && npm install && npm run build

# Restart services
pm2 restart all  # or use systemctl
```

## Troubleshooting Deployment

### Services Not Connecting

**Issue:** Frontend can't reach backend (404 errors)

**Solution:**
1. Verify both services are running
2. Check `PYTHON_API_URL` environment variable
3. Test backend directly: `curl http://backend-url:8000/health`

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Out of Memory

Increase available memory:
```bash
# On Linux, check memory
free -h

# Monitor usage
watch -n 1 free -h
```

### Session File Issues

```bash
# Delete session file to force re-authentication
rm backend/telegram_session.session

# Restart backend
systemctl restart telegram-adder-backend
```

## Performance Optimization

### Frontend Optimization

```javascript
// next.config.ts
const nextConfig = {
  compress: true,
  swcMinify: true,
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
}
```

### Backend Optimization

```python
# main.py - Add caching
from fastapi.middleware.gzip import GZIPMiddleware
app.add_middleware(GZIPMiddleware, minimum_size=1000)
```

## Security Checklist

- [ ] Use HTTPS/SSL in production
- [ ] Set strong environment variables
- [ ] Enable CORS only for your domain
- [ ] Rate limit API endpoints
- [ ] Monitor error logs
- [ ] Keep dependencies updated
- [ ] Use secrets for sensitive data
- [ ] Regular backups of session files

## Support

For deployment issues:
1. Check the application README_WEB.md
2. Review logs for specific errors
3. Test services independently
4. Verify all environment variables are set
5. Check network/firewall configurations
