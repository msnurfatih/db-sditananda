// pages/dashboard/akun.js
import React, { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { supabase } from '../../utils/supabaseClient';

export default function ProfilGuru() {
  const [guru, setGuru] = useState(null)
  const [loading, setLoading] = useState(true)   // <- perbaikan di sini

  useEffect(() => {
    async function fetchOrCreateGuru() {
      // 1. Ambil user dari Supabase Auth
      const {
        data: { user },
        error: authErr
      } = await supabase.auth.getUser()
      if (authErr || !user) {
        console.error('Gagal mendapatkan user:', authErr)
        setLoading(false)
        return
      }

      // 2. Coba ambil data guru berdasarkan user.id
      const { data: existing, error: selErr } = await supabase
        .from('gurus')
        .select('id, nama, email, foto_url')
        .eq('id', user.id)
        .maybeSingle()

      if (selErr) {
        console.error('Error saat fetch guru:', selErr)
        setLoading(false)
        return
      }

      if (existing) {
        setGuru(existing)
        setLoading(false)
      } else {
        // 3. Jika belum ada, insert baru
        const { data: created, error: insErr } = await supabase
          .from('gurus')
          .insert({
            id: user.id,
            nama: user.user_metadata?.name || 'Guru Baru',
            email: user.email,
            foto_url: ''
          })
          .select('id, nama, email, foto_url')
          .single()

        if (insErr) {
          console.error('Gagal menambahkan data guru:', insErr)
        } else {
          setGuru(created)
        }
        setLoading(false)
      }
    }

    fetchOrCreateGuru()
  }, [])

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Profil Guru</h1>

      {loading ? (
        <p>Memuat data…</p>
      ) : guru ? (
        <div className="max-w-md bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <img
              src={guru.foto_url || '/placeholder-avatar.png'}
              alt="Foto Guru"
              className="w-16 h-16 rounded-full mr-4"
            />
            <div>
              <p className="text-lg font-semibold">{guru.nama}</p>
              <p className="text-sm text-gray-600">{guru.email}</p>
            </div>
          </div>
          {/* Tambahkan form atau tombol edit di sini */}
        </div>
      ) : (
        <p>Profil tidak ditemukan.</p>
      )}
    </Layout>
  )
}
