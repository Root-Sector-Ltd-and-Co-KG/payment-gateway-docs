FROM node:24-bookworm-slim AS builder

WORKDIR /app

ENV CI=true

COPY package.json pnpm-lock.yaml ./

RUN corepack enable && corepack prepare pnpm@latest --activate
# Fumadocs runs `fumadocs-mdx` in postinstall; in container builds this can be brittle.
# We intentionally skip lifecycle scripts and rely on `pnpm build` (Next build) to generate MDX.
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .
# Ensure any generated MDX artifacts exist for the build.
RUN pnpm postinstall || true
RUN pnpm build


FROM gcr.io/distroless/nodejs24-debian13:nonroot AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next.js standalone output:
# - .next/standalone contains server.js + traced node_modules
# - .next/static must be copied alongside for static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["server.js"]

