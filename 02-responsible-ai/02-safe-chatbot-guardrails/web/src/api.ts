export type ChatResponse = { status: 'allowed' | 'blocked' | 'invalid' | 'unavailable'; reply: string; code?: string; redactions?: string[] };
export type ChatMessage = { role: 'user' | 'assistant'; content: string };
export async function sendMessage(message: string, history: ChatMessage[]): Promise<ChatResponse> {
  const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, history }) });
  const result: ChatResponse = await response.json();
  if (!result?.reply) throw new Error('Unexpected response from server.');
  return result;
}
