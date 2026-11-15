import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { handler } from '../src/server.ts';
const profile = { currentRole:'iOS Developer',experienceYears:5,skills:['Swift','iOS'],interests:['architecture'],careerGoal:'Solution Architect',learningHoursPerWeek:5 };
async function withServer(run) { const server=createServer((req,res)=>{void handler(req,res)}); await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve)); try { await run(`http://127.0.0.1:${server.address().port}`); } finally {await new Promise(resolve=>server.close(resolve));} }
test('health endpoint returns ok',()=>withServer(async url=>{const r=await fetch(url+'/api/health');assert.equal(r.status,200);assert.deepEqual(await r.json(),{status:'ok'});}));
test('offline advice API returns recommendations and roadmap',()=>withServer(async url=>{const r=await fetch(url+'/api/advice',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({profile,provider:'offline'})});assert.equal(r.status,200);const data=await r.json();assert.equal(data.provider,'offline');assert.equal(data.roadmap.length,3);assert.ok(data.recommendations.length>0);}));
test('invalid profile rejected',()=>withServer(async url=>{const r=await fetch(url+'/api/advice',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({profile:{}})});assert.equal(r.status,400);}));
test('unknown provider rejected',()=>withServer(async url=>{const r=await fetch(url+'/api/advice',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({profile,provider:'other'})});assert.equal(r.status,400);}));
test('unknown path 404',()=>withServer(async url=>{assert.equal((await fetch(url+'/unknown')).status,404);}));
test('GET advice 405',()=>withServer(async url=>{assert.equal((await fetch(url+'/api/advice')).status,405);}));
test('wrong content type 415',()=>withServer(async url=>{assert.equal((await fetch(url+'/api/advice',{method:'POST',body:'hi'})).status,415);}));
test('malformed JSON 400',()=>withServer(async url=>{assert.equal((await fetch(url+'/api/advice',{method:'POST',headers:{'content-type':'application/json'},body:'{bad'})).status,400);}));
test('oversized request 413',()=>withServer(async url=>{const r=await fetch(url+'/api/advice',{method:'POST',headers:{'content-type':'application/json'},body:'x'.repeat(33000)});assert.equal(r.status,413);}));
