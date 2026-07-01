# ============================================================
# Stage 1 — deps: install production dependencies only
# ============================================================
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev


# ============================================================
# Stage 2 — builder: build the Next.js application
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy production deps from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full source
COPY . .

# Build-time secrets passed as ARGs (populated by CI/CD or docker build --build-arg)
ARG UPSTASH_REDIS_REST_URL
ARG UPSTASH_REDIS_REST_TOKEN
ARG JWT_SECRET
ARG NEXT_PUBLIC_FRAG_CONTRACT_ID
ARG NEXT_PUBLIC_TREASURY_CONTRACT_ID
ARG NEXT_PUBLIC_YIELD_CONTRACT_ID

ENV UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL
ENV UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN
ENV JWT_SECRET=$JWT_SECRET
ENV NEXT_PUBLIC_FRAG_CONTRACT_ID=$NEXT_PUBLIC_FRAG_CONTRACT_ID
ENV NEXT_PUBLIC_TREASURY_CONTRACT_ID=$NEXT_PUBLIC_TREASURY_CONTRACT_ID
ENV NEXT_PUBLIC_YIELD_CONTRACT_ID=$NEXT_PUBLIC_YIELD_CONTRACT_ID

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build


# ============================================================
# Stage 3 — runner: minimal production image
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy Next.js standalone server output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Copy public directory (icons, images, fonts, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
