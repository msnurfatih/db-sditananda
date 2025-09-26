import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { supabase } from '@/utils/supabaseClient';

export default function TambahSiswaPage() {
  const router = useRouter();

  const [nisn, setNisn] = useState('');
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [alamat, setAlamat] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nisn.trim() || !nama.trim() || !kelas.trim()) {
      alert('NISN, Nama, dan Kelas wajib diisi');
      return;
    }

    if (!/^\d{10}$/.test(nisn)) {
      alert('NISN harus terdiri dari 10 digit angka');
      return;
    }

    const user = await supabase.auth.getUser();
    const guru_id = user?.data?.user?.id;

    const { error } = await supabase.from('siswa').insert([
      {
        nisn,
        nama,
        kelas,
        jenis_kelamin: jenisKelamin,
        tempat_lahir: tempatLahir,
        tanggal_lahir: tanggalLahir,
        alamat,
        guru_id,
      },
    ]);

    if (error) {
      console.error(error);
      alert(`❌ Gagal menambahkan siswa: ${error.message}`);
    } else {
      alert('✅ Siswa berhasil ditambahkan!');
      router.push('/dashboard/siswa');
    }
  };

  return (
    <Layout pageTitle="Tambah Siswa">
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">➕ Tambah Siswa</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <input value={nisn} onChange={(e) => setNisn(e.target.value)} placeholder="NISN (10 digit)" className="border p-2 rounded" />
          <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Nama Lengkap" className="border p-2 rounded" />
          <input value={kelas} onChange={(e) => setKelas(e.target.value)} placeholder="Kelas" className="border p-2 rounded" />
          <input value={jenisKelamin} onChange={(e) => setJenisKelamin(e.target.value)} placeholder="Jenis Kelamin" className="border p-2 rounded" />
          <input value={tempatLahir} onChange={(e) => setTempatLahir(e.target.value)} placeholder="Tempat Lahir" className="border p-2 rounded" />
          <input value={tanggalLahir} onChange={(e) => setTanggalLahir(e.target.value)} type="date" className="border p-2 rounded" />
          <input value={alamat} onChange={(e) => setAlamat(e.target.value)} placeholder="Alamat" className="border p-2 rounded" />

          <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Simpan Siswa
          </button>
        </form>
      </div>
    </Layout>
  );
}
