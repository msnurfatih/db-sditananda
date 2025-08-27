import { classifyCharacter } from '../../utils/processing';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Field "text" required' });

  try {
    const label = await classifyCharacter(text);
    return res.status(200).json({ character: label });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Klasifikasi gagal' });
  }
}
