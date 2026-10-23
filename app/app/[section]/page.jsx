import { notFound } from 'next/navigation';
import VaultConsole from '../../../components/vault-console';

const workspacePages = {
  secrets: 'Secrets',
  'rotation-expiry': 'Rotation & Expiry',
  'access-requests': 'Access Requests',
  'users-roles': 'Users & Roles',
  'security-policies': 'Security Policies',
  'emergency-access': 'Emergency Access',
  'audit-logs': 'Audit Logs',
  'monitoring-alerts': 'Monitoring & Alerts',
  'incident-response': 'Incident Response',
  'api-cli': 'API & CLI',
  'integrations-kms': 'Integrations & KMS',
  'reports-compliance': 'Reports & Compliance',
  settings: 'Settings',
};

export function generateStaticParams() {
  return Object.keys(workspacePages).map((section) => ({ section }));
}

export async function generateMetadata({ params }) {
  const { section } = await params;
  return { title: workspacePages[section] || 'Workspace' };
}

export default async function WorkspaceSectionPage({ params }) {
  const { section } = await params;
  const initialPage = workspacePages[section];
  if (!initialPage) notFound();
  return <VaultConsole initialPage={initialPage} />;
}
