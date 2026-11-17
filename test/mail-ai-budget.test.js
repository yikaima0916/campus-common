import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {runMailAi} from '../src/mail-ai.js';

test('automatic previews leave part of the daily budget for opened mail', async () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec('CREATE TABLE kv (key TEXT PRIMARY KEY, value TEXT)');
    let inferences = 0;
    const env = {
      ENABLE_AI: 'true',
      MAIL_AI_DAILY_NEURONS: '3000',
      AI: {async run() { inferences++; return {response: 'ok'}; }},
      DB: {prepare(sql) {
        const statement = db.prepare(sql);
        return {bind(...args) {
          return {
            async first() { return statement.get(...args); },
            async run() { return {meta: statement.run(...args)}; }
          };
        }};
      }}
    };
    const messages = [{role: 'user', content: 'A school email.'.repeat(120)}];
    const preview = () => runMailAi(env, 'brief', messages, 1800, {preview: true});
    assert.ok(await preview());
    assert.ok(await preview());
    assert.equal(await preview(), null);
    assert.equal(inferences, 2);
    assert.ok(await runMailAi(env, 'brief', messages, 1800));
    assert.ok(await runMailAi(env, 'full-translation', messages, 1100));
    assert.equal(inferences, 4);
  } finally {
    db.close();
  }
});
