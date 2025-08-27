import supabaseAdmin from '../../../utils/supabaseAdmin';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { id } = req.query;
    const { guru_id } = req.body;

    if (!id || !guru_id) {
      return res.status(400).json({ error: 'Missing siswa id or guru_id' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is missing' });
    }

    const { data: existing, error: exErr } = await supabaseAdmin
      .from('evaluasi')
      .select('id, observasi, karakter, strategi')
      .eq('siswa_id', id)
      .eq('guru_id', guru_id)
      .maybeSingle();

    if (exErr) {
      console.error('❌ cek evaluasi error:', exErr);
      return res.status(500).json({ error: 'Gagal memeriksa evaluasi' });
    }
    if (existing) {
      return res.status(200).json({
        karakter: existing.karakter,
        strategi: existing.strategi,
        observasi: existing.observasi,
        note: 'Evaluasi sudah ada (hasil tersimpan dikembalikan).',
      });
    }

    const { data: jawabanRows, error: jErr } = await supabaseAdmin
      .from('jawaban_observasi')
      .select('pertanyaan_id, jawaban')
      .eq('siswa_id', id)
      .eq('guru_id', guru_id);

    if (jErr) {
      console.error('❌ ambil jawaban error:', jErr);
      return res.status(500).json({ error: 'Gagal mengambil data observasi' });
    }
    if (!jawabanRows || jawabanRows.length === 0) {
      return res.status(400).json({ error: 'Data observasi tidak ditemukan' });
    }

    const pertanyaanIds = [...new Set(jawabanRows.map(r => r.pertanyaan_id))];
    const { data: pertanyaanList, error: pErr } = await supabaseAdmin
      .from('observasi_pertanyaan')
      .select('id, pertanyaan')
      .in('id', pertanyaanIds);

    if (pErr) {
      console.error('❌ ambil pertanyaan error:', pErr);
      return res.status(500).json({ error: 'Gagal mengambil pertanyaan observasi' });
    }

    const petaPertanyaan = new Map((pertanyaanList || []).map(p => [p.id, p.pertanyaan]));
    const observasiGabung = jawabanRows
      .map((r, i) => {
        const tanya = petaPertanyaan.get(r.pertanyaan_id) || `Pertanyaan ${i + 1}`;
        return `${i + 1}. ${tanya}\n   Jawaban: ${r.jawaban ?? ''}`;
      })
      .join('\n');

    const messages = [
      { role: 'system', content: 'Kamu adalah psikolog pendidikan.' },
      {
        role: 'user',
        content: `
Berikut data observasi siswa (Q/A):

${observasiGabung}

Buat ringkasan dalam format JSON PERSIS seperti ini (tanpa teks lain):
{
  "karakter": "deskripsi singkat karakter siswa",
  "strategi": "strategi pembelajaran yang disarankan"
}
`.trim(),
      },
    ];

    const oaResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages,
      }),
    });

    const oaJson = await oaResp.json();
    if (!oaResp.ok) {
      console.error('❌ OpenAI HTTP error:', oaJson);
      return res.status(500).json({
        error: 'Gagal melakukan evaluasi AI',
        diag: oaJson?.error?.message || 'OpenAI request failed',
      });
    }

    const content = oaJson?.choices?.[0]?.message?.content?.trim() || '';

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const k =
        content.match(/"karakter"\s*:\s*"([^"]+)"/i)?.[1] ||
        content.match(/Karakter:\s*(.+)/i)?.[1];
      const s =
        content.match(/"strategi"\s*:\s*"([^"]+)"/i)?.[1] ||
        content.match(/Strategi:\s*(.+)/i)?.[1];
      parsed = { karakter: (k || '').trim(), strategi: (s || '').trim() };
    }

    const karakter = (parsed.karakter || '').slice(0, 2000);
    const strategi = (parsed.strategi || '').slice(0, 2000);

    const { error: saveErr } = await supabaseAdmin
      .from('evaluasi')
      .insert({
        siswa_id: id,
        guru_id,
        observasi: observasiGabung,
        karakter,
        strategi,
        confusion_matrix: '', // ✅ fix error Supabase
      });

    if (saveErr) {
      console.error('❌ simpan evaluasi error:', saveErr);
      return res.status(500).json({
        error: 'Gagal menyimpan hasil evaluasi',
        diag: saveErr.message || saveErr,
      });
    }

    return res.status(200).json({ karakter, strategi, observasi: observasiGabung });
  } catch (err) {
    console.error('❌ Fatal API error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
