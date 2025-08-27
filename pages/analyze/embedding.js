// pages/api/analyze/embedding.js

import { getBertEmbedding } from '../../../utils/processing';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Field "text" required' });
  try {
    const embedding = await getBertEmbedding(text);
    res.status(200).json({ embedding });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Embedding failed' });
  }
}
