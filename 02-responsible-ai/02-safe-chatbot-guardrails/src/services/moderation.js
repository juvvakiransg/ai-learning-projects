export async function openAIModerate(text, apiKey) {
  if (!apiKey) throw new Error('Moderation requires an API key.');
  const response = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'omni-moderation-latest', input: text }), signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`Moderation service failed (${response.status}).`);
  const data = await response.json();
  if (typeof data?.results?.[0]?.flagged !== 'boolean') throw new Error('Invalid moderation response.');
  return { allowed: !data.results[0].flagged, code: 'PROVIDER_MODERATION' };
}
