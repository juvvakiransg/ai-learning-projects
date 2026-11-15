import http from 'node:http';
import { processChat } from './app.js';
const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || '127.0.0.1';
const MAX_BODY_BYTES = 24 * 1024;
export function createServer() {
  return http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const send = (status, body) => { res.writeHead(status); res.end(JSON.stringify(body)); };
    const pathname = new URL(req.url || '/', 'http://localhost').pathname;
    if (pathname === '/api/health' && req.method === 'GET') return send(200, { status: 'ok', provider: process.env.AI_PROVIDER === 'openai' ? 'openai' : 'mock' });
    if (pathname !== '/api/chat') return send(404, { error: 'Not found' });
    if (req.method !== 'POST') return send(405, { error: 'Method not allowed' });
    if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) return send(415, { error: 'Content-Type must be application/json' });
    let body = '';
    try {
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > MAX_BODY_BYTES) return send(413, { error: 'Request too large' });
      }
      const parsed = JSON.parse(body);
      const result = await processChat(parsed);
      return send(result.status, result.body);
    } catch (err) {
      if (err instanceof SyntaxError) return send(400, { error: 'Invalid JSON' });
      return send(500, { error: 'Unexpected server error' });
    }
  });
}
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  createServer().listen(port, host, () => console.log(`SafeGuard AI API: http://${host}:${port}`));
}
