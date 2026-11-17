import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [sourceDb, sourceEmail, targetEmail, mode] = process.argv.slice(2);
const targetDb = 'campus-companion-i4i';
if (!sourceDb || sourceDb === targetDb || !sourceEmail || !targetEmail ||
    (mode !== undefined && mode !== '--apply')) {
  process.exitCode = 1;
  console.error('Usage: node scripts/copy-oop-mail.mjs OOP_DB OOP_LOGIN_EMAIL I4I_LOGIN_EMAIL [--apply]');
} else {
  try {
    copyMail();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

function sql(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return "'" + String(value ?? '').replaceAll("'", "''") + "'";
}

function execute(database, args) {
  const result = spawnSync('./node_modules/.bin/wrangler', [
    'd1', 'execute', database, '--config', 'wrangler.i4i.jsonc',
    '--remote', '--json', ...args
  ], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error('D1 command failed for ' + database + '. Verify the database name and run wrangler whoami.');
  }
  const batches = JSON.parse(result.stdout);
  if (!Array.isArray(batches) || batches.some(batch => !batch.success)) {
    throw new Error('D1 did not confirm success for ' + database);
  }
  return batches.flatMap(batch => batch.results ?? []);
}

function read(database, statement) {
  return execute(database, ['--command', statement]);
}

function account(database, email) {
  const [user] = read(database, 'SELECT id FROM users WHERE lower(email)=lower(' + sql(email) + ')');
  if (!user) throw new Error('No matching website login email in ' + database);
  return user.id;
}

function digest(id) {
  return createHash('sha256').update(id).digest('base64url');
}

function copyMail() {
  const sender = account(sourceDb, sourceEmail);
  const recipient = account(targetDb, targetEmail);
  const columns = ['id', 'subject', 'received', 'sender', 'origin', 'category', 'summary', 'action', 'url', 'quality'];
  const source = read(sourceDb, 'SELECT ' + columns.join(',') + ' FROM messages WHERE user_id=' +
    sql(sender) + ' AND category<5 ORDER BY received DESC,id LIMIT 10');
  if (!source.length) throw new Error('The OOP account has no visible mail to copy.');
  const hashes = source.map(row => sql(digest(row.id))).join(',');
  const briefs = read(sourceDb, 'SELECT key,value FROM kv WHERE key GLOB ' +
    sql('brief-v*:' + sender + ':*') + ' AND substr(key,-43) IN (' + hashes + ') ORDER BY key DESC');
  const keys = new Map();
  for (const entry of briefs) {
    const [, , locale, hash] = entry.key.split(':');
    if (!['zh-TW', 'zh-CN', 'en'].includes(locale)) continue;
    const brief = JSON.parse(entry.value);
    const key = locale + ':' + hash;
    if (!keys.has(key) && brief && !brief.fallback && brief.title && brief.points?.length) {
      keys.set(key, entry.value);
    }
  }

  const match = source.map(row => '(id=' + sql(row.id) + ' OR (subject=' +
    sql(row.subject) + ' AND received=' + sql(row.received) + '))').join(' OR ');
  const existing = read(targetDb, 'SELECT id,subject,received FROM messages WHERE user_id=' +
    sql(recipient) + ' AND (' + match + ')');
  const statements = [];
  let inserts = 0;
  let traditional = 0;
  for (const row of source) {
    const exact = existing.find(candidate => candidate.id === row.id);
    const matched = existing.filter(candidate => candidate.subject === row.subject && candidate.received === row.received);
    if (!exact && matched.length > 1) throw new Error('Ambiguous duplicate in i4i. Preview stopped before writing.');
    const previous = exact ?? matched[0];
    const targetId = previous?.id ?? row.id;
    if (!previous) {
      statements.push('INSERT INTO messages (' + columns.join(',') + ',user_id) VALUES (' +
        [...columns.map(column => sql(row[column])), sql(recipient)].join(',') +
        ') ON CONFLICT(user_id,id) DO NOTHING;');
      inserts++;
    }
    for (const locale of ['zh-TW', 'zh-CN', 'en']) {
      const brief = keys.get(locale + ':' + digest(row.id));
      if (!brief) continue;
      const key = ['brief-v7', recipient, locale, digest(targetId)].join(':');
      statements.push('INSERT INTO kv (key,value) VALUES (' + sql(key) + ',' + sql(brief) +
        ') ON CONFLICT(key) DO NOTHING;');
      if (locale === 'zh-TW') traditional++;
    }
  }
  console.log('OOP messages: ' + source.length + ', new i4i rows: ' + inserts +
    ', cached Traditional Chinese briefs found: ' + traditional + '.');
  if (mode !== '--apply') {
    console.log('Preview only. Add --apply to copy these records. No AI calls.');
    return;
  }
  if (!statements.length) return;
  const directory = mkdtempSync(join(tmpdir(), 'campus-mail-'));
  try {
    const file = join(directory, 'copy.sql');
    writeFileSync(file, statements.join('\n'), { mode: 0o600 });
    execute(targetDb, ['--file', file, '--yes']);
    console.log('Copy completed in i4i. Existing mail and summary records were preserved.');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
