import test from 'node:test'; import assert from 'node:assert/strict';
import {normalize,exactMatch,tokenF1,keywordCoverage,scoreRow,summarize,detectContradiction} from '../src/scoring.js';
test('normalization',()=>assert.equal(normalize(' Hello,  WORLD! '),'hello world'));
test('exact match normalized',()=>assert.equal(exactMatch('Paris!','paris'),1));
test('exact mismatch',()=>assert.equal(exactMatch('Paris','London'),0));
test('f1 identical',()=>assert.equal(tokenF1('a b','a b'),1));
test('f1 partial',()=>assert.equal(tokenF1('red blue','red green'),.5));
test('f1 disjoint',()=>assert.equal(tokenF1('red','blue'),0));
test('f1 empty',()=>assert.equal(tokenF1('',''),1));
test('f1 repeated tokens',()=>assert.equal(tokenF1('a a','a'),2/3));
test('keyword phrase coverage',()=>assert.equal(keywordCoverage(['new york','city'],'New York City'),1));
test('keyword missing',()=>assert.equal(keywordCoverage(['cat','dog'],'cat'),.5));
test('keyword empty',()=>assert.equal(keywordCoverage([],''),1));
test('scoring threshold',()=>assert.equal(scoreRow({id:'1',question:'q',expectedOutput:'yes',keywords:['yes']},'yes').passed,true));
test('summary empty',()=>assert.equal(summarize([]).total,0));

// Regression coverage for reviewer feedback: keyword presence is not correctness.
const capital = { id:'capital', question:'What is the capital of France?', expectedOutput:'Paris', keywords:['Paris'] };
test('negated answer cannot pass even with a zero threshold', () => {
  const result = scoreRow(capital, 'It is not Paris, it is Lyon.', 0);
  assert.equal(result.keywordCoverage, 1);
  assert.equal(result.contradictionDetected, true);
  assert.equal(result.passed, false);
});
test('explicit rejection of reference fails', () => {
  assert.equal(scoreRow(capital, 'Paris is wrong; the answer is Lyon.', 0).passed, false);
});
test('uncertain answer fails despite keyword', () => {
  assert.equal(scoreRow(capital, 'Maybe Paris, perhaps Lyon.', 0).passed, false);
});
test('correct reference still passes', () => {
  const result = scoreRow(capital, 'Paris');
  assert.equal(result.passed, true);
  assert.equal(result.contradictionDetected, false);
});
test('contradiction detection returns null for unrelated answer', () => {
  assert.equal(detectContradiction('Paris', 'Lyon'), null);
});
