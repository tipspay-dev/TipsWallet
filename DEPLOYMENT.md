# TipsWallet Docker Deployment Guide

## Quick Start

### On Your VM (209.74.86.12:22022)

1. **Install Docker and Docker Compose (if not already installed)**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

2. **Upload Project to VM**
   ```bash
   # From your local machine
   scp -P 22022 -r /path/to/TipsWallet root@209.74.86.12:/opt/tipswallet
   ```

3. **Connect to VM and Deploy**
   ```bash
   ssh -p 22022 root@209.74.86.12
   cd /opt/tipswallet
   chmod +x deploy.sh
   ./deploy.sh deploy
   ```

4. **Access the Application**
   - Navigate to: `http://209.74.86.12:3000`

---

## Deployment Commands

### Build Only
```bash
./deploy.sh build
```
Builds the Docker image without deploying.

### Full Deployment
```bash
./deploy.sh deploy
```
Builds the image and starts the container with auto-restart.

### View Logs
```bash
./deploy.sh logs
```
Shows real-time logs from the running container.

### Stop Container
```bash
./deploy.sh stop
```
Gracefully stops the running container.

### Clean Everything
```bash
./deploy.sh clean
```
Removes the container and image.

---

## Environment Configuration

### Port Configuration
Default port is `3000`. To use a different port:
```bash
DOCKER_PORT=8080 ./deploy.sh deploy
```

### Custom Registry
If using a private Docker registry:
```bash
DOCKER_REGISTRY=registry.example.com ./deploy.sh push
DOCKER_REGISTRY=registry.example.com ./deploy.sh deploy
```

---

## Using Docker Compose (Alternative)

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  tipswallet:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
    container_name: tipswallet-app
    # Uncomment for environment variables
    # environment:
    #   - REACT_APP_API_URL=http://api.example.com
```

Deploy with:
```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
sudo lsof -i :3000
sudo kill -9 <PID>

# Or use different port
DOCKER_PORT=8080 ./deploy.sh deploy
```

### Container Won't Start
```bash
# Check logs
docker logs tipswallet-app

# Rebuild from scratch
./deploy.sh clean
./deploy.sh deploy
```

### Permission Denied
```bash
chmod +x deploy.sh
```

### Check Container Status
```bash
docker ps -a
docker inspect tipswallet-app
```

---

## Production Considerations

### 1. Health Checks
Add to Dockerfile or docker-compose.yml:
```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### 2. Resource Limits
```bash
docker run -d \
  --memory="512m" \
  --cpus="1" \
  --name tipswallet-app \
  -p 3000:3000 \
  tipswallet:latest
```

### 3. Reverse Proxy (Nginx)
Configure Nginx on host to proxy requests:
```nginx
server {
    listen 80;
    server_name 209.74.86.12;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. SSL/TLS
Use Let's Encrypt with Certbot:
```bash
sudo certbot certonly --standalone -d 209.74.86.12
```

---

## Monitoring

### View Real-time Logs
```bash
./deploy.sh logs
# or
docker logs -f tipswallet-app
```

### Container Statistics
```bash
docker stats tipswallet-app
```

### Container Details
```bash
docker ps
docker inspect tipswallet-app
```

---

## Backup & Recovery

### Backup Container Data
```bash
docker commit tipswallet-app tipswallet-backup:$(date +%s)
```

### Restore from Backup
```bash
docker run -d -p 3000:3000 tipswallet-backup:timestamp
```

---

## Security Tips

1. **Never expose sensitive keys** - Use environment variables and Docker secrets
2. **Use .dockerignore** - Exclude sensitive files from image
3. **Run as non-root user** (in production)
4. **Keep Docker updated** - `sudo apt update && sudo apt upgrade docker.io`
5. **Use private registries** for production images

---

## Support

For issues with deployment, check:
1. Docker daemon is running: `docker ps`
2. Ports are not in use: `netstat -tulpn | grep 3000`
3. Logs: `./deploy.sh logs`
4. Disk space: `df -h`
