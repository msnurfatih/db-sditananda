// utils/openaiClient.js

// ❗ Wajib ada di .env.local (server-side)
const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  throw new Error('OPENAI_API_KEY is missing. Add it in .env.local');
}

// (Opsional) coba inisialisasi SDK; kalau gagal/inkompatibel kita pakai fetch.
let sdk = null;
try {
  // Hanya jika paket 'openai' memang terinstall
  // dan environment mendukung konstruktor ini.
  // Tidak wajib; kita akan fallback ke fetch jika tidak ada.
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  const OpenAI = require('openai').default || require('openai');
  sdk = new OpenAI({ apiKey: API_KEY });
} catch {
  sdk = null;
}

/**
 * Panggilan Chat Completion yang selalu jalan:
 * - Coba lewat SDK v4 (chat.completions.create)
 * - Coba lewat SDK v3 (createChatCompletion)
 * - Fallback: HTTP fetch ke https://api.openai.com/v1/chat/completions
 *
 * @param {Object} opts
 * @param {Array<{role:'system'|'user'|'assistant',content:string}>} opts.messages
 * @param {string} [opts.model='gpt-4o-mini']
 * @param {number} [opts.temperature=0.3]
 * @returns {Promise<string>} isi message content
 */
export async function chatCompletion({
  messages,
  model = 'gpt-4o-mini',
  temperature = 0.3,
}) {
  // 1) SDK v4+
  if (sdk?.chat?.completions?.create) {
    const resp = await sdk.chat.completions.create({ model, temperature, messages });
    return resp?.choices?.[0]?.message?.content?.trim() ?? '';
  }

  // 2) SDK v3
  if (typeof sdk?.createChatCompletion === 'function') {
    const resp = await sdk.createChatCompletion({ model, temperature, messages });
    return resp?.data?.choices?.[0]?.message?.content?.trim() ?? '';
  }

  // 3) Fallback: HTTP fetch (selalu ada)
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, temperature, messages }),
  });

  const j = await r.json();
  if (!r.ok) {
    throw new Error(j?.error?.message || 'OpenAI request failed');
  }
  return j?.choices?.[0]?.message?.content?.trim() ?? '';
}

// Export default untuk kompatibilitas lama (kalau ada kode lain still import default)
const openai = { chatCompletion };
export default openai;
