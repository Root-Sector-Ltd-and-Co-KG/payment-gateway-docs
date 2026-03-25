# Payment Gateway Docs

This project hosts the public product documentation at:

- `https://docs.payment-gateway.app`

It is a Next.js 16 + Fumadocs site deployed as a container to Azure Container Apps.

There is no separate public staging deployment for the docs site. The only
published environment is the production site at `docs.payment-gateway.app`.

## Stack

- Runtime: Next.js App Router
- Docs framework: Fumadocs
- Container image: Docker (distroless runtime)
- Deploy target: Azure Container Apps
- Custom domain: `docs.payment-gateway.app`

## Project Structure

- `app/(home)`: documentation home page and root-level routed docs pages
- `app/api/search/route.ts`: Fumadocs search endpoint
- `app/llms.txt/route.ts`: LLM-friendly docs index
- `app/llms-full.txt/route.ts`: expanded LLM-friendly docs output
- `content/docs`: MDX documentation content
- `lib/source.ts`: Fumadocs content source wiring
- `source.config.ts`: MDX/content collection configuration

## Development

Install dependencies:

```bash
pnpm install
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

## Deployment (Azure Container Apps)

### One-time Azure setup (prerequisites)

- Create an Azure **Resource Group**
- Create an Azure **Container Apps Environment**
- Create (or let CI create) an Azure **Container App**
- Configure GitHub Actions **OIDC** for Azure login (federated credential)

### GitHub repo configuration

Add these **GitHub Secrets**:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `GHCR_USERNAME` (e.g. `root-sector-ltd-and-co-kg`)
- `GHCR_TOKEN` (a PAT with `read:packages` for pulling images from GHCR)

Add these **GitHub Variables**:

- `AZURE_RESOURCE_GROUP`
- `AZURE_CONTAINERAPP_NAME`
- `AZURE_CONTAINERAPPS_ENVIRONMENT`
- `AZURE_LOCATION`

### Deploy

Deploy happens automatically on push to `main` via:

- `.github/workflows/deploy-aca.yml`

### Container build (local)

```bash
docker build -t payment-gateway-docs:local .
docker run --rm -p 3000:3000 payment-gateway-docs:local
```

## Notes

- The docs site uses production-only routing at `docs.payment-gateway.app`.
- Unlike `payment-gateway-app-website`, there is no staging worker or staging
  custom domain.
- The docs distinguish between the operator-facing license portal and the
  buyer-facing customer portal. First-party domains such as
  `payment-gateway.app` and `secure.payment-gateway.app` are examples of the
  Root Sector deployment, not hard-coded product requirements for self-hosted
  customers.
-
