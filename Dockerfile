# Development Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install Git (for git hooks setup)
RUN apk add --no-cache git

# Install dependencies first (for caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Environment variables (defaults for development)
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Start development server
CMD ["npm", "run", "dev"]
