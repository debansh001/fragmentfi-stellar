# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.ts >> FragmentFi E2E Public Flow >> Reserves page loads and displays data
- Location: tests\e2e\app.spec.ts:24:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Proof of Reserves' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Proof of Reserves' })

```

```yaml
- navigation:
  - link "FragmentFi":
    - /url: /
    - img
    - text: FragmentFi
  - link "Dashboard":
    - /url: /dashboard
  - link "Deposit":
    - /url: /deposit
  - button "Connect Wallet"
- main:
  - text: FragmentFi is live on Stellar Testnet.
  - link "View Reserves":
    - /url: /reserves
  - heading "The simplest way to earn 12.5% APY on Stellar." [level=1]
  - paragraph: Convert your XLM or USDC into FRAG. Your funds are actively deployed in secure yield strategies and fully backed 1:1 on-chain. Withdraw instantly, any time.
  - button "Start with $1"
  - link "How it works":
    - /url: "#how-it-works"
  - term: Total Value Locked
  - definition: $1,250,000
  - term: Active Holders
  - definition: 1,420
  - term: On-chain Reserve Ratio
  - definition: 104.2%
  - heading "DeFi made simple" [level=2]
  - paragraph: Everything you need, zero complexity
  - paragraph: No staking periods, no claiming rewards, no complex bridges. Just deposit and watch your balance grow.
  - img
  - term: 1. Deposit USDC or XLM
  - definition:
    - paragraph: Connect your Stellar wallet and deposit any amount. Our smart contract automatically converts it to FRAG.
  - img
  - term: 2. Receive FRAG Tokens
  - definition:
    - paragraph: You instantly receive FRAG tokens 1:1 for your deposit. FRAG represents your yield-bearing position.
  - img
  - term: 3. Earn Automated Yield
  - definition:
    - paragraph: Your FRAG balance automatically increases every week. Withdraw back to USDC/XLM at any time.
  - heading "Fully Backed. Transparently." [level=3]
  - paragraph: Trust in DeFi is earned, not given. FragmentFi uses Soroban smart contracts on the Stellar network to ensure every FRAG minted is backed 1:1 by highly liquid, reserve assets.
  - heading "What's inside the vault" [level=4]
  - list:
    - listitem: 100% On-chain Verification
    - listitem: Real-time Soroban Audit
    - listitem: No Rehypothecation
  - paragraph: Current Reserve Ratio
  - paragraph: 104.2%
  - link "View Live Audit Log":
    - /url: /reserves
  - paragraph: Data synced via Stellar Horizon API
  - heading "Testimonials" [level=2]
  - paragraph: Trusted by early adopters
  - figure "AL Alex L. Testnet Alpha User":
    - blockquote:
      - paragraph: “The easiest DeFi platform I've ever used. Connected Freighter, deposited XLM, and instantly started seeing yield. The instant withdrawals are a game changer.”
    - text: AL Alex L. Testnet Alpha User
  - figure "SJ Sarah J. DeFi Analyst":
    - blockquote:
      - paragraph: “The transparency is what sold me. Being able to click through to the Stellar block explorer and seeing the reserve ratio >100% gives me total peace of mind.”
    - text: SJ Sarah J. DeFi Analyst
  - figure "MK Marcus K. Stellar Developer":
    - blockquote:
      - paragraph: “Soroban smart contracts are incredibly fast. The UI is gorgeous, but the real star is how seamlessly it handles the complex bridging and token minting in the background.”
    - text: MK Marcus K. Stellar Developer
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('FragmentFi E2E Public Flow', () => {
  4  |   test('Landing page loads successfully', async ({ page }) => {
  5  |     // Mock API to ensure fast and reliable E2E test
  6  |     await page.route('**/api/public/stats', async route => {
  7  |       await route.fulfill({
  8  |         json: { totalAUM: 5000000, activeHolders: 1200, currentApy: 12.5, reserveRatio: 105 }
  9  |       });
  10 |     });
  11 | 
  12 |     await page.goto('/');
  13 |     
  14 |     // Check main heading
  15 |     await expect(page.getByRole('heading', { name: /The simplest way to earn/i })).toBeVisible();
  16 |     
  17 |     // Check connection button
  18 |     await expect(page.getByRole('button', { name: /Start with \$1/i })).toBeVisible();
  19 |     
  20 |     // Check if StatsBar is rendered by looking for a stat like "Current Reserve Ratio"
  21 |     await expect(page.getByText('Current Reserve Ratio')).toBeVisible();
  22 |   });
  23 | 
  24 |   test('Reserves page loads and displays data', async ({ page }) => {
  25 |     // Mock the API response to ensure it's instant and doesn't rely on Upstash connection
  26 |     await page.route('**/api/reserves', async route => {
  27 |       await route.fulfill({
  28 |         json: {
  29 |           reserves: { totalReservesUsd: 1000000, onChainReservesXlm: 100000, onChainReservesUsdc: 900000 },
  30 |           supply: { totalFragSupply: 900000, supplyUsdValue: 900000 },
  31 |           reserveRatio: 111,
  32 |           auditLogs: []
  33 |         }
  34 |       });
  35 |     });
  36 | 
  37 |     await page.goto('/reserves');
  38 |     
  39 |     // Check if it loads the reserves heading
> 40 |     await expect(page.getByRole('heading', { name: 'Proof of Reserves' })).toBeVisible();
     |                                                                            ^ Error: expect(locator).toBeVisible() failed
  41 |     
  42 |     // Since we mock API calls, verify the layout is present
  43 |     await expect(page.getByText('XLM Reserves')).toBeVisible();
  44 |     await expect(page.getByText('USDC Reserves')).toBeVisible();
  45 |   });
  46 | 
  47 |   test('Public Stats API returns valid JSON payload', async ({ request }) => {
  48 |     const response = await request.get('/api/public/stats');
  49 |     expect(response.ok()).toBeTruthy();
  50 |     
  51 |     const data = await response.json();
  52 |     expect(data).toHaveProperty('totalAUM');
  53 |     expect(data).toHaveProperty('activeHolders');
  54 |     expect(data).toHaveProperty('currentApy');
  55 |     expect(data).toHaveProperty('reserveRatio');
  56 |   });
  57 | 
  58 |   test('Public Reserves API returns valid JSON payload', async ({ request }) => {
  59 |     const response = await request.get('/api/reserves');
  60 |     expect(response.ok()).toBeTruthy();
  61 |     
  62 |     const data = await response.json();
  63 |     expect(data).toHaveProperty('reserves');
  64 |     expect(data.reserves).toHaveProperty('totalReservesUsd');
  65 |     expect(data).toHaveProperty('supply');
  66 |     expect(data).toHaveProperty('reserveRatio');
  67 |   });
  68 | });
  69 | 
```