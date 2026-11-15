import { describe, it, expect, vi, afterEach } from 'vitest';
import { sendMessage } from './api';
afterEach(() => vi.unstubAllGlobals());
describe('chat API client', () => {
  it('sends message and history', async () => {
    const mock = vi.fn().mockResolvedValue({ json: async () => ({ status: 'allowed', reply: 'Hello!' }) });
    vi.stubGlobal('fetch', mock);
    const response = await sendMessage('Hi', [{ role: 'user', content: 'Earlier' }]);
    expect(response.reply).toBe('Hello!');
    expect(JSON.parse(mock.mock.calls[0][1].body)).toEqual({ message: 'Hi', history: [{ role: 'user', content: 'Earlier' }] });
  });
  it('rejects malformed API responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({}) }));
    await expect(sendMessage('Hi', [])).rejects.toThrow('Unexpected response');
  });
});
