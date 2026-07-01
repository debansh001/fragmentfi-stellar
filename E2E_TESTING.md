# FragmentFi: End-to-End Testing & CI/CD Pipeline

This document provides a comprehensive overview of the End-to-End (E2E) testing setup, Continuous Integration & Continuous Deployment (CI/CD) pipelines, and Docker configuration for the FragmentFi project.

## 1. End-to-End Testing (Playwright)

We use [Playwright](https://playwright.dev/) for reliable, cross-browser End-to-End testing. 

### Why Playwright?
Playwright allows us to test the Next.js frontend and API endpoints headless and in parallel. Due to the reliance on the Freighter browser extension for wallet connections, true wallet interactions require a complex extension-injection setup. Therefore, our standard E2E suite focuses on public routes, API health, and layout rendering.

### Test Coverage
The suite (`tests/e2e/app.spec.ts`) covers:
1. **Landing Page:** Verifies that the Hero section, Stats Bar, and Connect Wallet Call-to-Actions are rendered correctly.
2. **Reserves Audit Page:** Verifies that the on-chain liquidity metrics, XLM/USDC balances, and transparency headers are loaded.
3. **Public APIs (`/api/public/stats` and `/api/reserves`):** Validates that the Upstash Redis fallback mock system correctly serves JSON data even if the DB is unpopulated.

### Running the Tests Locally
1. Ensure your `.env.local` contains valid Upstash Redis credentials.
2. Install Playwright browsers (one-time setup):
   ```bash
   npx playwright install --with-deps
   ```
3. Run the E2E suite:
   ```bash
   npx playwright test
   ```
4. View the HTML report:
   ```bash
   npx playwright show-report
   ```

---

## 2. CI/CD Pipelines (GitHub Actions)

We have implemented three separate, robust GitHub Actions workflows under `.github/workflows/` to ensure code quality and system integrity on every push to `main` or `develop`.

### A. Next.js Build Pipeline (`nextjs.yml`)
- **Trigger:** Pull Requests & Pushes.
- **Environment:** Node.js 20 on Ubuntu.
- **Actions:** 
  - Restores `.next/cache` for lightning-fast builds.
  - Injects required environment secrets (Upstash Redis URL/Token, JWT Secret, Contract IDs).
  - Runs `npm run build` to verify the frontend compiles cleanly in standalone mode.

### B. Lint & Type Check (`lint.yml`)
- **Trigger:** Pull Requests & Pushes.
- **Environment:** Node.js 20 on Ubuntu.
- **Actions:** 
  - Runs `npm run lint` (ESLint) to enforce code style.
  - Runs `npx tsc --noEmit` to statically catch TypeScript errors before runtime.

### C. Soroban Contracts Pipeline (`contracts.yml`)
- **Trigger:** Changes inside `contracts/**` or `Cargo.toml`.
- **Environment:** Rust stable on Ubuntu.
- **Actions:** 
  - Adds the `wasm32-unknown-unknown` target.
  - Installs `stellar-cli`.
  - Runs `cargo build --release --target wasm32-unknown-unknown` to compile the Soroban smart contracts.
  - Runs `cargo test` to execute Rust-level unit/integration tests for the contracts.

---

## 3. Docker Configuration

FragmentFi is fully dockerized for easy deployment to platforms like AWS ECS, Google Cloud Run, or DigitalOcean App Platform.

### Multi-Stage `Dockerfile`
The Dockerfile uses a 3-stage build process to drastically reduce the final image size and enhance security:
1. **deps:** Installs production dependencies.
2. **builder:** Injects build-time environment arguments and runs `npm run build` with Next.js `output: 'standalone'` enabled.
3. **runner:** Runs as a non-root user (`nextjs`), copies only the minimal standalone files and static assets, and exposes port 3000.

### `docker-compose.yml`
For local or single-server deployment, a Compose file is provided:
- Spins up the Next.js `app` service.
- Mounts `.env.local`.
- Automatically checks container health by pinging `/api/public/stats`.

*Note: Since the migration to serverless Upstash Redis, no local database container (like Postgres or local Redis) is required in the Compose stack, making the deployment entirely stateless and lightweight.*
