// utils/processing.js

import natural from 'natural';
import { openai } from './openaiClient';

// Inisialisasi global TF-IDF
const tfidf = new natural.TfIdf();

// Tambahkan dokumen ke koleksi TF-IDF
export function addDocument(text) {
  tfidf.addDocument(text);
}

// Hitung vektor TF-IDF dan kembalikan sebagai array terurut
export function getTfIdfVector(text) {
  const vector = [];
  tfidf.tfidf(text, (i, score, term) => {
    vector.push({ term, score: parseFloat(score.toFixed(4)) });
  });

  // Urutkan berdasarkan skor tertinggi
  return vector.sort((a, b) => b.score - a.score);
}

// Panggil OpenAI untuk menghasilkan embedding berbasis BERT
export async function getBertEmbedding(text) {
  const resp = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return resp.data[0].embedding;
}
