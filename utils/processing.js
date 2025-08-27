// utils/processing.js

import natural from 'natural';
import { openai } from './openaiClient';

// Inisialisasi TF-IDF
const tfidf = new natural.TfIdf();

// Tambahkan dokumen ke koleksi TF-IDF
export function addDocument(text) {
  tfidf.addDocument(text);
}

// Hitung vektor TF-IDF untuk satu teks
export function getTfIdfVector(text) {
  const vec = {};
  tfidf.tfidf(text, (i, measure, term) => {
    vec[term] = measure;
  });
  return vec;
}

// Panggil OpenAI embeddings (text-embedding-ada-002)
export async function getBertEmbedding(text) {
  const resp = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return resp.data[0].embedding;
}
