// pages/api/rekomendasi.js

import { recommendStrategy } from '../../utils/processing';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  try {
    const { character } = req.body;
    if (!character) {
      return res.status(400).json({ error: 'Field "character" is required' });
    }
    const steps = recommendStrategy(character); 
    return res.status(200).json({ rekomendasi: steps });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
