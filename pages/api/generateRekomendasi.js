// pages/api/generateRekomendasi.js
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { nama, observasi, mbti } = req.body;

  if (!nama || !observasi) {
    return res.status(400).json({ message: 'Nama dan observasi wajib diisi' });
  }

  const prompt = `
Siswa bernama ${nama} memiliki catatan observasi berikut:

"${observasi}"

${mbti ? `Selain itu, berdasarkan kuisioner MBTI, tipe kepribadiannya adalah ${mbti}.` : ''}

Berdasarkan informasi tersebut:
1. Jelaskan secara singkat karakter siswa ini.
2. Tentukan tipe MBTI jika mungkin.
3. Rekomendasikan strategi pembelajaran yang sesuai.
Jawab dalam format JSON seperti:
{
  "karakter": "...",
  "mbti": "...",
  "strategi": "..."
}
`;

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const result = completion.data.choices[0].message.content;

    // Coba parse JSON dari GPT
    let json;
    try {
      json = JSON.parse(result);
    } catch (e) {
      return res.status(500).json({ message: 'Gagal membaca format respons dari AI', raw: result });
    }

    res.status(200).json({ success: true, ...json });
  } catch (error) {
    console.error('❌ Error dari OpenAI:', error);
    res.status(500).json({ message: 'Gagal menghubungi OpenAI', error });
  }
}
