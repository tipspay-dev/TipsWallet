#!/bin/bash

# TipsWallet Deployment Script for Docker
# Usage: ./deploy.sh [action]
# Actions: build, push, deploy, stop, logs, clean

set -e

# Configuration
REGISTRY="${DOCKER_REGISTRY:-localhost}"
IMAGE_NAME="tipswallet"
IMAGE_TAG="${DOCKER_TAG:-latest}"
CONTAINER_NAME="tipswallet-app"
PORT="${DOCKER_PORT:-3000}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Build Docker image
build() {
    log_info "Building Docker image: $REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
    docker build -t $REGISTRY/$IMAGE_NAME:$IMAGE_TAG .
    log_info "Build complete!"
}

# Push to registry (optional)
push() {
    if [ "$REGISTRY" == "localhost" ]; then
        log_warn "Skipping push - using local registry"
        return
    fi
    log_info "Pushing image to $REGISTRY"
    docker push $REGISTRY/$IMAGE_NAME:$IMAGE_TAG
    log_info "Push complete!"
}

# Deploy container
deploy() {
    log_info "Deploying container..."
    
    # Stop existing container if running
    if docker ps | grep -q $CONTAINER_NAME; then
        log_info "Stopping existing container..."
        docker stop $CONTAINER_NAME
    fi
    
    # Remove existing container if present
    if docker ps -a | grep -q $CONTAINER_NAME; then
        log_info "Removing existing container..."
        docker rm $CONTAINER_NAME
    fi
    
    # Run new container
    log_info "Starting new container..."
    docker run -d \
        --name $CONTAINER_NAME \
        --restart unless-stopped \
        -p $PORT:3000 \
        $REGISTRY/$IMAGE_NAME:$IMAGE_TAG
    
    log_info "Container deployed successfully!"
    log_info "App is running on port $PORT"
    docker ps | grep $CONTAINER_NAME
}

# Stop container
stop() {
    log_info "Stopping container..."
    if docker ps | grep -q $CONTAINER_NAME; then
        docker stop $CONTAINER_NAME
        log_info "Container stopped"
    else
        log_warn "Container not running"
    fi
}

# View logs
logs() {
    log_info "Showing logs for $CONTAINER_NAME..."
    docker logs -f $CONTAINER_NAME
}

# Clean up
clean() {
    log_info "Cleaning up..."
    stop
    if docker ps -a | grep -q $CONTAINER_NAME; then
        docker rm $CONTAINER_NAME
        log_info "Container removed"
    fi
    if docker images | grep -q $IMAGE_NAME; then
        docker rmi $REGISTRY/$IMAGE_NAME:$IMAGE_TAG
        log_info "Image removed"
    fi
}

# Main
case "${1:-deploy}" in
    build)
        build
        ;;
    push)
        build
        push
        ;;
    deploy)
        build
        deploy
        ;;
    stop)
        stop
        ;;
    logs)
        logs
        ;;
    clean)
        clean
        ;;
    *)
        echo "Usage: $0 {build|push|deploy|stop|logs|clean}"
        echo ""
        echo "Actions:"
        echo "  build   - Build Docker image"
        echo "  push    - Build and push to registry"
        echo "  deploy  - Build and deploy container (default)"
        echo "  stop    - Stop running container"
        echo "  logs    - View container logs"
        echo "  clean   - Remove container and image"
        exit 1
        ;;
esac
