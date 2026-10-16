FROM node:24-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Production-only dependency tree. A clean `--omit=dev` install drops the build
# toolchain (tsx, railway, @types/node — typescript itself stays, Prisma depends
# on it) while keeping the Prisma CLI the container needs for `migrate deploy`.
# Generating the client here rather than copying it out of `build` keeps all of
# node_modules in a single layer instead of a ~77 MB overwrite on top of it.
FROM base AS prod-deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY fonts ./fonts
COPY prisma ./prisma
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate resolve --rolled-back 20260920193000_add_product_variants >/dev/null 2>&1 || true; npx prisma migrate deploy && node dist/index.js"]
