import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import { restoreAdminSession, adminAuthService } from '../src/services/adminAuthService.ts';
const original = globalThis.fetch;
afterEach(() => { globalThis.fetch = original; });
const user = { id: 'admin', email: 'admin@example.com', name: 'Admin', role: 'admin' };

test('session verification recovers from a temporary connection failure', async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    if (++calls === 1) throw new TypeError('network interruption');
    return Response.json(user);
  };
  assert.deepEqual(await restoreAdminSession(), user);
  assert.equal(calls, 2);
});

test('session checks stop after one retry during an outage', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({}, { status: 503 }); };
  await assert.rejects(restoreAdminSession());
  assert.equal(calls, 2);
});

test('permission denial is never retried or treated as authenticated', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({}, { status: 403 }); };
  await assert.rejects(restoreAdminSession());
  assert.equal(calls, 1);
});

test('expired access checks rotate tokens once without retrying failed refreshes', async () => {
  const paths: string[] = [];
  globalThis.fetch = async url => {
    paths.push(String(url));
    return Response.json({}, { status: paths.length === 1 ? 401 : 503 });
  };
  await assert.rejects(restoreAdminSession());
  assert.deepEqual(paths, ['/api/admin/auth/me', '/api/admin/auth/refresh']);
});

test('login requests are not automatically replayed on connection failure', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; throw new TypeError('offline'); };
  await assert.rejects(adminAuthService.login('admin@example.com', 'test-password'));
  assert.equal(calls, 1);
});
