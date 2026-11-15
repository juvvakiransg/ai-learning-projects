import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUp, Bot, Check, ChevronRight, CircleHelp, Code2, Github, LockKeyhole, RotateCcw, Shield, ShieldCheck, Sparkles } from 'lucide-react';
import { sendMessage, type ChatMessage } from './api';
import MessageBubble, { type UIMessage } from './components/MessageBubble';
const suggestions = [
  { icon: <ShieldCheck size={19}/>, title: 'What are AI guardrails?', subtitle: 'Explore responsible AI practices' },
  { icon: <Code2 size={19}/>, title: 'Explain machine learning', subtitle: 'Understand core AI concepts' },
  { icon: <LockKeyhole size={19}/>, title: 'How does prompt injection work?', subtitle: 'Learn about AI security' },
  { icon: <CircleHelp size={19}/>, title: 'How can I protect user privacy?', subtitle: 'Discover privacy best practices' }
];
let nextId = 1;
export default function App() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState('mock');
  const bottom = useRef<HTMLDivElement>(null);
  const chatHistory = useRef<UIMessage[]>([]);
  useEffect(() => { fetch('/api/health').then(r => r.json()).then(data => setProvider(data.provider ?? 'mock')).catch(() => setProvider('offline')); }, []);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, busy]);
  async function submit(text = draft) {
    const message = text.trim();
    if (!message || busy) return;
    const history: ChatMessage[] = chatHistory.current.slice(-12).map(m => ({ role: m.role, content: m.content }));
    const user: UIMessage = { id: nextId++, role: 'user', content: message };
    chatHistory.current = [...chatHistory.current, user];
    setMessages(current => [...current, user]); setDraft(''); setBusy(true);
    try {
      const result = await sendMessage(message, history);
      const assistant: UIMessage = { id: nextId++, role: 'assistant', content: result.reply, status: result.status, code: result.code, redactions: result.redactions };
      setMessages(current => [...current, assistant]);
      // Do not feed blocked/invalid responses back to the model as context.
      if (result.status === 'allowed') chatHistory.current = [...chatHistory.current, assistant];
    } catch {
      setMessages(current => [...current, { id: nextId++, role: 'assistant', content: 'Could not reach the API. Start the backend and try again.', status: 'unavailable' }]);
    } finally { setBusy(false); }
  }
  function reset() { if (busy) return; setMessages([]); chatHistory.current = []; setDraft(''); }
  function onSubmit(e: FormEvent) { e.preventDefault(); void submit(); }
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><Shield size={22} strokeWidth={2.3}/></div><div><strong>SafeGuard<span>AI</span></strong><small>RESPONSIBLE INTELLIGENCE</small></div></div>
      <div className="side-section"><div className="side-heading">WORKSPACE</div><div className="nav-item active"><Bot size={18}/> AI Chat <ChevronRight size={15} className="nav-arrow"/></div></div>
      <div className="side-section info-section"><div className="side-heading">SAFETY LAYERS</div><div className="layer"><span className="layer-icon"><Check size={14}/></span><div><b>Input validation</b><small>Active</small></div></div><div className="layer"><span className="layer-icon"><Check size={14}/></span><div><b>Content moderation</b><small>Active</small></div></div><div className="layer"><span className="layer-icon"><Check size={14}/></span><div><b>Prompt protection</b><small>Active</small></div></div><div className="layer"><span className="layer-icon"><Check size={14}/></span><div><b>Output filtering</b><small>Active</small></div></div></div>
      <div className="sidebar-bottom"><div className="tip-icon"><ShieldCheck size={20}/></div><strong>Safety by design</strong><p>Every message passes through multiple safety checks before reaching you.</p><div className="sidebar-divider"/><a href="https://github.com" target="_blank" rel="noreferrer"><Github size={16}/> Built for responsible AI learning</a></div>
    </aside>
    <main className="main-area"><header className="topbar"><div className="breadcrumb">Workspace <ChevronRight size={15}/> <strong>AI Chat</strong></div><div className="top-right"><span className="mode"><span className="mode-dot"/>{provider === 'offline' ? 'API offline' : `${provider.toUpperCase()} MODE`}</span><button className="new-chat" onClick={reset} disabled={busy}><RotateCcw size={15}/> New chat</button></div></header>
      <div className="content-wrap"><div className="chat-scroll" aria-live="polite">
        {messages.length === 0 ? <div className="welcome"><div className="welcome-icon"><ShieldCheck size={32}/></div><div className="eyebrow"><Sparkles size={14}/> A SAFER WAY TO EXPLORE AI</div><h1>Ask anything.<br/><span>Explore responsibly.</span></h1><p>Your AI assistant with built-in guardrails. Designed to be helpful, transparent, and safety-conscious with every conversation.</p><div className="suggestion-title">GET STARTED WITH A QUESTION</div><div className="suggestion-grid">{suggestions.map(item => <button key={item.title} className="suggestion" onClick={() => void submit(item.title)}><div className="suggestion-icon">{item.icon}</div><strong>{item.title}</strong><small>{item.subtitle}</small><ArrowUp size={15} className="suggestion-arrow"/></button>)}</div></div> : <div className="conversation"><div className="conversation-header"><div className="mini-shield"><ShieldCheck size={20}/></div><div><strong>Safe conversation</strong><small>Protected by input and output guardrails</small></div></div>{messages.map(message => <MessageBubble key={message.id} message={message}/>)}{busy && <div className="message from-ai"><div className="avatar"><Bot size={19}/></div><div className="message-main"><div className="message-label">SafeGuard AI</div><div className="bubble typing"><span/><span/><span/></div></div></div>}<div ref={bottom}/></div>}
      </div><div className="composer-wrap"><form className="composer" onSubmit={onSubmit}><textarea aria-label="Your message" placeholder="Ask a question or explore a topic..." rows={2} maxLength={2000} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void submit(); } }} disabled={busy}/><div className="composer-bottom"><span><ShieldCheck size={15}/> Guardrails enabled <span className="composer-dot">·</span> {draft.length}/2000</span><button aria-label="Send message" type="submit" disabled={!draft.trim() || busy}><ArrowUp size={19}/></button></div></form><div className="disclaimer"><LockKeyhole size={13}/> SafeGuard AI uses layered checks, but automated safety filters are not infallible. Avoid sharing sensitive information.</div></div></div>
    </main>
  </div>;
}
