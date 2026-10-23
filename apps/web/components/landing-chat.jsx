'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Send, ShieldCheck, Sparkles, X } from 'lucide-react';

const suggestions = ['How do I get started?', 'How are secrets protected?'];

function answerFor(question) {
  const query = question.toLowerCase();

  if (query.includes('start') || query.includes('setup') || query.includes('sign up')) {
    return 'Open the workspace to create the first organization administrator. From there, create a project and invite teammates with scoped roles.';
  }

  if (query.includes('protect') || query.includes('encrypt') || query.includes('secret')) {
    return 'Aegis is designed to encrypt secret values at rest and keep reveal actions permissioned, time-bound, and attached to an audit event.';
  }

  if (query.includes('audit') || query.includes('evidence') || query.includes('history')) {
    return 'Sensitive operations are recorded with an actor, resource, and decision so teams can follow the event history and verify its integrity.';
  }

  if (query.includes('approval') || query.includes('access') || query.includes('role')) {
    return 'Access can be scoped by organization role and project membership. Approval requests are recorded with a decision and an expiry window.';
  }

  return 'I can help with workspace setup, secret protection, access approvals, and audit evidence. Try one of the suggested questions below.';
}

export default function LandingChat() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi, I'm the Aegis guide. Ask me about setup, controlled access, or audit evidence.",
    },
  ]);
  const endOfMessages = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    endOfMessages.current?.scrollIntoView({ block: 'nearest' });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, messages]);

  function send(text = draft) {
    const question = text.trim().slice(0, 240);
    if (!question) return;

    setMessages((current) => [
      ...current,
      { role: 'user', text: question },
      { role: 'assistant', text: answerFor(question) },
    ]);
    setDraft('');
  }

  return (
    <div className="landing-assistant">
      <AnimatePresence>
        {open && (
          <motion.section
            className="assistant-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby="assistant-title"
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="assistant-head">
              <div className="assistant-avatar"><ShieldCheck size={17} /><i /></div>
              <div className="assistant-heading">
                <strong id="assistant-title">Aegis guide</strong>
                <span><span className="assistant-online" /> Product guide · preview</span>
              </div>
              <button className="assistant-close" type="button" onClick={() => setOpen(false)} aria-label="Close assistant">
                <X size={16} />
              </button>
            </div>

            <div className="assistant-messages" aria-live="polite">
              {messages.map((message, index) => (
                <div className={`assistant-message ${message.role}`} key={`${message.role}-${index}`}>
                  {message.role === 'assistant' && <span className="assistant-message-mark"><Sparkles size={12} /></span>}
                  <p>{message.text}</p>
                </div>
              ))}
              {messages.length === 1 && (
                <div className="assistant-suggestions">
                  {suggestions.map((suggestion) => (
                    <button type="button" key={suggestion} onClick={() => send(suggestion)}>{suggestion}</button>
                  ))}
                </div>
              )}
              <span ref={endOfMessages} />
            </div>

            <form className="assistant-compose" onSubmit={(event) => { event.preventDefault(); send(); }}>
              <label className="sr-only" htmlFor="assistant-question">Ask the Aegis guide</label>
              <input
                id="assistant-question"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={240}
                placeholder="Ask a product question…"
              />
              <button type="submit" aria-label="Send message" disabled={!draft.trim()}><Send size={15} /></button>
            </form>
            <div className="assistant-footnote">This product guide replies locally in this preview.</div>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        className={`assistant-launcher ${open ? 'is-open' : ''}`}
        type="button"
        aria-label={open ? 'Close Aegis assistant' : 'Open Aegis assistant'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={20} /> : <><MessageCircle size={19} /><span className="assistant-launcher-spark"><Sparkles size={10} /></span></>}
      </button>
    </div>
  );
}
