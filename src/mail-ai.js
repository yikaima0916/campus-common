const model = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
// Published Workers AI rates for this model, in neurons per token.
const inputRate = 26668 / 1e6;
const outputRate = 204805 / 1e6;
const cooldownKey = 'fulltrans:cooldown';
const previewBudgetShare = 0.75;
const today = () => new Date().toISOString().slice(0, 10);
export async function mailAiStatus(env) {
  if (env.ENABLE_AI !== 'true' || !env.AI) return 'disabled';
  const row = await env.DB.prepare('SELECT value FROM kv WHERE key=?').bind(cooldownKey).first();
  if (Number(row?.value || 0) > Date.now()) return 'quota';
  const limit = Number(env.MAIL_AI_DAILY_NEURONS || 0);
  if (limit > 0) {
    const budget = await env.DB.prepare('SELECT value FROM kv WHERE key=?').bind('mail-ai-budget:' + today()).first();
    if (Number(budget?.value || 0) >= limit) return 'quota';
  }
  return 'ready';
}
// UTF-8 bytes / 3 over-estimates tokens for both English (about 4 bytes per
// token) and Chinese (about 3 bytes per character), so the reservation is safe.
export const estimateInputTokens = messages => Math.ceil((new TextEncoder().encode(JSON.stringify(messages)).length + 256) / 3);
export const neuronsFor = (inputTokens, outputTokens) => Math.ceil(inputTokens * inputRate + outputTokens * outputRate);
/** Neurons actually used, from the model's reported usage or a conservative estimate. */
export function actualNeurons(output, estimatedInput, maxTokens) {
  const usage = output?.usage;
  const reported = Number(usage?.neurons);
  if (Number.isFinite(reported) && reported >= 0) return Math.ceil(reported);
  const prompt = Number(usage?.prompt_tokens), completion = Number(usage?.completion_tokens);
  if (Number.isFinite(prompt) && Number.isFinite(completion) && prompt >= 0 && completion >= 0) return neuronsFor(prompt, completion);
  const text = typeof output?.response === 'string' ? output.response : JSON.stringify(output?.response ?? '');
  // Without usage data assume one token per two characters, capped at the reservation.
  return neuronsFor(estimatedInput, Math.min(maxTokens, Math.ceil(text.length / 2)));
}
// Reserve a conservative allowance before inference, then return the unused
// part once the model reports what it actually used. The atomic update covers
// concurrent requests and all accounts on this Worker. Cached reads cost zero.
export async function runMailAi(env, feature, messages, maxTokens, {preview = false} = {}) {
  if (await mailAiStatus(env) !== 'ready') return null;
  const limit = Number(env.MAIL_AI_DAILY_NEURONS || 0);
  const estimatedInput = estimateInputTokens(messages);
  const charge = neuronsFor(estimatedInput, maxTokens);
  const day = today(), budgetKey = 'mail-ai-budget:' + day;
  const refund = async amount => {
    if (!(limit > 0) || !(amount > 0)) return;
    await env.DB.prepare('UPDATE kv SET value=MAX(0,CAST(value AS INTEGER)-?) WHERE key=?').bind(Math.floor(amount), budgetKey).run().catch(() => {});
  };
  if (limit > 0) {
    // Automatic previews share the same counter but cannot consume the portion
    // reserved for explicitly opening an email or requesting a summary.
    const ceiling = preview ? Math.floor(limit * previewBudgetShare) : limit;
    if (charge > ceiling) return null;
    const reservation = await env.DB.prepare(
      'INSERT INTO kv(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=CAST(value AS INTEGER)+excluded.value WHERE CAST(value AS INTEGER)+excluded.value<=?'
    ).bind(budgetKey, charge, ceiling).run();
    if (!reservation.meta.changes) return null;
  }
  let output;
  try {
    output = await env.AI.run(model, {messages, max_tokens: maxTokens});
  } catch (error) {
    // A failed request produced no output; keep only the input estimate.
    await refund(charge - neuronsFor(estimatedInput, 0));
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
  await refund(charge - actualNeurons(output, estimatedInput, maxTokens));
  return output;
}
