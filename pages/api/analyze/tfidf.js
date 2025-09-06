// pages/api/analyze/tfidf.js

import { addDocument, getTfIdfVector } from '../../../utils/processing';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Field "text" is required and cannot be empty.' });
  }

  try {
    // Tambahkan teks ke koleksi TF-IDF sebelum dihitung
    addDocument(text);

    // Hitung vektor TF-IDF
    const vector = getTfIdfVector(text);

    res.status(200).json({ vector });
  } catch (err) {
    console.error('TF-IDF Error:', err);
    res.status(500).json({ error: 'TF-IDF processing failed.' });
  }
}
