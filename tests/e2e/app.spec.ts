import { test, expect } from '@playwright/test';

test.describe('FragmentFi E2E Public Flow', () => {
  test('Landing page loads successfully', async ({ page }) => {
    // Mock API to ensure fast and reliable E2E test
    await page.route('**/api/public/stats', async route => {
      await route.fulfill({
        json: { totalAUM: 5000000, activeHolders: 1200, currentApy: 12.5, reserveRatio: 105 }
      });
    });

    await page.goto('/');
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /The simplest way to earn/i })).toBeVisible();
    
    // Check connection button
    await expect(page.getByRole('button', { name: /Start with \$1/i })).toBeVisible();
    
    // Check if StatsBar is rendered by looking for a stat like "Current Reserve Ratio"
    await expect(page.getByText('Current Reserve Ratio')).toBeVisible();
  });

  test('Reserves page loads and displays data', async ({ page }) => {
    // Mock the API response to ensure it's instant and doesn't rely on Upstash connection
    await page.route('**/api/reserves', async route => {
      await route.fulfill({
        json: {
          reserves: { totalReservesUsd: 1000000, onChainReservesXlm: 100000, onChainReservesUsdc: 900000 },
          supply: { totalFragSupply: 900000, supplyUsdValue: 900000 },
          reserveRatio: 111,
          auditLogs: []
        }
      });
    });

    await page.goto('/reserves');
    
    // Check if it loads the reserves heading
    await expect(page.getByRole('heading', { name: 'Proof of Reserves' })).toBeVisible();
    
    // Since we mock API calls, verify the layout is present
    await expect(page.getByText('XLM Reserves')).toBeVisible();
    await expect(page.getByText('USDC Reserves')).toBeVisible();
  });

  test('Public Stats API returns valid JSON payload', async ({ request }) => {
    const response = await request.get('/api/public/stats');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('totalAUM');
    expect(data).toHaveProperty('activeHolders');
    expect(data).toHaveProperty('currentApy');
    expect(data).toHaveProperty('reserveRatio');
  });

  test('Public Reserves API returns valid JSON payload', async ({ request }) => {
    const response = await request.get('/api/reserves');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('reserves');
    expect(data.reserves).toHaveProperty('totalReservesUsd');
    expect(data).toHaveProperty('supply');
    expect(data).toHaveProperty('reserveRatio');
  });
});
