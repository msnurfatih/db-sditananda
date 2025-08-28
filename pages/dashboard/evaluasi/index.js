import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout'
import { supabase } from '@/utils/supabaseClient'

export const pageTitle = 'Hasil Evaluasi Siswa';

export default function EvaluasiPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);

    const {
      data: { session: curSession },
    } = await supabase.auth.getSession();

    if (!curSession) {
      router.replace('/login');
      return;
    }
    setSession(curSession);

    const { data, error } = await supabase
      .from('siswa')
      .select('id, nama, kelas, evaluasi(guru_id, karakter, strategi, observasi)')
      .order('kelas', { ascending: true })
      .order('nama', { ascending: true });

    if (error) {
      console.error('❌ Gagal ambil data siswa:', error.message);
      setSiswaList([]);
    } else {
      setSiswaList(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [router]);

  const grouped = useMemo(() => {
    return siswaList.reduce((acc, curr) => {
      const kelas = curr.kelas || 'Lainnya';
      if (!acc[kelas]) acc[kelas] = [];
      acc[kelas].push(curr);
      return acc;
    }, {});
  }, [siswaList]);

  const handleEvaluasi = async (id, nama) => {
    const confirm = window.confirm(`Lanjutkan evaluasi AI untuk ${nama}?`);
    if (!confirm) return;

    const {
      data: { session: freshSession },
    } = await supabase.auth.getSession();

    if (!freshSession?.user?.id) {
      alert('❌ Guru belum login.');
      return;
    }

    const guru_id = freshSession.user.id;

    try {
      const res = await fetch(`/api/evaluasi/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guru_id }),
      });

      let result = {};
      try {
        result = await res.json();
      } catch (_) {}

      if (res.ok) {
        alert(`✅ Evaluasi berhasil!\n\nKarakter: ${result.karakter}\nStrategi: ${result.strategi}`);
        fetchAll();
      } else {
        const diag = result?.diag ? `\n\nDiag: ${JSON.stringify(result.diag)}` : '';
        alert(`❌ Gagal evaluasi: ${result?.error || 'Bad Request'}${diag}`);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Terjadi kesalahan saat melakukan evaluasi.');
    }
  };

  return (
    <Layout pageTitle={pageTitle}>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">📊 Hasil Evaluasi Siswa</h1>

        {loading ? (
          <p>Memuat data…</p>
        ) : Object.keys(grouped).length === 0 ? (
          <p>Tidak ada data siswa.</p>
        ) : (
          Object.entries(grouped).map(([kelas, siswas]) => (
            <div key={kelas} className="mb-10">
              <h2 className="text-lg font-bold mb-3">📘 Kelas {kelas}</h2>

              <div className="space-y-3">
                {siswas.map((siswa) => {
                  const evalData = siswa.evaluasi?.find(
                    (e) => e.guru_id === session?.user?.id
                  );

                  return (
                    <div
                      key={siswa.id}
                      className="bg-white shadow p-4 rounded flex justify-between items-start"
                    >
                      <div className="max-w-4xl">
                        <p className="font-semibold text-lg">{siswa.nama}</p>
                        <p className="text-sm text-gray-500 mb-2">Kelas: {siswa.kelas}</p>

                        {evalData ? (
                          <div className="text-sm space-y-2">
                            <details className="bg-gray-50 border border-gray-200 p-2 rounded">
                              <summary className="cursor-pointer font-semibold text-blue-600">
                                📝 Observasi
                              </summary>
                              <p className="mt-2 text-gray-800 whitespace-pre-wrap">
                                {evalData.observasi}
                              </p>
                            </details>

                            <div className="border-l-4 border-green-400 bg-green-50 p-3 rounded">
                              <p><strong>🧠 Karakter:</strong> {evalData.karakter}</p>
                              <p className="mt-1"><strong>🎯 Strategi:</strong> {evalData.strategi}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">Belum dievaluasi</p>
                        )}
                      </div>

                      <div className="ml-4">
                        <button
                          disabled={!!evalData}
                          onClick={() => handleEvaluasi(siswa.id, siswa.nama)}
                          className={`px-4 py-2 rounded text-sm transition ${
                            evalData
                              ? 'bg-green-100 text-green-700 cursor-not-allowed'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {evalData ? '✅ Sudah Dievaluasi' : '🤖 Evaluasi AI'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
