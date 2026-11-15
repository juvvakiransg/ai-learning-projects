import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/server.js';
test('HTTP API validates content type, JSON, body, and health', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    let response = await fetch(`${url}/api/health`); assert.equal(response.status, 200);
    response = await fetch(`${url}/api/chat`, { method: 'POST', body: '{}' }); assert.equal(response.status, 415);
    response = await fetch(`${url}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' }); assert.equal(response.status, 400);
    response = await fetch(`${url}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Hi' }) }); assert.equal(response.status, 200); assert.equal((await response.json()).status, 'allowed');
    response = await fetch(`${url}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: '  ' }) }); assert.equal(response.status, 400);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
