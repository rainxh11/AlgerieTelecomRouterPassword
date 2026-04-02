FROM oven/bun:alpine AS base
WORKDIR /app
RUN apk add --no-cache nodejs npm

# Build stage
FROM oven/bun:alpine AS builder
WORKDIR /app
RUN apk add --no-cache nodejs npm

COPY package.json bun.lock* bun.lockb* ./
RUN bun install --frozen-lockfile || bun install

COPY . .
RUN bun run build

# Production stage
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=8000

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8000

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build

EXPOSE 8000

CMD ["npm", "run", "start"]
