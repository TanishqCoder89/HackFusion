# NexaHire - single container: builds the React app, then serves it and the API from Express.
# The code-runner needs g++ and python3 at runtime, so the final image installs them.

FROM node:20-bookworm-slim AS frontend
WORKDIR /app/Frontend
COPY Frontend/package*.json ./
RUN npm ci
COPY Frontend/ ./
RUN npm run build

FROM node:20-bookworm-slim
ENV NODE_ENV=production
RUN apt-get update \
 && apt-get install -y --no-install-recommends g++ python3 \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app/Backend
COPY Backend/package*.json ./
RUN npm ci --omit=dev
COPY Backend/ ./
COPY --from=frontend /app/Frontend/dist /app/Frontend/dist
RUN mkdir -p uploads/violations && chown -R node:node /app
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD node -e "fetch('http://localhost:'+(process.env.PORT||5000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
