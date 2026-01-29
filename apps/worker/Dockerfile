FROM node:22-alpine

# Cache buster - update to force rebuild
ARG CACHE_BUST=2026-01-29-v2

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (need devDeps for build)
RUN npm ci

# Copy source
COPY tsconfig.json ./
COPY src/ ./src/

# Build
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "dist/index.js"]
