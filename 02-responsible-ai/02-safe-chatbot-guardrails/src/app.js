import { validateInput } from './guardrails/inputValidator.js';
import { moderateInput } from './guardrails/inputModerator.js';
import { checkPromptInjection } from './guardrails/promptInjection.js';
import { filterOutput } from './guardrails/outputFilter.js';
import { generateReply } from './services/chatbot.js';
import { openAIModerate } from './services/moderation.js';
const fallback = 'I can’t help with that request. I can help with safer, educational alternatives.';
const unavailable = 'Safety checks are temporarily unavailable. Please try again later.';
export async function processChat(payload, { env = process.env, generate = generateReply, moderate = openAIModerate } = {}) {
  const input = validateInput(payload);
  if (!input.ok) return { status: 400, body: { status: 'invalid', code: input.code, reply: input.message } };
  const heuristic = moderateInput(input.message);
  if (!heuristic.allowed) return { status: 200, body: { status: 'blocked', code: heuristic.code, reply: fallback } };
  const injection = checkPromptInjection(input.message);
  if (!injection.allowed) return { status: 200, body: { status: 'blocked', code: injection.code, reply: 'I cannot follow instructions that attempt to override my safety rules. Please ask a normal question.' } };
  const live = env.AI_PROVIDER === 'openai';
  const providerModeration = live && env.USE_OPENAI_MODERATION !== 'false';
  if (providerModeration) {
    try {
      const result = await moderate(input.message, env.OPENAI_API_KEY);
      if (!result.allowed) return { status: 200, body: { status: 'blocked', code: 'INPUT_MODERATION', reply: fallback } };
    } catch { return { status: 503, body: { status: 'unavailable', code: 'MODERATION_UNAVAILABLE', reply: unavailable } }; }
  }
  let raw;
  try { raw = await generate(input.message, input.history, env); }
  catch { return { status: 503, body: { status: 'unavailable', code: 'PROVIDER_UNAVAILABLE', reply: 'The chatbot is temporarily unavailable. Please try again.' } }; }
  if (providerModeration) {
    try {
      const result = await moderate(raw, env.OPENAI_API_KEY);
      if (!result.allowed) return { status: 200, body: { status: 'blocked', code: 'OUTPUT_MODERATION', reply: 'I cannot provide that response. Please try a different question.' } };
    } catch { return { status: 503, body: { status: 'unavailable', code: 'MODERATION_UNAVAILABLE', reply: unavailable } }; }
  }
  const output = filterOutput(raw);
  if (!output.allowed) return { status: 200, body: { status: 'blocked', code: output.code, reply: output.text } };
  return { status: 200, body: { status: 'allowed', reply: output.text, redactions: output.redactions } };
}
