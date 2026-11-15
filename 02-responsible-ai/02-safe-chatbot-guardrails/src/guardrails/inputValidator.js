export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_HISTORY_ITEMS = 12;
export function validateInput(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return { ok: false, code: 'INVALID_BODY', message: 'Expected a JSON object.' };
  if (typeof payload.message !== 'string') return { ok: false, code: 'INVALID_MESSAGE', message: 'Message must be a string.' };
  const message = payload.message.trim();
  if (!message) return { ok: false, code: 'EMPTY_MESSAGE', message: 'Enter a message to continue.' };
  if (message.length > MAX_MESSAGE_LENGTH) return { ok: false, code: 'MESSAGE_TOO_LONG', message: `Keep messages under ${MAX_MESSAGE_LENGTH} characters.` };
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(message)) return { ok: false, code: 'CONTROL_CHARACTERS', message: 'Message contains unsupported control characters.' };
  if (payload.history !== undefined && (!Array.isArray(payload.history) || payload.history.length > MAX_HISTORY_ITEMS || !payload.history.every(x => x && ['user','assistant'].includes(x.role) && typeof x.content === 'string' && x.content.length <= MAX_MESSAGE_LENGTH))) {
    return { ok: false, code: 'INVALID_HISTORY', message: 'Invalid conversation history.' };
  }
  return { ok: true, message, history: payload.history ?? [] };
}
