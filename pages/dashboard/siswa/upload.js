// pages/dashboard/siswa/upload.js

import { useState } from 'react';
import * as XLSX from 'xlsx';
import Layout from '@/components/Layout'
import { supabase } from '@/utils/supabaseClient'

export default function UploadSiswaPage() {
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState('');

  function normalizeDate(input) {
    if (!input) return null;
    if (input instanceof Date && !isNaN(input)) {
      return input.toISOString().split('T')[0];
    }
    if (typeof input === 'number') {
      const d = XLSX.SSF.parse_date_code(input);
      if (!d) return null;
      return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
    }
    const s = String(input).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const m1 = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m1) return `${m1[3]}-${m1[2].padStart(2, '0')}-${m1[1].padStart(2, '0')}`;
    const d = new Date(s);
    if (!isNaN(d)) return d.toISOString().split('T')[0];
    return null;
  }

  const handleUpload = async (e) => {
    setStatus('');
    setProgress('');
    const file = e.target.files?.[0];
    if (!file) return;

    const isCSV = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';
    if (!isCSV) {
      setStatus('❌ Tolong pilih file CSV (.csv)');
      return;
    }

    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const csvText = evt.target.result;
        const workbook = XLSX.read(csvText, { type: 'string' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!jsonData.length) {
          setStatus('❌ CSV kosong atau header tidak terbaca.');
          return;
        }

        const mappedData = jsonData.map((row) => ({
          nisn: String(row.nisn || '').trim(),
          nama: row.nama || '',
          kelas: row.kelas || '',
          jenis_kelamin: row.jenis_kelamin || '',
          tempat_lahir: row.tempat_lahir || '',
          tanggal_lahir: normalizeDate(row.tanggal_lahir),
          agama: row.agama || '',
          alamat: row.alamat || '',
        }));

        const rows = mappedData.filter((r) => r.nisn !== '');
        if (!rows.length) {
          setStatus('❌ Tidak ada baris valid. Kolom "nisn" wajib diisi.');
          return;
        }

        let inserted = 0;
        const chunkSize = 200;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          const { error } = await supabase.from('siswa').insert(chunk);
          if (error) {
            console.error(error);
            setStatus(`❌ Gagal upload pada batch ${i / chunkSize + 1}: ${error.message}`);
            return;
          } else {
            inserted += chunk.length;
            setProgress(`📤 Mengunggah... ${inserted}/${rows.length} baris`);
          }
        }

        setProgress('');
        setStatus(`✅ Berhasil mengupload ${inserted} data siswa dari CSV!`);
      } catch (err) {
        console.error(err);
        setStatus('❌ Terjadi kesalahan saat memproses file CSV.');
      }
    };

    reader.readAsText(file, 'utf-8');
  };

  return (
    <Layout>
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Upload Data Siswa (CSV)</h1>
        <p className="text-sm text-gray-600 mb-4">
          Pastikan header CSV: <code>nisn,nama,kelas,jenis_kelamin,tempat_lahir,tanggal_lahir,agama,alamat</code>
        </p>

        <input
          type="file"
          accept=".csv"
          onChange={handleUpload}
          className="mb-3"
        />

        {progress && <p className="mt-2">{progress}</p>}
        {status && <p className="mt-2 font-semibold">{status}</p>}
      </div>
    </Layout>
  );
}

