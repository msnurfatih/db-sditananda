// pages/api/analisa-gpt.js
import { OpenAI } from 'openai';

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// MOCK untuk hemat biaya jika GPT gagal
function mockFromQA(data_observasi = []) {
  const teks = data_observasi
    .map((it, i) => `${i + 1}. ${it.pertanyaan}\nJawaban: ${it.jawaban}`)
    .join('\n');

  const low = teks.toLowerCase();
  let karakter = 'Aktif';
  if (low.includes('diam') || low.includes('pendiam')) karakter = 'Pendiam';
  else if (low.includes('disiplin') || low.includes('aturan') || low.includes('patuh')) karakter = 'Disiplin';
  else if (low.includes('rajin') || low.includes('tekun')) karakter = 'Rajin';
  else if (low.includes('pimpin') || low.includes('memimpin') || low.includes('ketua')) karakter = 'Pemimpin';
  else if (low.includes('ide') || low.includes('kreatif')) karakter = 'Kreatif';

  const saran = {
    Aktif: 'Berikan peran diskusi, aktivitas kinestetik, atur giliran bicara.',
    Pendiam: 'Gunakan pertanyaan pancingan, kelompok kecil, think–pair–share.',
    Disiplin: 'Tantangan berstruktur, target harian, peran time keeper.',
    Rajin: 'Proyek jangka pendek, umpan balik positif, perluasan materi.',
    Pemimpin: 'Ketua kelompok, latih empati & manajemen konflik.',
    Kreatif: 'Tugas terbuka, proyek seni/cerita, nilai orisinalitas.',
  }[karakter];

  return `1. Ringkasan Karakter\n- ${karakter}\n\n2. Rekomendasi Strategi Belajar\n- ${saran}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { siswa_id, data_observasi } = req.body || {};
  if (!siswa_id || !data_observasi) return res.status(400).json({ error: 'Data tidak lengkap' });

  // Gunakan mock jika diset atau API Key kosong
  if (process.env.USE_MOCK_AI === 'true' || !client) {
    const hasil = mockFromQA(data_observasi);
    return res.status(200).json({ success: true, mode: 'mock', hasil });
  }

  try {
    const prompt = `
Berikut adalah hasil observasi terhadap siswa:

${data_observasi.map((item, i) => `${i + 1}. ${item.pertanyaan}\nJawaban: ${item.jawaban}\n`).join('\n')}

Analisislah karakter siswa ini secara ringkas dan berikan saran pendekatan pembelajaran yang cocok. Tampilkan dalam dua bagian:

1. Ringkasan Karakter
2. Rekomendasi Strategi Belajar
    `.trim();

    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const hasil = completion.choices?.[0]?.message?.content?.trim() || '';

    // Jangan langsung simpan ke DB di server-side (karena kena RLS)
    // Data akan disimpan oleh client setelah response ini diterima
    return res.status(200).json({
      success: true,
      mode: 'live',
      hasil,
    });
  } catch (err) {
    const msg = String(err?.message || err);

    if (/quota|billing/i.test(msg)) {
      const hasil = mockFromQA(data_observasi);
      return res.status(200).json({
        success: true,
        mode: 'fallback',
        hasil,
        error: msg,
      });
    }

    console.error('ERROR GPT:', msg);
    return res.status(500).json({ error: 'Gagal memproses GPT', detail: msg });
  }
}
