'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, LockKeyhole, RefreshCw, ShieldCheck, WifiOff } from 'lucide-react';

export function AuthUnavailable({ error, onRetry }) {
  return (
    <main className="auth-shell grid-bg min-h-screen flex items-center justify-center p-5">
      <section className="auth-card w-full max-w-[460px] rounded-2xl p-8" aria-labelledby="auth-unavailable-title">
        <div className="auth-brand-icon mb-6 grid h-11 w-11 place-items-center rounded-xl"><WifiOff size={20} /></div>
        <p className="auth-kicker">AEGIS VAULT · CONNECTION</p>
        <h1 id="auth-unavailable-title" className="mt-2 text-2xl font-semibold">Vault services are offline</h1>
        <p className="mt-2 text-sm leading-6">We couldn’t check whether this is a new vault or an existing workspace. Signup and sign-in need the API and database running.</p>
        {error && <div className="auth-error mt-5" role="alert">{error}</div>}
        <p className="auth-policy mt-4 text-center text-[10px] leading-5">For local setup, configure PostgreSQL and <code>apps/api/.env</code>, run the database migration, then start the project with <code>npm run dev</code>.</p>
        <button type="button" onClick={onRetry} className="auth-submit mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold">
          <RefreshCw size={15} /> Retry connection
        </button>
        <a href="/" className="auth-home-link mt-4 flex items-center justify-center gap-2 text-xs">Return to Aegis Vault <ArrowRight size={13} /></a>
      </section>
    </main>
  );
}

export default function AuthGateway({ setupRequired, csrf, error, onLogin, onRegistered, onInviteAccepted }) {
  const [form, setForm] = useState({ email: '', password: '', organizationName: '', inviteToken: '' });
  const [localError, setLocalError] = useState('');
  const [inviteMode, setInviteMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm(current => ({ ...current, [field]: value }));
    setLocalError('');
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;
    setLocalError('');
    setSubmitting(true);
    try {
      const csrfResponse = await fetch('/api/v1/auth/csrf', { credentials: 'include', cache: 'no-store' });
      const requestCsrf = (await readResponse(csrfResponse)).csrfToken;
      if (setupRequired) {
        await fetch('/api/v1/auth/register', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'x-csrf-token': requestCsrf },
          body: JSON.stringify({ organizationName: form.organizationName, email: form.email, password: form.password }),
        }).then(readResponse);
        const signedIn = await onRegistered(form);
        if (signedIn !== true) setLocalError(typeof signedIn === 'string' ? `Vault created, but sign-in failed: ${signedIn}` : 'Your vault was created, but automatic sign-in did not finish. Sign in with your new credentials.');
        return;
      }

      if (inviteMode) {
        await fetch('/api/v1/auth/accept-invitation', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'x-csrf-token': requestCsrf },
          body: JSON.stringify({ email: form.email, password: form.password, token: form.inviteToken }),
        }).then(readResponse);
        const signedIn = await onInviteAccepted(form);
        if (signedIn !== true) setLocalError(typeof signedIn === 'string' ? `Invitation accepted, but sign-in failed: ${signedIn}` : 'Your invitation was accepted, but automatic sign-in did not finish. Sign in with your new credentials.');
        return;
      }

      const signedIn = await onLogin({ email: form.email, password: form.password, csrfToken: requestCsrf });
      if (signedIn !== true) setLocalError(typeof signedIn === 'string' ? signedIn : 'Sign-in failed. Check your details and try again.');
    } catch (submissionError) {
      setLocalError(submissionError.message || 'We could not complete this request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const title = setupRequired ? 'Create your vault' : inviteMode ? 'Accept your invitation' : 'Welcome back';
  const description = setupRequired
    ? 'Set up your organization and its first administrator.'
    : inviteMode
      ? 'Create your account with the one-time token from your administrator.'
      : 'Sign in to access your secure workspace.';
  const visibleError = localError || error;

  return (
    <main className="auth-shell grid-bg min-h-screen flex items-center justify-center p-5">
      <motion.form
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className="auth-card relative z-10 w-full max-w-[440px] rounded-2xl p-7 sm:p-8"
        aria-busy={submitting}
      >
        <div className="mb-7 flex items-center gap-3">
          <div className="auth-brand-icon grid h-11 w-11 place-items-center rounded-xl"><ShieldCheck size={21} /></div>
          <div><div className="font-semibold tracking-wide">AEGIS VAULT</div><div className="text-[10px] tracking-[.2em]">SECURE WORKSPACE</div></div>
        </div>

        <p className="auth-kicker">{setupRequired ? 'FIRST-TIME SETUP' : inviteMode ? 'TEAM ENROLLMENT' : 'SECURE ACCESS'}</p>
        <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm leading-6">{description}</p>

        {setupRequired && <label className="auth-field mt-5 block text-xs">Organization name
          <input required minLength={2} maxLength={100} autoComplete="organization" placeholder="e.g. Northstar Labs" value={form.organizationName} onChange={event => update('organizationName', event.target.value)} />
        </label>}

        <label className="auth-field mt-5 block text-xs">Work email
          <input required type="email" autoComplete="username" placeholder="you@company.com" value={form.email} onChange={event => update('email', event.target.value)} />
        </label>

        <label className="auth-field mt-4 block text-xs">Password
          <span className="auth-password-wrap mt-2 flex items-center">
            <input required minLength={12} maxLength={128} type={showPassword ? 'text' : 'password'} autoComplete={setupRequired || inviteMode ? 'new-password' : 'current-password'} placeholder="At least 12 characters" value={form.password} onChange={event => update('password', event.target.value)} />
            <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </span>
        </label>

        {inviteMode && <label className="auth-field mt-4 block text-xs">One-time invitation token
          <input required autoComplete="off" spellCheck="false" placeholder="Paste the secure token from your administrator" value={form.inviteToken} onChange={event => update('inviteToken', event.target.value.trim())} />
        </label>}

        {(visibleError) && <div className="auth-error mt-4" role="alert">{visibleError}</div>}

        <button className="auth-submit mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold" disabled={submitting || !csrf}>
          {submitting ? <><RefreshCw size={15} className="animate-spin" /> {setupRequired ? 'Creating your vault…' : inviteMode ? 'Accepting invitation…' : 'Signing in…'}</> : <>{setupRequired ? 'Create secure workspace' : inviteMode ? 'Accept invitation' : 'Secure sign in'} <ArrowRight size={15} /></>}
        </button>

        {!setupRequired && <button type="button" disabled={submitting} onClick={() => { setInviteMode(value => !value); setLocalError(''); }} className="auth-invite-toggle mt-4 w-full text-xs">
          {inviteMode ? 'Back to sign in' : 'Joining a team? Accept an invitation'}
        </button>}

        <div className="auth-footnote mt-6 flex items-center justify-center gap-2 text-[10px]"><LockKeyhole size={12} /> Protected with encrypted session cookies</div>
        {setupRequired && <p className="auth-policy mt-4 text-center text-[10px] leading-5">Vault creation is available once for the first organization administrator. Team members join with an invitation.</p>}
      </motion.form>
    </main>
  );
}

async function readResponse(response) {
  if (response.ok) return response.json();
  const details = await response.json().catch(() => ({}));
  throw new Error(details?.error?.message || `Request failed (${response.status}). Please try again.`);
}
