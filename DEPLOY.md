# Deploying Tanks Game to Azure

This guide walks you through deploying the multiplayer Tanks game to Azure using Container Apps.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Azure Container Apps                      │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   tanks-client      │    │      tanks-server           │ │
│  │   (Nginx + React)   │───▶│  (Node.js + Colyseus)       │ │
│  │   Port 80           │    │   Port 3000                 │ │
│  └─────────────────────┘    │   Sticky Sessions ✓         │ │
│                              └─────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Azure Container Registry                    │ │
│  │              (Stores Docker images)                      │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli) installed
- [Docker](https://docs.docker.com/get-docker/) installed
- Azure subscription with permissions to create resources
- Git (to clone this repository)

## Quick Start (5 minutes)

### 1. Clone and Navigate

```bash
git clone https://github.com/guybartal/tanks-game.git
cd tanks-game
```

### 2. Login to Azure

```bash
az login
az account set --subscription "<YOUR_SUBSCRIPTION_ID>"
```

### 3. Create Resource Group

```bash
az group create --name tanks-rg --location eastus
```

### 4. Deploy Infrastructure

```bash
az deployment group create \
  --resource-group tanks-rg \
  --template-file infra/main.bicep \
  --parameters infra/main.parameters.json
```

Save the outputs — you'll need the ACR login server and app URLs.

### 5. Build and Push Docker Images

```bash
# Get ACR credentials
ACR_NAME=$(az deployment group show -g tanks-rg -n main --query properties.outputs.acrName.value -o tsv)
ACR_SERVER=$(az deployment group show -g tanks-rg -n main --query properties.outputs.acrLoginServer.value -o tsv)
SERVER_URL=$(az deployment group show -g tanks-rg -n main --query properties.outputs.serverUrl.value -o tsv)

# Login to ACR
az acr login --name $ACR_NAME

# Build and push server
docker build -t $ACR_SERVER/tanks-server:latest ./server
docker push $ACR_SERVER/tanks-server:latest

# Build and push client (with server URL baked in)
docker build -t $ACR_SERVER/tanks-client:latest \
  --build-arg VITE_SERVER_URL=wss://${SERVER_URL#https://} \
  ./client
docker push $ACR_SERVER/tanks-client:latest
```

### 6. Restart Apps to Pull New Images

```bash
az containerapp revision restart --name tanks-server --resource-group tanks-rg
az containerapp revision restart --name tanks-client --resource-group tanks-rg
```

### 7. Access Your Game

Get the client URL and open it in your browser:

```bash
az deployment group show -g tanks-rg -n main \
  --query properties.outputs.clientUrl.value -o tsv
```

## Detailed Configuration

### Environment Variables

#### Server (`tanks-server`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | HTTP/WebSocket port | `3000` |
| `CORS_ORIGIN` | Allowed CORS origins | Client URL |

#### Client (Build-time)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SERVER_URL` | WebSocket server URL | `wss://tanks-server.example.com` |

### Scaling Configuration

The Bicep template configures auto-scaling based on HTTP requests:

- **Server**: 1-3 replicas, scales at 50 concurrent requests
- **Client**: 1-3 replicas, scales at 100 concurrent requests

To modify scaling:

```bash
az containerapp update \
  --name tanks-server \
  --resource-group tanks-rg \
  --min-replicas 2 \
  --max-replicas 5
```

### Custom Domain

To add a custom domain:

```bash
# Add custom domain to client app
az containerapp hostname add \
  --name tanks-client \
  --resource-group tanks-rg \
  --hostname tanks.yourdomain.com

# Configure DNS CNAME record pointing to the Container App FQDN
# Then bind the certificate
az containerapp hostname bind \
  --name tanks-client \
  --resource-group tanks-rg \
  --hostname tanks.yourdomain.com \
  --environment tanks-env \
  --validation-method CNAME
```

## Local Development with Docker

Test locally before deploying:

```bash
# Build and run with docker-compose
docker-compose up --build

# Access at http://localhost:8080
```

## Troubleshooting

### Check Container Logs

```bash
# Server logs
az containerapp logs show --name tanks-server --resource-group tanks-rg --follow

# Client logs
az containerapp logs show --name tanks-client --resource-group tanks-rg --follow
```

### Common Issues

#### WebSocket Connection Fails

1. Verify sticky sessions are enabled (required for Colyseus)
2. Check CORS configuration includes your client domain
3. Ensure you're using `wss://` (not `ws://`) for HTTPS

#### Images Not Updating

Container Apps caches images. Force a new revision:

```bash
az containerapp update \
  --name tanks-server \
  --resource-group tanks-rg \
  --image $ACR_SERVER/tanks-server:v1.0.1
```

#### 502 Bad Gateway

1. Check health probes are passing: `az containerapp show --name tanks-server -g tanks-rg`
2. Verify the container is starting: check logs for startup errors
3. Ensure PORT environment variable matches the exposed port

## Cost Estimation

Azure Container Apps pricing (East US, as of 2024):

| Resource | Configuration | Est. Monthly Cost |
|----------|---------------|-------------------|
| Container Apps (server) | 0.5 vCPU, 1GB RAM, 1 replica | ~$15 |
| Container Apps (client) | 0.25 vCPU, 0.5GB RAM, 1 replica | ~$8 |
| Container Registry (Basic) | 10GB storage | ~$5 |
| Log Analytics | 5GB/month | ~$12 |
| **Total (minimum)** | | **~$40/month** |

*Costs increase with scaling and traffic.*

## Clean Up

To delete all resources:

```bash
az group delete --name tanks-rg --yes --no-wait
```

## Production Considerations

For a production deployment, consider adding:

1. **Redis** — For session caching and pub/sub (Azure Cache for Redis)
2. **PostgreSQL** — For persistent data (Azure Database for PostgreSQL)
3. **CDN** — For static asset caching (Azure Front Door or CDN)
4. **Monitoring** — Application Insights for APM
5. **Secrets** — Azure Key Vault for sensitive configuration

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full production architecture.
