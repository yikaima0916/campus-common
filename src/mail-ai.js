const model = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const cooldownKey = 'fulltrans:cooldown';

export async function mailAiStatus(env) {
  if (env.ENABLE_AI !== 'true' || !env.AI) return 'disabled';
  const row = await env.DB.prepare('SELECT value FROM kv WHERE key=?').bind(cooldownKey).first();
  if (Number(row?.value || 0) > Date.now()) return 'quota';
  const limit = Number(env.MAIL_AI_DAILY_NEURONS || 0);
  if (limit > 0) {
    const day = new Date().toISOString().slice(0, 10);
    const budget = await env.DB.prepare('SELECT value FROM kv WHERE key=?').bind('mail-ai-budget:' + day).first();
    if (Number(budget?.value || 0) >= limit) return 'quota';
  }
  return 'ready';
}

// Reserve a conservative allowance before inference. The atomic update covers
// concurrent requests and all accounts on this Worker. Cached reads cost zero.
export async function runMailAi(env, feature, messages, maxTokens) {
  if (await mailAiStatus(env) !== 'ready') return null;
  const limit = Number(env.MAIL_AI_DAILY_NEURONS || 0);
  if (limit > 0) {
    const bytes = new TextEncoder().encode(JSON.stringify(messages)).length;
    const charge = Math.ceil((bytes + 256) * 0.026668 + maxTokens * 0.204805);
    if (charge > limit) return null;
    const day = new Date().toISOString().slice(0, 10);
    const reservation = await env.DB.prepare(
      'INSERT INTO kv(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=CAST(value AS INTEGER)+excluded.value WHERE CAST(value AS INTEGER)+excluded.value<=?'
    ).bind('mail-ai-budget:' + day, charge, limit).run();
    if (!reservation.meta.changes) return null;
  }
  try {
    return await env.AI.run(model, {messages, max_tokens: maxTokens});
  } catch (error) {
    const message = String(error?.message || '');
    const quota = /4006|daily free allocation|neurons|quota|rate.?limit|429/i.test(message);
    if (quota) {
      const now = new Date();
      const reset = /daily|neurons|4006/i.test(message)
        ? Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
        : Date.now() + 60_000;
      await env.DB.prepare(
        'INSERT INTO kv(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value'
      ).bind(cooldownKey, String(reset)).run().catch(() => {});
    }
    console.warn('mail-ai-unavailable', {feature, model, reason: quota ? 'quota' : 'provider-error'});
    return null;
  }
}
