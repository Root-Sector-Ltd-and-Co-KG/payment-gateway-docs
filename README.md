# Payment Gateway Docs

This project hosts the public product documentation at:

- `https://docs.payment-gateway.app`

It is a Next.js 16 + Fumadocs site deployed to Cloudflare Workers using
`@opennextjs/cloudflare`.

There is no separate public staging deployment for the docs site. The only
published environment is the production site at `docs.payment-gateway.app`.

## Stack

- Runtime: Next.js App Router
- Docs framework: Fumadocs
- Cloudflare adapter: `@opennextjs/cloudflare`
- Deploy target: Cloudflare Workers
- Custom domain: `docs.payment-gateway.app`

## Project Structure

- `app/(home)`: documentation home page and root-level routed docs pages
- `app/api/search/route.ts`: Fumadocs search endpoint
- `app/llms.txt/route.ts`: LLM-friendly docs index
- `app/llms-full.txt/route.ts`: expanded LLM-friendly docs output
- `content/docs`: MDX documentation content
- `lib/source.ts`: Fumadocs content source wiring
- `source.config.ts`: MDX/content collection configuration
- `open-next.config.ts`: OpenNext Cloudflare adapter configuration
- `wrangler.toml`: Cloudflare Worker deployment config

## Development

Install dependencies:

```bash
pnpm install
```

Set up local Cloudflare deployment credentials from the example file:

```bash
cp .cloudflare-secrets.example .cloudflare-secrets.local
```

Run the local dev server:

```bash
pnpm dev
```

The site runs locally on `http://localhost:3000`.

## Validation

Run type generation and TypeScript checks:

```bash
pnpm typecheck
```

Build the production Next.js app locally:

```bash
pnpm build
```

Run the standard local validation sequence:

```bash
pnpm validate
```

## Cloudflare Deployment

The docs site deploys as a Cloudflare Worker using OpenNext.

Production-only deploy command:

```bash
pnpm deploy:cf:production
```

Validate your local Cloudflare credential file and any runtime secrets:

```bash
pnpm secrets:check
```

Run the docs secrets helper:

```bash
pnpm secrets:push
```

These default aliases target production. Production-specific forms are also
available:

```bash
pnpm secrets:check:production
pnpm secrets:push:production
```

The helper validates the local `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` values used by Wrangler, then uploads any additional
non-empty variables in `.cloudflare-secrets.local` as Cloudflare Worker runtime
secrets.

Local Cloudflare preview build:

```bash
pnpm preview
```

Generate Wrangler environment typings if needed:

```bash
pnpm cf-typegen
```

### Wrangler Config

`wrangler.toml` is configured for:

- worker name: `payment-gateway-docs`
- main entry: `.open-next/worker.js`
- assets binding: `.open-next/assets`
- custom domain route: `docs.payment-gateway.app`

No staging environment is configured for this project.

## GitHub Actions Workflow

Production deployment is handled by:

- `.github/workflows/deploy-cloudflare.yml`

The workflow runs on pushes to `main` when deploy-relevant files change, and it
performs:

1. dependency install
2. `pnpm typecheck`
3. `pnpm build`
4. `pnpm deploy:cf:production`

The workflow runs on `ubuntu-latest`, which avoids the Windows symlink issues
that can affect local OpenNext bundle generation.

## Required GitHub Secrets

The deployment workflow requires these repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Local Cloudflare Secrets File

Use `.cloudflare-secrets.example` as the template for local deployment
credentials:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Notes

- The docs site uses production-only routing at `docs.payment-gateway.app`.
- Unlike `payment-gateway-app-website`, there is no staging worker or staging
  custom domain.
- The docs distinguish between the operator-facing license portal and the
  buyer-facing customer portal. First-party domains such as
  `payment-gateway.app` and `secure.payment-gateway.app` are examples of the
  Root Sector deployment, not hard-coded product requirements for self-hosted
  customers.
- OpenNext Cloudflare support is initialized in `next.config.mjs` so local
  development stays aligned with the Cloudflare runtime model.
- `pnpm build` is validated on Windows, but `opennextjs-cloudflare build` is
  more reliable in Linux/CI or WSL because OpenNext may need symlink behavior
  that native Windows shells can block.
