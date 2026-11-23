import test from 'node:test'; import assert from 'node:assert/strict';
import {validateDataset} from '../src/dataset.js'; import {evaluate} from '../src/evaluate.js';
const row={id:'1',question:'Question?',expectedOutput:'Answer',keywords:['Answer']};
test('valid dataset',()=>assert.equal(validateDataset([row]).length,1));
test('empty dataset rejected',()=>assert.throws(()=>validateDataset([])));
test('duplicate ids rejected',()=>assert.throws(()=>validateDataset([row,row])));
test('invalid keywords rejected',()=>assert.throws(()=>validateDataset([{...row,keywords:'wrong'}])));
test('missing expected answer rejected',()=>assert.throws(()=>validateDataset([{id:'1',question:'Q'}])));
test('mock deterministic scores',async()=>{const r=await evaluate({dataset:[row]});assert.equal(r.summary.exactMatchAccuracy,1);assert.match(r.caveat,/not measure/)});
test('provided mode scores mismatches',async()=>{const r=await evaluate({dataset:[{...row,actualOutput:'Wrong'}],mode:'provided'});assert.equal(r.summary.exactMatchAccuracy,0)});
test('provided mode requires response',async()=>await assert.rejects(()=>evaluate({dataset:[row],mode:'provided'})));
test('invalid threshold rejected',async()=>await assert.rejects(()=>evaluate({dataset:[row],threshold:2})));
test('invalid mode rejected',async()=>await assert.rejects(()=>evaluate({dataset:[row],mode:'other'})));

test('provided mode reports negation failure', async () => {
  const result = await evaluate({mode:'provided', threshold:0, dataset:[{id:'capital',question:'Capital of France?',expectedOutput:'Paris',keywords:['Paris'],actualOutput:'It is not Paris, it is Lyon.'}]});
  assert.equal(result.summary.failed, 1);
  assert.equal(result.summary.contradictionsDetected, 1);
  assert.equal(result.results[0].passed, false);
});
