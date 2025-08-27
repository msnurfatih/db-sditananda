// pages/api/ping-gpt.js
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  try {
    const r = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Tolong balas satu kata: PONG' }],
      max_tokens: 5,
      temperature: 0,
    });
    return res.status(200).json({ reply: r.choices[0].message.content });
  } catch (e) {
    const msg = e?.response?.data?.error?.message || e.message || String(e);
    console.error('[ping-gpt] error:', msg);
    return res.status(500).json({ error: msg });
  }
}
