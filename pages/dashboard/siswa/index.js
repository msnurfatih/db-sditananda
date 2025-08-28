// pages/dashboard/siswa/index.js
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../../components/Layout';
import { supabase } from '../../../utils/supabaseClient';

export default function DaftarSiswaPerKelas() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [siswa, setSiswa] = useState([]);
  const [kelasAktif, setKelasAktif] = useState('SEMUA');

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace('/login');

      const { data, error } = await supabase
        .from('siswa')
        .select('id, nisn, nama, kelas, created_at')
        .eq('guru_id', session.user.id)
        .order('kelas', { ascending: true })
        .order('nama', { ascending: true });

      if (!error) setSiswa(data || []);
      setLoading(false);
    };
    load();
  }, [router]);

  // Kelompokkan per kelas
  const kelompok = useMemo(() => {
    const g = siswa.reduce((acc, s) => {
      const k = (s.kelas || '').trim() || 'Belum Ditentukan';
      if (!acc[k]) acc[k] = [];
      acc[k].push(s);
      return acc;
    }, {});
    const urutKelas = Object.keys(g).sort((a, b) => a.localeCompare(b, 'id'));
    return { data: g, urutKelas };
  }, [siswa]);

  const listKelasUntukFilter = useMemo(
    () => ['SEMUA', ...kelompok.urutKelas],
    [kelompok.urutKelas]
  );

  return (
    <Layout>
      <div className="p-6">
        {/* Header dan filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <h1 className="text-2xl font-bold">Daftar Siswa</h1>
          <div className="flex items-center gap-3">
            <select
              value={kelasAktif}
              onChange={(e) => setKelasAktif(e.target.value)}
              className="border rounded px-3 py-2 bg-white"
              title="Filter kelas"
            >
              {listKelasUntukFilter.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <button
              onClick={() => router.push('/dashboard/siswa/upload')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              📁 Import Excel
            </button>

            <button
              onClick={() => router.push('/dashboard/siswa/tambah')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              + Tambah Siswa
            </button>
          </div>
        </div>

        {/* Data siswa */}
        {loading ? (
          <p>Memuat data…</p>
        ) : siswa.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            Belum ada data siswa. Klik <b>Tambah Siswa</b> atau <b>Import Excel</b> untuk menambahkan.
          </div>
        ) : (
          <>
            {(kelasAktif === 'SEMUA'
              ? kelompok.urutKelas
              : kelompok.urutKelas.filter((k) => k === kelasAktif)
            ).map((kelas) => (
              <section key={kelas} className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">
                    Kelas: <span className="text-blue-700">{kelas}</span>
                  </h2>
                  <span className="text-sm text-gray-500">
                    {kelompok.data[kelas].length} siswa
                  </span>
                </div>

                <ul className="grid md:grid-cols-2 gap-3">
                  {kelompok.data[kelas].map((s) => (
                    <li
                      key={s.id}
                      className="bg-white border rounded p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{s.nama}</p>
                        <p className="text-xs text-gray-500">
                          Ditambahkan: {new Date(s.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/siswa/${s.id}`}
                          className="px-3 py-1 rounded border hover:bg-gray-100"
                          title="Riwayat & Grafik"
                        >
                          Lihat
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
      </div>
    </Layout>
  );
}
