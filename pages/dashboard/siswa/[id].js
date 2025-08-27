import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../utils/supabaseClient';
import Layout from '../../../components/Layout';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line
} from 'recharts';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export default function ProfilSiswaPage() {
  const router = useRouter();
  const { id } = router.query;

  const [siswa, setSiswa] = useState(null);
  const [observasi, setObservasi] = useState([]);
  const [analisis, setAnalisis] = useState(null);
  const [evaluasiAI, setEvaluasiAI] = useState(null);
  const [tfidfResult, setTfidfResult] = useState(null);
  const [embedResult, setEmbedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showObservasi, setShowObservasi] = useState(false); // untuk expand/collapse

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return router.replace('/login');

      const { data: siswaData } = await supabase
        .from('siswa')
        .select('*')
        .eq('id', id)
        .single();
      setSiswa(siswaData);

      const { data: obsData } = await supabase
        .from('jawaban_observasi')
        .select('jawaban, waktu_observasi')
        .eq('siswa_id', id)
        .order('waktu_observasi', { ascending: true });
      setObservasi(obsData || []);

      const { data: hasil } = await supabase
        .from('hasil_observasi')
        .select('hasil_analisis')
        .eq('siswa_id', id)
        .order('created_at', { descending: true })
        .limit(1)
        .single();
      setAnalisis(hasil?.hasil_analisis || null);

      const { data: evaluasiData, error: evalError } = await supabase
        .from('evaluasi')
        .select('id, siswa_id, karakter, strategi, created_at')
        .eq('siswa_id', id)
        .order('created_at', { descending: true })
        .limit(1)
        .single();

      if (evalError) console.error("Evaluasi Error:", evalError);

      setEvaluasiAI(evaluasiData || null);

      setLoading(false);
    })();
  }, [id]);

  const analyzeTfidf = async () => {
    const last = observasi[observasi.length - 1];
    if (!last) return toast.error('Belum ada observasi');
    const tId = toast.loading('Analisis TF-IDF...');
    try {
      const res = await fetch('/api/analyze/tfidf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: last.jawaban }),
      });
      const { vector } = await res.json();
      setTfidfResult(vector);
      toast.success('Selesai TF-IDF', { id: tId });
    } catch (err) {
      toast.error('Gagal TF-IDF: ' + err.message, { id: tId });
    }
  };

  const analyzeEmbedding = async () => {
    const last = observasi[observasi.length - 1];
    if (!last) return toast.error('Belum ada observasi');
    const tId = toast.loading('Analisis Embedding...');
    try {
      const res = await fetch('/api/analyze/embedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: last.jawaban }),
      });
      const { embedding } = await res.json();
      setEmbedResult(embedding);
      toast.success('Selesai Embedding', { id: tId });
    } catch (err) {
      toast.error('Gagal Embedding: ' + err.message, { id: tId });
    }
  };

  const exportPDF = async () => {
    const tId = toast.loading('Membuat PDF...');
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      let y = 10;

      doc.setFontSize(16);
      doc.text('Laporan Profil Siswa', pageWidth / 2, y, { align: 'center' });
      y += 10;

      doc.setFontSize(12);
      doc.text(`Nama: ${siswa.nama}`, margin, y); y += 8;
      doc.text(`NISN: ${siswa.nisn}`, margin, y); y += 8;
      doc.text(`Kelas: ${siswa.kelas}`, margin, y); y += 8;
      doc.text(`Tempat Lahir: ${siswa.tempat_lahir}`, margin, y); y += 8;
      doc.text(`Tanggal Lahir: ${siswa.tanggal_lahir}`, margin, y); y += 8;
      doc.text(`Alamat: ${siswa.alamat}`, margin, y); y += 12;

      if (evaluasiAI) {
        doc.setFontSize(13);
        doc.setTextColor(40, 100, 60);
        doc.text('Hasil Evaluasi AI:', margin, y); y += 8;
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        const charLines = doc.splitTextToSize(`Karakter: ${evaluasiAI.karakter}`, pageWidth - 2 * margin);
        const stratLines = doc.splitTextToSize(`Strategi: ${evaluasiAI.strategi}`, pageWidth - 2 * margin);

        [...charLines, '', ...stratLines].forEach(line => {
          if (y > 270) { doc.addPage(); y = 10; }
          doc.text(line, margin, y);
          y += 6;
        });

        y += 6;
      }

      if (analisis) {
        doc.setFontSize(13);
        doc.setTextColor(40, 40, 160);
        doc.text('Hasil Analisis Karakter AI:', margin, y); y += 8;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);

        const lines = doc.splitTextToSize(analisis, pageWidth - 2 * margin);
        lines.forEach(line => {
          if (y > 270) { doc.addPage(); y = 10; }
          doc.text(line, margin, y);
          y += 6;
        });
      }

      doc.save(`${siswa.nama}_Laporan.pdf`);
      toast.success('PDF berhasil dibuat!', { id: tId });
    } catch (err) {
      toast.error('Gagal membuat PDF', { id: tId });
      console.error(err);
    }
  };

  const barChartData = observasi.map((item, i) => ({
    name: `#${i + 1}`,
    value: parseFloat(item.jawaban) || 0,
  }));

  const lineChartData = observasi.map((item) => ({
    date: new Date(item.waktu_observasi).toLocaleDateString(),
    value: parseFloat(item.jawaban) || 0,
  }));

  if (loading || !siswa) return <Layout><p className="p-6">Loading...</p></Layout>;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Profil Siswa</h1>
        <div className="grid gap-3">
          <input className="border p-2 rounded" value={siswa.nama || ''} readOnly />
          <input className="border p-2 rounded" value={siswa.nisn || ''} readOnly />
          <input className="border p-2 rounded" value={siswa.kelas || ''} readOnly />
          <input className="border p-2 rounded" value={siswa.tempat_lahir || ''} readOnly />
          <input className="border p-2 rounded" value={siswa.tanggal_lahir || ''} readOnly />
          <input className="border p-2 rounded" value={siswa.alamat || ''} readOnly />
        </div>

        {evaluasiAI && (
          <div className="border-l-4 border-green-500 bg-green-50 p-4 text-sm text-green-900">
            <strong className="text-green-700 block mb-2">🧠 Hasil Evaluasi AI</strong>
            <p><strong>Karakter:</strong> {evaluasiAI.karakter}</p>
            <p className="mt-1"><strong>Strategi:</strong> {evaluasiAI.strategi}</p>
          </div>
        )}

        {analisis && (
          <div className="border-l-4 border-indigo-500 bg-indigo-50 p-4 text-sm text-indigo-900">
            <strong className="text-indigo-700 block mb-2">📘 Hasil Analisis Karakter AI</strong>
            <div className="whitespace-pre-wrap break-words leading-relaxed">
              {analisis}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-2">📜 Riwayat Observasi</h2>
          <button
            onClick={() => setShowObservasi(!showObservasi)}
            className="text-blue-600 underline text-sm mb-2"
          >
            {showObservasi ? '🔽 Sembunyikan Riwayat' : '▶️ Lihat Riwayat'}
          </button>

          {showObservasi && (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {observasi.map((o, i) => (
                <li key={i}>
                  {new Date(o.waktu_observasi).toLocaleDateString()} — Jawaban: {o.jawaban}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">📊 Grafik Observasi</h2>
          <div className="flex flex-wrap gap-8">
            <BarChart width={300} height={200} data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>

            <LineChart width={300} height={200} data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#82ca9d" />
            </LineChart>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={analyzeTfidf} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            TF-IDF
          </button>
          <button onClick={analyzeEmbedding} className="bg-indigo-800 text-white px-4 py-2 rounded hover:bg-indigo-900">
            Embedding
          </button>
          <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Export PDF
          </button>
        </div>

        {(tfidfResult || embedResult) && (
          <div className="bg-gray-100 p-4 rounded text-sm">
            {tfidfResult && (
              <>
                <h3 className="font-bold">TF-IDF:</h3>
                <pre className="whitespace-pre-wrap overflow-auto">{JSON.stringify(tfidfResult, null, 2)}</pre>
              </>
            )}
            {embedResult && (
              <p className="mt-2">Embedding length: {embedResult.length}</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
