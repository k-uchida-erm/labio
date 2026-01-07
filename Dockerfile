# Development Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install Git (for git hooks setup) and Docker CLI (for Supabase CLI usage)
RUN apk add --no-cache git docker-cli

# Install dependencies first (for caching)
COPY package.json package-lock.json* ./
# lightningcss を使わない前提なので npm ci のみ
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Environment variables (defaults for development)
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
# Lightning CSS を無効化（alpine/arm64-musl でのバイナリ不整合回避）
ENV NEXT_DISABLE_LIGHTNINGCSS=1
ENV LIGHTNINGCSS_WASM=1

# Start development server
CMD ["npm", "run", "dev"]
