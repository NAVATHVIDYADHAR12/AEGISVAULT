'use client';

import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Check, ChevronRight, Download, FileText, LoaderCircle, Plus, RefreshCw, ShieldCheck } from 'lucide-react';
import DashboardActivityChart from './dashboard-activity-chart';

async function request(path, options = {}) {
  const { headers, ...rest } = options;
  const response = await fetch(`/api/v1${path}`, {
    ...rest,
    cache: 'no-store',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.message || `Vault API returned ${response.status}.`);
  return body;
}

function Alert({ message, kind = 'error' }) {
  if (!message) return null;
  return <p className={`ops-alert ${kind}`} role={kind === 'error' ? 'alert' : 'status'}>{message}</p>;
}

function LoadingState({ label = 'Loading organization data…' }) {
  return <div className="ops-loading"><LoaderCircle size={15} className="ops-spin" />{label}</div>;
}

function PanelHeading({ icon: Icon, title, copy, onRefresh, busy }) {
  return (
    <div className="ops-heading">
      <div className="ops-heading-mark"><Icon size={18} /></div>
      <div className="ops-heading-copy"><h2>{title}</h2><p>{copy}</p></div>
      {onRefresh && <button type="button" className="ops-quiet-button" onClick={onRefresh} disabled={busy} aria-label={`Refresh ${title}`}><RefreshCw size={14} /></button>}
    </div>
  );
}

export function PolicyView({ user, csrf }) {
  const [policies, setPolicies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ name: '', allowProductionSecrets: true, requireExpiry: false, maxExpiryDays: '' });
  const canManage = user?.role === 'ADMINISTRATOR';

  async function load() {
    setLoading(true);
    setError('');
    try { setPolicies(await request('/policies')); }
    catch (failure) { setError(failure.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function createPolicy(event) {
    event.preventDefault();
    setBusy(true); setError(''); setNotice('');
    try {
      const maximum = form.maxExpiryDays.trim() ? Number(form.maxExpiryDays) : null;
      await request('/policies', {
        method: 'POST',
        headers: { 'x-csrf-token': csrf },
        body: JSON.stringify({
          name: form.name.trim(),
          rules: {
            allowProductionSecrets: form.allowProductionSecrets,
            requireExpiry: form.requireExpiry || maximum !== null,
            maxExpiryDays: maximum,
          },
        }),
      });
      setForm({ name: '', allowProductionSecrets: true, requireExpiry: false, maxExpiryDays: '' });
      setNotice('Policy saved. Active rules are enforced when secrets are created or their expiry is changed.');
      await load();
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }

  async function setEnabled(policy) {
    setBusy(true); setError(''); setNotice('');
    try {
      await request(`/policies/${policy.id}/enabled`, {
        method: 'POST', headers: { 'x-csrf-token': csrf },
        body: JSON.stringify({ enabled: !policy.enabled }),
      });
      setPolicies((current) => current.map((row) => row.id === policy.id ? { ...row, enabled: !row.enabled } : row));
      setNotice(`${policy.name} ${policy.enabled ? 'paused' : 'activated'}.`);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }

  return (
    <section className="ops-card">
      <PanelHeading icon={ShieldCheck} title="Organization security policies" copy="Active policies are checked by the API when a secret is created or its expiry changes." onRefresh={load} busy={loading || busy} />
      <Alert message={error} /><Alert message={notice} kind="success" />
      {loading ? <LoadingState label="Loading saved policies…" /> : policies?.length ? (
        <div className="ops-list">
          {policies.map((policy) => {
            const rules = policy.rules || {};
            return <article key={policy.id} className="ops-row">
              <div className="ops-row-main">
                <div className="ops-row-title">{policy.name}<span className={`ops-status ${policy.enabled ? 'active' : ''}`}>{policy.enabled ? 'Active' : 'Paused'}</span></div>
                <p>{rules.allowProductionSecrets === false ? 'Blocks new production secrets' : 'Production secrets allowed'}{rules.requireExpiry ? ' · expiration required' : ''}{rules.maxExpiryDays ? ` · maximum lifetime ${rules.maxExpiryDays} days` : ''}</p>
              </div>
              {canManage && <button type="button" className="ops-quiet-button" disabled={busy} onClick={() => setEnabled(policy)}>{policy.enabled ? 'Pause' : 'Activate'}</button>}
            </article>;
          })}
        </div>
      ) : <div className="ops-empty"><ShieldCheck size={20} /><strong>No security policies saved</strong><span>New secret creation currently has no organization policy restrictions.</span></div>}

      {canManage ? <form className="ops-form" onSubmit={createPolicy}>
        <div className="ops-form-title"><Plus size={15} />Create a policy</div>
        <label className="ops-field">Policy name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength={3} maxLength={100} placeholder="Production credential controls" /></label>
        <div className="ops-check-grid">
          <label><input type="checkbox" checked={form.allowProductionSecrets} onChange={(event) => setForm({ ...form, allowProductionSecrets: event.target.checked })} /><span>Allow new production secrets</span></label>
          <label><input type="checkbox" checked={form.requireExpiry} onChange={(event) => setForm({ ...form, requireExpiry: event.target.checked })} /><span>Require an expiration date</span></label>
        </div>
        <label className="ops-field">Maximum lifetime in days <span className="ops-field-help">Optional; requiring an expiry is automatic when set.</span><input type="number" min="1" max="3650" value={form.maxExpiryDays} onChange={(event) => setForm({ ...form, maxExpiryDays: event.target.value })} placeholder="No maximum" /></label>
        <button type="submit" className="workspace-primary-button ops-primary-button" disabled={busy}>{busy ? 'Saving…' : 'Save policy'}</button>
      </form> : <p className="ops-permission-note">Only an organization Administrator can create, pause, or activate a policy.</p>}
      <p className="ops-footnote">Multiple active rules combine restrictively: any production block applies, any expiry requirement applies, and the shortest configured lifetime applies. Policy changes are recorded in audit history.</p>
    </section>
  );
}

const nextIncidentStatus = { OPEN: 'INVESTIGATING', INVESTIGATING: 'CONTAINED', CONTAINED: 'RESOLVED' };
const statusLabel = { OPEN: 'Open', INVESTIGATING: 'Investigating', CONTAINED: 'Contained', RESOLVED: 'Resolved' };

export function IncidentView({ user, csrf }) {
  const [incidents, setIncidents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [notes, setNotes] = useState({});
  const [form, setForm] = useState({ title: '', severity: 'MEDIUM', notes: '' });
  const canManage = ['ADMINISTRATOR', 'SECURITY_MANAGER'].includes(user?.role);

  async function load() {
    setLoading(true); setError('');
    try { setIncidents(await request('/incidents')); }
    catch (failure) { setError(failure.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function openIncident(event) {
    event.preventDefault(); setBusyId('new'); setError(''); setNotice('');
    try {
      await request('/incidents', { method: 'POST', headers: { 'x-csrf-token': csrf }, body: JSON.stringify(form) });
      setForm({ title: '', severity: 'MEDIUM', notes: '' });
      setNotice('Incident opened and recorded in the audit history.');
      await load();
    } catch (failure) { setError(failure.message); }
    finally { setBusyId(''); }
  }

  async function advanceIncident(incident) {
    const status = nextIncidentStatus[incident.status];
    if (!status) return;
    setBusyId(incident.id); setError(''); setNotice('');
    try {
      await request(`/incidents/${incident.id}/status`, {
        method: 'POST', headers: { 'x-csrf-token': csrf },
        body: JSON.stringify({ status, notes: notes[incident.id] || undefined }),
      });
      setNotes((current) => ({ ...current, [incident.id]: '' }));
      setNotice(`Incident moved to ${statusLabel[status]}.`);
      await load();
    } catch (failure) { setError(failure.message); }
    finally { setBusyId(''); }
  }

  return (
    <section className="ops-card">
      <PanelHeading icon={AlertTriangle} title="Incident response" copy="Track incidents through open, investigating, contained, and resolved states. Every change is audited." onRefresh={load} busy={loading || !!busyId} />
      <Alert message={error} /><Alert message={notice} kind="success" />
      {canManage && <form className="ops-form" onSubmit={openIncident}>
        <div className="ops-form-title"><Plus size={15} />Open an incident</div>
        <label className="ops-field">Incident title<input required minLength={5} maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Describe the security event" /></label>
        <label className="ops-field">Severity<select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value })}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></label>
        <label className="ops-field">Initial response notes <span className="ops-field-help">Optional. Notes are stored as incident records; never include passwords, tokens, or secret values.</span><textarea maxLength={2000} rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="What happened and what has been observed?" /></label>
        <button type="submit" className="workspace-primary-button ops-primary-button" disabled={busyId === 'new'}>{busyId === 'new' ? 'Opening…' : 'Open incident'}</button>
      </form>}
      {loading ? <LoadingState label="Loading incidents…" /> : incidents?.length ? <div className="ops-list ops-incident-list">
        {incidents.map((incident) => <article className="ops-incident" key={incident.id}>
          <div className="ops-row-title"><span className={`ops-severity ${incident.severity.toLowerCase()}`}>{incident.severity}</span><span className={`ops-status ${incident.status !== 'RESOLVED' ? 'active' : ''}`}>{statusLabel[incident.status]}</span><time>{new Date(incident.createdAt).toLocaleString()}</time></div>
          <h3>{incident.title}</h3><p className="ops-incident-owner">Opened by {incident.openedBy?.email || 'workspace member'}</p>
          {incident.activities?.length > 0 && <ol className="ops-timeline">{[...incident.activities].reverse().map((activity) => <li key={activity.id}><span>{activity.action.replace('incident.', '').replaceAll('_', ' ')}</span><time>{new Date(activity.createdAt).toLocaleString()}</time><small>{activity.actor?.email || 'Responder'}{activity.notes ? ` · ${activity.notes}` : ''}</small></li>)}</ol>}
          {canManage && nextIncidentStatus[incident.status] && <div className="ops-incident-controls"><label className="ops-field">Response update<input maxLength={2000} value={notes[incident.id] || ''} onChange={(event) => setNotes((current) => ({ ...current, [incident.id]: event.target.value }))} placeholder="Optional note for the incident timeline" /></label><button type="button" className="ops-quiet-button" disabled={busyId === incident.id} onClick={() => advanceIncident(incident)}>{busyId === incident.id ? 'Updating…' : `Move to ${statusLabel[nextIncidentStatus[incident.status]]}`}<ChevronRight size={14} /></button></div>}
        </article>)}
      </div> : <div className="ops-empty"><Activity size={20} /><strong>No incidents recorded</strong><span>Open an incident when your team needs a shared, auditable response record.</span></div>}
      {!canManage && <p className="ops-permission-note">You can review incident records. Administrators and Security Managers manage the response workflow.</p>}
      <p className="ops-footnote">This register tracks response notes and status. Automated containment, alert delivery, and secret rotation are separate integrations.</p>
    </section>
  );
}

export function MonitoringView() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function load() {
    setLoading(true); setError('');
    try { setDashboard(await request('/dashboard')); }
    catch (failure) { setError(failure.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  const metrics = dashboard?.metrics || {};
  return <section className="ops-card">
    <PanelHeading icon={Activity} title="Security activity" copy="Live organization authentication and audit activity from the vault database." onRefresh={load} busy={loading} />
    <Alert message={error} />
    {loading ? <LoadingState label="Loading security activity…" /> : <>
      <div className="ops-metrics"><div><span>Sign-ins · 30 days</span><strong>{metrics.loginTotal || 0}</strong></div><div><span>Failed attempts</span><strong>{metrics.loginFailures || 0}</strong></div><div><span>Pending approvals</span><strong>{metrics.pendingApprovals || 0}</strong></div><div><span>Open incidents</span><strong>{metrics.openIncidents || 0}</strong></div></div>
      <h3 className="ops-subheading">Authentication trend</h3><DashboardActivityChart activity={dashboard?.loginActivity || []} />
      <h3 className="ops-subheading">Latest audit events</h3>
      {dashboard?.recentEvents?.length ? <div className="ops-list">{dashboard.recentEvents.map((event) => <div className="ops-row" key={event.id}><div className="ops-row-main"><div className="ops-row-title">{event.action}</div><p>{event.resourceType} · {new Date(event.createdAt).toLocaleString()}</p></div></div>)}</div> : <p className="ops-empty-inline">No events have been recorded yet.</p>}
      <p className="ops-footnote">These are persisted activity records. Anomaly detection and email/Slack alert delivery have not been configured.</p>
    </>}
  </section>;
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

export function ReportsView() {
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  async function load() {
    setLoading(true); setError(''); setNotice('');
    try { setEvents(await request('/audit')); }
    catch (failure) { setError(failure.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  function download() {
    if (!events?.length) return;
    const columns = ['id', 'actorId', 'action', 'resourceType', 'resourceId', 'previousHash', 'eventHash', 'createdAt'];
    const csv = [columns.map(csvCell).join(','), ...events.map((event) => columns.map((column) => csvCell(event[column])).join(','))].join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `aegis-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Audit CSV downloaded. Secret values and event metadata are excluded.');
  }
  return <section className="ops-card">
    <PanelHeading icon={FileText} title="Audit report export" copy="Download a CSV evidence file containing the most recent audit-chain fields." onRefresh={load} busy={loading} />
    <Alert message={error} /><Alert message={notice} kind="success" />
    {loading ? <LoadingState label="Loading authorized audit records…" /> : <div className="ops-report-summary"><div><strong>{events?.length || 0}</strong><span>events available · maximum 100 most recent</span></div><button type="button" className="workspace-primary-button ops-primary-button" onClick={download} disabled={!events?.length}><Download size={15} />Download CSV</button></div>}
    <div className="ops-report-fields"><Check size={15} /><span>Includes event ID, actor, action, resource references, chain hashes, and timestamp. Secret values are never included.</span></div>
    <p className="ops-footnote">This is an operational audit export. It is not a certified compliance report or an externally anchored audit checkpoint.</p>
  </section>;
}

export function SettingsView({ user }) {
  const details = [
    ['Organization', user?.organizationName || 'Unknown organization'],
    ['Organization ID', user?.organizationId || 'Unavailable'],
    ['Signed-in account', user?.email || 'Unavailable'],
    ['Workspace role', user?.role?.replaceAll('_', ' ') || 'Unavailable'],
  ];
  return <section className="ops-card">
    <PanelHeading icon={ShieldCheck} title="Account and organization" copy="Review the identity and organization attached to this active session." />
    <dl className="ops-settings-list">{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <p className="ops-footnote">Profile editing, MFA enrollment, password recovery, and session management need the identity-management workflow before they can be changed here.</p>
  </section>;
}
