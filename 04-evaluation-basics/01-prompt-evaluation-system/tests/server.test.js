import test from 'node:test'; import assert from 'node:assert/strict'; import {createServer} from '../src/server.js';
async function withServer(fn){const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));try{await fn(`http://127.0.0.1:${server.address().port}`)}finally{await new Promise(r=>server.close(r))}}
test('health endpoint',async()=>withServer(async base=>{const r=await fetch(base+'/api/health');assert.equal(r.status,200);assert.equal((await r.json()).status,'ok')}));
test('sample endpoint',async()=>withServer(async base=>{const r=await fetch(base+'/api/sample');assert.ok((await r.json()).length>0)}));
test('evaluation endpoint',async()=>withServer(async base=>{const r=await fetch(base+'/api/evaluate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({dataset:[{id:'1',question:'q',expectedOutput:'a'}]})});assert.equal(r.status,200);assert.equal((await r.json()).summary.total,1)}));
test('invalid payload',async()=>withServer(async base=>{const r=await fetch(base+'/api/evaluate',{method:'POST',body:'not-json'});assert.equal(r.status,400)}));
test('not found',async()=>withServer(async base=>assert.equal((await fetch(base+'/bad')).status,404)));
