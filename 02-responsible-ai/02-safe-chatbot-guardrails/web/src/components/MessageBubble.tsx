import { Bot, ShieldAlert, UserRound } from 'lucide-react';
import type { ChatResponse } from '../api';
export type UIMessage = { id: number; role: 'user' | 'assistant'; content: string; status?: ChatResponse['status']; code?: string; redactions?: string[] };
export default function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';
  return <div className={`message ${isUser ? 'from-user' : 'from-ai'}`}>
    <div className={`avatar ${isUser ? 'user-avatar' : ''}`}>{isUser ? <UserRound size={18} /> : <Bot size={19} />}</div>
    <div className="message-main">
      <div className="message-label">{isUser ? 'You' : 'SafeGuard AI'}</div>
      <div className={`bubble ${message.status === 'blocked' ? 'blocked' : ''}`}>{message.content}</div>
      {message.status === 'blocked' && <div className="safety-note"><ShieldAlert size={14} /> Safety guardrail activated {message.code ? `· ${message.code.replaceAll('_', ' ').toLowerCase()}` : ''}</div>}
      {!!message.redactions?.length && <div className="safety-note">Sensitive information redacted</div>}
    </div>
  </div>;
}
