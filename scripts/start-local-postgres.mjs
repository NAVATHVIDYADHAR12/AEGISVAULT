import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apiEnvPath = path.join(projectRoot, 'apps', 'api', '.env');
const databaseLine = existsSync(apiEnvPath)
  ? readFileSync(apiEnvPath, 'utf8').match(/^\s*DATABASE_URL\s*=\s*(.+?)\s*$/m)?.[1]
  : process.env.DATABASE_URL;

if (!databaseLine) {
  console.log('DATABASE_URL is not configured; skipping the workspace-local PostgreSQL runtime.');
  process.exit(0);
}

let databaseUrl;
try {
  databaseUrl = new URL(databaseLine.trim().replace(/^['"]|['"]$/g, ''));
} catch {
  console.log('DATABASE_URL is invalid; skipping the workspace-local PostgreSQL runtime.');
  process.exit(0);
}

const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
if (!loopbackHosts.has(databaseUrl.hostname)) {
  console.log('DATABASE_URL uses an external host; relying on that PostgreSQL server.');
  process.exit(0);
}

const localPostgres = path.join(projectRoot, '.local-postgres');
const pgCtl = path.join(localPostgres, 'pgsql', 'bin', process.platform === 'win32' ? 'pg_ctl.exe' : 'pg_ctl');
const dataDirectory = path.join(localPostgres, 'data');

if (!existsSync(pgCtl) || !existsSync(dataDirectory)) {
  console.log('No workspace-local PostgreSQL runtime found; relying on the configured PostgreSQL server.');
  process.exit(0);
}

const status = spawnSync(pgCtl, ['-D', dataDirectory, 'status'], { stdio: 'ignore' });
if (status.status === 0) {
  console.log('Workspace-local PostgreSQL is already running.');
  process.exit(0);
}

const host = databaseUrl.hostname === 'localhost' ? 'localhost' : databaseUrl.hostname.replace(/^\[|\]$/g, '');
const port = databaseUrl.port || '5432';
const logFile = path.join(localPostgres, 'postgres.log');
const start = spawnSync(pgCtl, [
  '-D', dataDirectory,
  '-l', logFile,
  '-o', `-h ${host} -p ${port} -c listen_addresses=${host}`,
  '-w', 'start',
], { stdio: 'inherit' });

if (start.error) throw start.error;
if (start.status !== 0) process.exit(start.status ?? 1);
