#!/usr/bin/env bash
set -e

# Run on the Ubuntu VM (not locally). Builds tariqsulehri/nexus-agent from the repo
# root and pushes it to Docker Hub. Requires: docker login, repo checked out at ..
cd "$(dirname "$0")"

IMAGE="tariqsulehri/nexus-agent:latest"

echo "==> Building ${IMAGE}..."
docker compose build

echo "==> Pushing ${IMAGE}..."
docker push "${IMAGE}"

echo "==> Done. Run ./deploy.sh to pull and restart the container."
