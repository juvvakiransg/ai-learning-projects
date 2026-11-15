export async function generateAnswer(row, mode = 'mock') {
  if (mode === 'provided') {
    if (typeof row.actualOutput !== 'string') throw new Error(`Missing actualOutput for ${row.id}`);
    return row.actualOutput;
  }
  if (mode === 'mock') {
    // Deterministic reference-based fixture; NOT a real model evaluation.
    return row.expectedOutput;
  }
  if (mode !== 'openai') throw new Error('Unsupported provider');
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');
  const controller = new AbortController(); const timer = setTimeout(()=>controller.abort(), 25000);
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method:'POST', signal:controller.signal,
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},
      body:JSON.stringify({model:process.env.OPENAI_MODEL || 'gpt-4.1-mini', temperature:0, messages:[{role:'system',content:'Answer the question concisely and accurately. Do not use reference answers; none are provided.'},{role:'user',content:row.question}]}) });
    if (!res.ok) throw new Error(`LLM API failed (${res.status})`);
    const data = await res.json(); const output = data?.choices?.[0]?.message?.content;
    if (typeof output !== 'string') throw new Error('Invalid LLM response');
    return output;
  } finally { clearTimeout(timer); }
}
