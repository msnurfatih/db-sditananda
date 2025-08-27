// pages/dashboard/monitoring/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../utils/supabaseClient';
import Layout from '../../../components/Layout';
import { ChartKarakter } from '../../../components/ChartKarakter';

// Normalisasi 1 nilai jawaban (string/number/boolean) ke skala 1–4
function normalizeOne(v) {
  if (v === null || v === undefined) return null;

  // number atau string angka
  const num = Number(v);
  if (!Number.isNaN(num) && `${v}`.trim() !== '') {
    // Jika skala 0/1 → konversi ke 1/4, jika 1–4 biarkan
    if (num === 0) return 1;        // anggap 0 = sangat rendah
    if (num === 1) return 4;        // boolean true -> 4
    if (num >= 1 && num <= 4) return num;
    // angka lain fallback clamp ke 1..4
    return Math.min(4, Math.max(1, num));
  }

  // string kategori umum
  const s = String(v).trim().toLowerCase();
  if (!s) return null;

  // Ya/Tidak, True/False
  if (['ya', 'y', 'true'].includes(s)) return 4;
  if (['tidak', 'tdk', 'false', 'enggak', 'ga', 'gak'].includes(s)) return 1;

  // Skala likert umum
  if (['sangat setuju', 'sangat baik', 'selalu'].includes(s)) return 4;
  if (['setuju', 'baik', 'sering'].includes(s)) return 3;
  if (['tidak setuju', 'cukup', 'kadang'].includes(s)) return 2;
  if (['sangat tidak setuju', 'kurang', 'jarang', 'tidak pernah'].includes(s)) return 1;

  return null; // tak dikenal
}

// Hitung rata-rata dari berbagai bentuk jawaban -> angka 1–4
function toScore4(any) {
  if (any === null || any === undefined) return null;

  // Sudah angka/teks tunggal
  const single = normalizeOne(any);
  if (single !== null) return single;

  // Mungkin JSON string
  if (typeof any === 'string') {
    try {
      const parsed = JSON.parse(any);
      return toScore4(parsed);
    } catch {
      return null;
    }
  }

  // Array nilai
  if (Array.isArray(any)) {
    const mapped = any.map(normalizeOne).filter((x) => x !== null);
    if (mapped.length === 0) return null;
    return mapped.reduce((a, b) => a + b, 0) / mapped.length;
  }

  // Object {kunci: nilai}
  if (typeof any === 'object') {
    const mapped = Object.values(any).map(normalizeOne).filter((x) => x !== null);
    if (mapped.length === 0) return null;
    return mapped.reduce((a, b) => a + b, 0) / mapped.length;
  }

  return null;
}

export default function Monitoring() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [kelasAktif, setKelasAktif] = useState('SEMUA');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace('/login');

      setUser(session.user);

      const { data: rows, error } = await supabase
        .from('jawaban_observasi')
        .select(`
          id,
          siswa_id,
          waktu_observasi,
          jawaban,
          siswa (
            id,
            nama,
            kelas
          )
        `)
        .eq('guru_id', session.user.id)
        .order('waktu_observasi', { ascending: true });

      if (error) {
        console.error('❌ Ambil observasi gagal:', error.message);
      } else {
        setData(rows || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  // Kelas unik untuk dropdown
  const semuaKelas = Array.from(new Set(data.map((d) => d.siswa?.kelas).filter(Boolean))).sort();

  // Kelompokkan per siswa & tanggal, rata-rata skala 1–4
  const bucket = data.reduce((acc, curr) => {
    const s = curr.siswa;
    if (!s) return acc;

    if (kelasAktif !== 'SEMUA' && s.kelas !== kelasAktif) return acc;

    const nama = s.nama || `ID: ${curr.siswa_id}`;
    const tanggal = new Date(curr.waktu_observasi).toLocaleDateString();
    const key = `${nama}||${tanggal}`;

    if (!acc[key]) acc[key] = { nama, tanggal, list: [] };

    const score = toScore4(curr.jawaban);
    if (score !== null) acc[key].list.push(score);

    return acc;
  }, {});

  // Susun untuk chart
  const finalGrouped = {};
  Object.values(bucket).forEach((row) => {
    if (row.list.length === 0) return;
    const avg = row.list.reduce((a, b) => a + b, 0) / row.list.length; // 1..4
    if (!finalGrouped[row.nama]) finalGrouped[row.nama] = [];
    finalGrouped[row.nama].push({ value: Number(avg.toFixed(2)), waktu: row.tanggal });
  });

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">📊 Monitoring Karakter Siswa</h1>

        {/* Dropdown kelas */}
        <div className="mb-4 flex items-center gap-3">
          <label className="font-medium">Pilih Kelas:</label>
          <select
            value={kelasAktif}
            onChange={(e) => setKelasAktif(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            <option value="SEMUA">Semua Kelas</option>
            {semuaKelas.map((kls) => (
              <option key={kls} value={kls}>{kls}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : Object.keys(finalGrouped).length === 0 ? (
          <p className="text-gray-600">Belum ada data observasi pada kelas ini.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(finalGrouped).map(([namaSiswa, obs], i) => (
              <div key={i} className="bg-white rounded shadow p-4">
                <h2 className="font-semibold mb-2">{namaSiswa}</h2>
                <ChartKarakter data={obs} />
                <div className="text-xs text-gray-500 mt-2">
                  Skala 1–4 (1 = sangat rendah, 4 = sangat baik)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
