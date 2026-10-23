'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, MessageCircle, Send, ShieldCheck, Sparkles, X } from 'lucide-react';

const setupSuggestions = [
  'Why do you need these details?',
  'What happens after signup?',
  'How do I protect a secret?',
];

const workspaceSuggestions = [
  'What should I do first?',
  'Why are my numbers at zero?',
  'How do I add a secret?',
];
const connectionSuggestions = [
  'Why are vault services offline?',
  'How do I reconnect?',
  'What should I do after signup?',
];

function action(label, type, target) {
  return { label, type, target };
}

function answerFor(question, { context, page, hasProjects }) {
  const query = question.toLowerCase();
  const inSetup = context === 'setup' || context === 'signin';

  if (context === 'connection' && /offline|connect|database|server|service|500|error/.test(query)) {
    return {
      text: 'This screen means the workspace could not reach its API or database. Retry connection first. For local development, start the project with npm run dev and check the API or PostgreSQL logs if it still fails. I can explain the message, but the guide cannot restart services.',
      actions: [],
    };
  }

  if (/why.*(question|detail|organization|work email|password|sign.?up)|how many.*(question|detail|field)|too many questions|so many questions|what is.*(organization name|work email|password).*for/.test(query)) {
    return {
      text: context === 'signin'
        ? 'Sign-in only needs your work email and password to identify and authenticate your account. The organization name is collected once when the first administrator creates a vault; invited teammates may also need their one-time invitation token.'
        : 'First-time setup asks for three details: the organization name labels your vault, your work email identifies its first administrator, and a password protects sign-in. You only do this once. Teammates join later through invitations, and you can start using the workspace after signup.',
      actions: [],
    };
  }

  if (/what should i do|where do i start|first step|get started|start using|next step/.test(query)) {
    if (inSetup) {
      return {
        text: 'Create your organization with its name, your work email, and a strong password. After signup, create a project to group related secrets, add a secret to that project, then invite teammates with the access they need.',
        actions: [],
      };
    }
    return {
      text: hasProjects
        ? 'Your workspace is ready for its first credential: choose Add secret, select its project and environment, then enter its name and value in the secure form. You can invite teammates and review activity from the sidebar.'
        : 'Start by creating a project. Projects keep related secrets and team access organized. After that, add a secret to the project, then invite teammates if you need to collaborate.',
      actions: hasProjects
        ? [action('Add a secret', 'create-secret')]
        : [action('Create a project', 'create-project')],
    };
  }

  if (/why.*zero|zero.*number|empty|no data|nothing here|numbers at zero|0\b/.test(query)) {
    return {
      text: 'This is a new workspace, so the dashboard starts empty instead of showing sample activity. Its counts will reflect real projects, secrets, and security events as you create them.',
      actions: [action('Create a project', 'create-project')],
    };
  }

  if (/project|team workspace|organize/.test(query)) {
    return {
      text: 'A project is a container for related secrets, environments, and team membership. Give it a short name; its description is optional. Then add secrets and invite the teammates who need access.',
      actions: hasProjects
        ? [action('Open Projects & Teams', 'navigate', 'Projects & Teams')]
        : [action('Create a project', 'create-project')],
    };
  }

  if (/after signup|what happens after|what happens next|once i sign up|after i create my account/.test(query)) {
    return {
      text: inSetup
        ? 'After the first administrator account is created, you’ll land in the workspace. Create a project first, then add a secret to it. You can invite teammates from Users & Roles when you’re ready.'
        : 'The first account creates the organization administrator. In the workspace, create a project, add a secret to it, then invite teammates when you’re ready.',
      actions: inSetup ? [] : [action('Create your first project', 'create-project')],
    };
  }

  if (/security|encrypt|protected|safe|private/.test(query)) {
    return {
      text: 'Aegis is designed to keep secret values in the vault and make sensitive actions deliberate and reviewable. This guide runs in your browser and does not send messages to an AI service. It does not read secret values. Enter those only in the secure secret form.',
      actions: [],
    };
  }

  if (/secret|credential|api key|token/.test(query)) {
    if (!hasProjects && !inSetup) {
      return {
        text: 'Secrets belong to a project, so create a project first. Then choose Add secret, select the project and environment, and enter the value in the secure form. Please never paste passwords, API keys, or secret values into this chat.',
        actions: [action('Create a project', 'create-project')],
      };
    }
    return {
      text: inSetup
        ? 'After signup, open the workspace, create a project, and choose Add secret. Enter its value only in the secure secret form—never in this chat.'
        : 'Choose Add secret, select its project and environment, then enter the name and value in the secure form. This guide does not need to see the value, so never paste a password, API key, or secret here.',
      actions: inSetup ? [] : [action('Add a secret', 'create-secret')],
    };
  }

  if (/invite|member|user|role|permission|access control/.test(query)) {
    return {
      text: 'Open Users & Roles to manage membership. Give each teammate only the organization or project access needed for their work. Invitations are the normal way for teammates to join.',
      actions: inSetup ? [] : [action('Open Users & Roles', 'navigate', 'Users & Roles')],
    };
  }

  if (/approval|access request|request access/.test(query)) {
    return {
      text: 'Access Requests is where authorized reviewers handle requests for sensitive access. Each request should be reviewed for its project, requester, and requested duration.',
      actions: inSetup ? [] : [action('Open Access Requests', 'navigate', 'Access Requests')],
    };
  }

  if (/policy|policies|production rule|require expiry|expiration rule/.test(query)) {
    return {
      text: 'Security Policies lets an Administrator allow or block new production secrets, require expiry, and set a maximum lifetime. The API checks active rules when secrets are created or their expiry is edited. Multiple policies combine restrictively, and changes are audited.',
      actions: inSetup ? [] : [action('Open Security Policies', 'navigate', 'Security Policies')],
    };
  }

  if (/incident|response|containment|security event/.test(query)) {
    return {
      text: 'Incident Response keeps an organization incident record and timeline. Administrators and Security Managers can open an incident and advance it through Investigating, Contained, and Resolved. Updates are audited; automated containment and notifications need separate integrations.',
      actions: inSetup ? [] : [action('Open Incident Response', 'navigate', 'Incident Response')],
    };
  }

  if (/monitor|alert|failed sign.?in|authentication activity/.test(query)) {
    return {
      text: 'Monitoring shows saved sign-in counts and recent audit activity from the vault database. Anomaly detection and alert delivery are not configured yet.',
      actions: inSetup ? [] : [action('Open Monitoring & Alerts', 'navigate', 'Monitoring & Alerts')],
    };
  }

  if (/report|export|csv|compliance/.test(query)) {
    return {
      text: 'Reports & Compliance can download up to 100 recent audit records as CSV. The export excludes secret values and event metadata. It is an operational audit export, not a certified compliance report.',
      actions: inSetup ? [] : [action('Open Reports & Compliance', 'navigate', 'Reports & Compliance')],
    };
  }

  if (/setting|organization id|profile|mfa|multi.?factor/.test(query)) {
    return {
      text: 'Settings shows the organization, account, and role associated with your session. Profile editing, MFA enrollment, password recovery, and session management are not available in that page yet.',
      actions: inSetup ? [] : [action('Open Settings', 'navigate', 'Settings')],
    };
  }

  if (/audit|history|event|evidence|verify/.test(query)) {
    return {
      text: 'Audit Logs shows recorded workspace activity so you can review who acted and when. Open it to inspect the event history; use the integrity verification control when you need to check the audit chain.',
      actions: inSetup ? [] : [action('Open Audit Logs', 'navigate', 'Audit Logs')],
    };
  }

  if (/rotation|expire|expiry|rotate/.test(query)) {
    return {
      text: 'Rotation & Expiry is the place to review credential lifecycle and expiry information. Provider-driven rotation needs a configured provider integration before Aegis can rotate credentials automatically.',
      actions: inSetup ? [] : [action('Open Rotation & Expiry', 'navigate', 'Rotation & Expiry')],
    };
  }

  if (/what can you do|help|guide|how does this work|what is this page|where am i/.test(query)) {
    return {
      text: inSetup
        ? 'I can explain the first-time setup, sign-in, and the first steps after signup. The setup form only creates the first organization administrator; you can invite teammates later.'
        : `You’re on ${page}. I can explain projects, secrets, roles, approvals, audit history, and rotation—and take you to the related workspace section. Tell me what you’re trying to do, or pick a suggested question.`,
      actions: [],
    };
  }

  return {
    text: 'I can guide you through first-time setup, projects, secrets, team access, approvals, audit logs, and rotation. Try asking “What should I do first?” or “How do I add a secret?” I don’t read your vault data, and you should never paste a secret value into chat.',
    actions: [],
  };
}

export default function WorkspaceGuide({ context = 'workspace', page = 'Security Overview', hasProjects = false, onNavigate, onCreateProject, onCreateSecret }) {
  const suggestions = context === 'workspace'
    ? workspaceSuggestions
    : context === 'connection'
      ? connectionSuggestions
      : setupSuggestions;
  const welcome = context === 'setup'
    ? 'Hi, I’m your Aegis guide. I can explain the three setup details and walk you through your first project after signup.'
    : context === 'signin'
      ? 'Hi, I’m your Aegis guide. Ask about signing in, joining a team, or what to do once you reach the workspace.'
      : context === 'connection'
        ? 'Hi, I’m your Aegis guide. I can explain this connection screen and suggest what to check next.'
        : 'Hi, I’m your Aegis guide. Tell me what you want to do, and I can explain it or open the right workspace section.';
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([{ role: 'assistant', text: welcome, actions: [] }]);
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
    const question = text.trim().slice(0, 320);
    if (!question) return;
    const reply = answerFor(question, { context, page, hasProjects });
    setMessages((current) => [
      ...current,
      { role: 'user', text: question },
      { role: 'assistant', text: reply.text, actions: reply.actions },
    ]);
    setDraft('');
  }

  function runAction(nextAction) {
    if (nextAction.type === 'navigate') onNavigate?.(nextAction.target);
    if (nextAction.type === 'create-project') onCreateProject?.();
    if (nextAction.type === 'create-secret') onCreateSecret?.();
    setOpen(false);
  }

  return (
    <div className="landing-assistant workspace-assistant">
      <AnimatePresence>
        {open && (
          <motion.section
            className="assistant-panel"
            role="dialog"
            aria-modal="false"
            aria-labelledby="workspace-guide-title"
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="assistant-head">
              <div className="assistant-avatar"><ShieldCheck size={17} /><i /></div>
            <div className="assistant-heading">
                <strong id="workspace-guide-title">Aegis workspace guide</strong>
                <span><span className="assistant-online" /> Product help · runs in this browser</span>
              </div>
              <button className="assistant-close" type="button" onClick={() => setOpen(false)} aria-label="Close Aegis guide">
                <X size={16} />
              </button>
            </div>

            <div className="assistant-messages" aria-live="polite">
              {messages.map((message, index) => (
                <div className="workspace-guide-turn" key={`guide-${index}`}>
                  <div className={`assistant-message ${message.role}`}>
                    {message.role === 'assistant' && <span className="assistant-message-mark"><Sparkles size={12} /></span>}
                    <p>{message.text}</p>
                  </div>
                  {message.role === 'assistant' && message.actions?.length > 0 && (
                    <div className="workspace-guide-actions">
                      {message.actions.map((nextAction) => (
                        <button type="button" key={nextAction.label} onClick={() => runAction(nextAction)}>
                          {nextAction.label}<ArrowRight size={12} />
                        </button>
                      ))}
                    </div>
                  )}
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
              <label className="sr-only" htmlFor="workspace-guide-question">Ask the Aegis workspace guide</label>
              <input
                id="workspace-guide-question"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                maxLength={320}
                placeholder="Ask how to use this page…"
              />
              <button type="submit" aria-label="Send message" disabled={!draft.trim()}><Send size={15} /></button>
            </form>
            <div className="assistant-footnote">Messages stay in this browser. Never enter a secret value here.</div>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        className={`assistant-launcher ${open ? 'is-open' : ''}`}
        type="button"
        aria-label={open ? 'Close Aegis guide' : 'Ask Aegis for help'}
        aria-expanded={open}
        title="Ask Aegis for help"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={20} /> : <><MessageCircle size={19} /><span className="assistant-launcher-spark"><Sparkles size={10} /></span><span className="workspace-assistant-label">Ask Aegis</span></>}
      </button>
    </div>
  );
}
