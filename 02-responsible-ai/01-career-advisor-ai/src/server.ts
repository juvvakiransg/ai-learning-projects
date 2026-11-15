import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { validateProfile } from './models/profile.ts';
import { offlineAdvice } from './services/recommend.ts';
import { openAIAdvice } from './services/openai.ts';

const MAX_BYTES = 32_768;
export async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.url === '/api/health' && req.method === 'GET') { res.end(JSON.stringify({ status: 'ok' })); return; }
  if (req.url !== '/api/advice') { res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); return; }
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); res.writeHead(405); res.end(JSON.stringify({ error: 'Method not allowed' })); return; }
  if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) { res.writeHead(415); res.end(JSON.stringify({ error: 'Content-Type must be application/json' })); return; }
  try {
    let body = ''; let size = 0;
    for await (const chunk of req) {
      size += Buffer.byteLength(chunk);
      if (size > MAX_BYTES) { res.writeHead(413); res.end(JSON.stringify({ error: 'Request too large' })); return; }
      body += chunk.toString();
    }
    const payload: unknown = JSON.parse(body);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid request body');
    const data = payload as Record<string, unknown>;
    const profile = validateProfile(data.profile);
    const provider = data.provider === undefined ? 'offline' : data.provider;
    if (provider !== 'offline' && provider !== 'openai') throw new Error('provider must be offline or openai');
    const result = provider === 'offline' ? offlineAdvice(profile) : await openAIAdvice(profile);
    res.writeHead(200); res.end(JSON.stringify(result));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const upstream = /^OpenAI|quota exhausted|OpenAI API error|Invalid AI output|Responsible AI validation/i.test(message);
    res.writeHead(upstream ? 502 : 400);
    res.end(JSON.stringify({ error: message }));
  }
}
export function startServer(port = Number(process.env.PORT ?? 3001)) {
  const server = createServer((req, res) => { void handler(req, res).catch(() => { if (!res.headersSent) res.writeHead(500); res.end(JSON.stringify({error:'Internal server error'})); }); });
  server.listen(port, '127.0.0.1', () => console.log(`Career Advisor API running at http://localhost:${port}`));
  return server;
}
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) startServer();
