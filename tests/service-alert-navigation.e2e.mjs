import { chromium } from '../.review-tools/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const base = 'http://localhost:3009';
const errors = []; page.on('pageerror', e => errors.push(e.message));
const post = async (path, data) => {
  const r = await context.request.post(base + '/api' + path, { data, headers: { Origin: base, 'X-Requested-With': 'XMLHttpRequest' } });
  assert.equal(r.status(), 200, await r.text()); return r.json();
};
try {
  await page.goto(base + '/admin');
  await page.getByLabel('Work email').fill('admin@example.com');
  await page.getByLabel('Password', { exact: true }).fill('a-good-test-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('region', { name: 'Action required', exact: true }).waitFor();
  const owner = await post('/admin/records/owners', { name: 'Job card owner' });
  const car = await post('/admin/records/vehicles', { ownerId: owner.id, slug: 'job-car-' + Date.now(), brand: 'Toyota', model: 'Corolla', registrationNumber: 'JOB ' + Date.now(), year: 2026, category: 'suv', dailyRate: 2000, mileage: 10000, nextServiceMileage: 9900, tyreSize: '205/55 R16' });
  await page.reload();
  await page.getByRole('link', { name: 'Review / record service' }).click();
  await page.getByRole('heading', { name: 'Record Fleet Maintenance' }).waitFor();
  assert.ok((await page.locator('body').innerText()).includes(car.registrationNumber + ' · Toyota Corolla'));
  assert.ok(page.url().endsWith('/admin/fleet'));
  assert.deepEqual(errors, []);
  console.log('Service alert opens the maintenance form for the exact vehicle.');
} finally { await browser.close(); }

