# Nexus Agent — image: tariqsulehri/nexus-agent
# Build context is the repo root (see docker-compose.yml: build.context: ..)
FROM node:24-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm run build

FROM node:24-slim AS runner
LABEL org.opencontainers.image.title="nexus-agent"
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/src ./src
# Persistent data volume (nexus_agent_data) is mounted here
RUN mkdir -p /app/data && chown -R node:node /app/data /app/.next
USER node
EXPOSE 3000
CMD ["npm", "start"]
