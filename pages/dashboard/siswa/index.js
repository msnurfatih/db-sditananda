// pages/dashboard/index.js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout'
import { supabase } from '@/utils/supabaseClient'

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Trigger ulang walau path sama
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace('/login');
      setUser(session.user);
    };

    checkSession();
  }, [router.asPath]); // <- kunci agar refresh saat klik menu yang sama

  if (!user) {
    return (
      <Layout>
        <p>Memuat data pengguna…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Dashboard Guru</h1>
      <p>Selamat datang, <strong>{user.email}</strong>!</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
        <button
          onClick={() => router.push('/dashboard/siswa')}
          className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700"
        >
          📘 Manajemen Siswa
        </button>
        <button
          onClick={() => router.push('/dashboard/siswa/tambah')}
          className="bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700"
        >
          ➕ Tambah Siswa
        </button>
        <button
          onClick={() => router.push('/dashboard/monitoring')}
          className="bg-purple-600 text-white px-4 py-3 rounded hover:bg-purple-700"
        >
          📊 Monitoring Karakter
        </button>
        <button
          onClick={() => router.push('/dashboard/evaluasi')}
          className="bg-yellow-600 text-white px-4 py-3 rounded hover:bg-yellow-700"
        >
          📝 Evaluasi Sistem
        </button>
        <button
          onClick={() => router.push('/dashboard/observasi')}
          className="bg-pink-600 text-white px-4 py-3 rounded hover:bg-pink-700"
        >
          🧠 Observasi AI
        </button>
      </div>
    </Layout>
  );
}
