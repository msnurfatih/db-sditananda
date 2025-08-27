// pages/api/analyze/tfidf.js

import { getTfIdfVector } from '../../../utils/processing';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Field "text" required' });
  const vector = getTfIdfVector(text);
  res.status(200).json({ vector });
}
