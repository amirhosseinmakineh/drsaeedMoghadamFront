# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS build
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG WEBPUSH_VAPID_PUBLIC_KEY=""
ARG ANGULAR_CONFIGURATION="production"
ENV WEBPUSH_VAPID_PUBLIC_KEY=$WEBPUSH_VAPID_PUBLIC_KEY \
    REQUIRE_WEBPUSH_CONFIG=true

RUN npm run optimize:images \
    && node scripts/generate-webpush-config.mjs \
    && npx ng build --configuration "$ANGULAR_CONFIGURATION" \
    && node scripts/validate-webpush-config.mjs \
    && npm prune --omit=dev --ignore-scripts \
    && npm cache clean --force

FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD ["node", "-e", "fetch('http://127.0.0.1:3000/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]

CMD ["node", "dist/demo/server/server.mjs"]
