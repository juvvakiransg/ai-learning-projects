import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { evaluate } from './evaluate.js';
const datasetPath = fileURLToPath(new URL('../datasets/sample-questions.json', import.meta.url));
export function createServer() {
  return http.createServer(async (req,res) => {
    const send = (code,data) => {res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'http://localhost:5173','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});res.end(JSON.stringify(data));};
    if (req.method === 'OPTIONS') return send(204,{});
    const url = new URL(req.url,'http://localhost');
    if (req.method === 'GET' && url.pathname === '/api/health') return send(200,{status:'ok',name:'PromptScore AI'});
    if (req.method === 'GET' && url.pathname === '/api/sample') return send(200,JSON.parse(await readFile(datasetPath,'utf8')));
    if (req.method === 'POST' && url.pathname === '/api/evaluate') {
      try {
        let body=''; for await (const chunk of req) { body+=chunk; if (body.length > 1024*1024) throw new Error('Request too large'); }
        const payload = JSON.parse(body); return send(200,await evaluate(payload));
      } catch(e) { return send(400,{error:e.message}); }
    }
    return send(404,{error:'Not found'});
  });
}
if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(new URL(`file://${process.argv[1].startsWith('/') ? '' : process.cwd()+'/'}${process.argv[1]}`))) {
  const port=Number(process.env.PORT || 3004);createServer().listen(port,'127.0.0.1',()=>console.log(`PromptScore API: http://127.0.0.1:${port}`));
}
