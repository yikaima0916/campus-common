import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {runMailAi, neuronsFor} from '../src/mail-ai.js';

function setup(usage) {
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE kv (key TEXT PRIMARY KEY, value TEXT)');
  const state = {inferences: 0};
  const env = {
    ENABLE_AI: 'true',
    MAIL_AI_DAILY_NEURONS: '3000',
    AI: {async run() { state.inferences++; return {response: 'ok', usage}; }},
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
  const spent = () => Number(db.prepare("SELECT value FROM kv WHERE key LIKE 'mail-ai-budget:%'").get()?.value || 0);
  return {db, env, state, spent};
}
const messages = [{role: 'user', content: 'A school email.'.repeat(120)}];

test('automatic previews leave part of the daily budget for opened mail', async () => {
  // Each call reports about 400 neurons of real use.
  const {db, env, state, spent} = setup({prompt_tokens: 600, completion_tokens: 1800});
  try {
    const preview = () => runMailAi(env, 'brief', messages, 1800, {preview: true});
    let previews = 0;
    while (await preview()) previews++;
    assert.equal(previews, 4); // 60% of 3,000 neurons
    assert.ok(spent() <= 1800);
    assert.ok(await runMailAi(env, 'brief', messages, 1800));
    assert.ok(await runMailAi(env, 'full-translation', messages, 1100));
    assert.equal(state.inferences, 6);
  } finally {
    db.close();
  }
});

test('the unused part of a reservation is returned after inference', async () => {
  const {db, env, spent} = setup({prompt_tokens: 500, completion_tokens: 300});
  try {
    assert.ok(await runMailAi(env, 'brief', messages, 1800, {preview: true}));
    assert.equal(spent(), neuronsFor(500, 300));
  } finally {
    db.close();
  }
});
