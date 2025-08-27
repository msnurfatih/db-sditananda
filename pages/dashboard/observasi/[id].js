import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';

export default function ObservasiPage() {
  const router = useRouter();
  const { id: siswaId } = router.query;

  const [siswa, setSiswa] = useState(null);
  const [pertanyaanList, setPertanyaanList] = useState([]);
  const [jawaban, setJawaban] = useState({});
  const [guruId, setGuruId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!siswaId) return;
    supabase
      .from('siswa')
      .select('nama, kelas')
      .eq('id', siswaId)
      .single()
      .then(({ data, error }) => {
        if (error) console.error('❌ Gagal ambil siswa:', error.message);
        else setSiswa(data);
      });
  }, [siswaId]);

  useEffect(() => {
    const ambilGuruId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setGuruId(session.user.id);
      }
    };
    ambilGuruId();
  }, []);

  useEffect(() => {
    const fetchPertanyaan = async () => {
      const { data, error } = await supabase
        .from('observasi_pertanyaan')
        .select('*')
        .order('pertanyaan', { ascending: true });
      if (error) {
        console.error('❌ Gagal ambil pertanyaan:', error.message);
      } else {
        setPertanyaanList(data);
      }
    };
    fetchPertanyaan();
  }, []);

  const handleChange = (pertanyaanId, value) => {
    setJawaban((prev) => ({ ...prev, [pertanyaanId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!guruId || !siswaId) return alert("Guru atau Siswa belum dikenali.");

    setLoading(true);
    const waktu_observasi = new Date().toISOString();

    const entries = pertanyaanList.map((item) => ({
      siswa_id: siswaId,
      guru_id: guruId,
      pertanyaan_id: item.id,
      jawaban: jawaban[item.id] || '',
      waktu_observasi
    }));

    const { error } = await supabase.from('jawaban_observasi').insert(entries);
    if (error) {
      alert('❌ Gagal simpan observasi: ' + error.message);
      setLoading(false);
      return;
    }

    const gptRes = await fetch('/api/analisa-gpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siswa_id: siswaId,
        data_observasi: pertanyaanList.map((item) => ({
          pertanyaan: item.pertanyaan,
          jawaban: jawaban[item.id] || ''
        }))
      })
    });

    const gptData = await gptRes.json();
    if (!gptData.success) {
      alert('❌ Gagal analisis AI');
      setLoading(false);
      return;
    }

    const { error: saveError } = await supabase.from('hasil_observasi').insert({
      siswa_id: siswaId,
      guru_id: guruId,
      hasil_analisis: gptData.hasil
    });

    if (saveError) {
      alert('❌ Gagal simpan hasil analisis AI: ' + saveError.message);
      setLoading(false);
      return;
    }

    alert('✅ Observasi & Analisis AI berhasil disimpan!');
    router.push(`/dashboard/siswa/${siswaId}`);
    setLoading(false);
  };

  if (!siswa) return <p className="p-6">Memuat data siswa…</p>;

  const pertanyaanSkala = pertanyaanList.filter((p) => p.tipe_jawaban === 'skala');
  const pertanyaanYaTidak = pertanyaanList.filter((p) => p.tipe_jawaban === 'ya_tidak');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Form Observasi Siswa</h1>
        <p>
          <strong>Nama:</strong> {siswa.nama}<br />
          <strong>Kelas:</strong> {siswa.kelas}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Skala Section */}
        {pertanyaanSkala.length > 0 && (
          <>
            <h2 className="text-xl font-bold mt-10 mb-4">Bagian A: Skala 1–5</h2>
            {pertanyaanSkala.map((item, index) => (
              <div key={item.id} className="border p-4 rounded-xl shadow">
                <p className="text-lg font-semibold mb-4">
                  {index + 1}. {item.pertanyaan}
                </p>
                <div className="flex justify-center gap-4">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleChange(item.id, val)}
                      className={`w-10 h-10 rounded-full border text-base font-medium 
                        flex items-center justify-center transition
                        ${jawaban[item.id] == val ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Ya / Tidak Section */}
        {pertanyaanYaTidak.length > 0 && (
          <>
            <h2 className="text-xl font-bold mt-10 mb-4">Bagian B: Ya / Tidak</h2>
            {pertanyaanYaTidak.map((item, index) => (
              <div key={item.id} className="border p-4 rounded-xl shadow">
                <p className="text-lg font-semibold mb-4">
                  {index + 1}. {item.pertanyaan}
                </p>
                <select
                  value={jawaban[item.id] || ''}
                  onChange={(e) => handleChange(item.id, e.target.value)}
                  className="w-full border rounded p-2"
                >
                  <option value="">-- Pilih --</option>
                  <option value="Ya">Ya</option>
                  <option value="Tidak">Tidak</option>
                </select>
              </div>
            ))}
          </>
        )}

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-6 py-2 rounded"
          >
            Kembali
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            {loading ? 'Menyimpan...' : 'Simpan Observasi'}
          </button>
        </div>
      </form>
    </div>
  );
}
