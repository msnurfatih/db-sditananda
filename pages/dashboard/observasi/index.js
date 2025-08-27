// pages/dashboard/observasi/index.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../../utils/supabaseClient'
import Layout from '../../../components/Layout'

export const pageTitle = 'Observasi Karakter Siswa'

export default function ObservasiIndexPage() {
  const router = useRouter()
  const [siswaList, setSiswaList] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [session, setSession] = useState(null)

  // Ambil data siswa lengkap dengan kelas
  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)

      if (!session) return router.replace('/login')

      const { data, error } = await supabase
        .from('siswa')
        .select('id, nama, kelas')
        .order('kelas', { ascending: true })
        .order('nama', { ascending: true })

      if (error) {
        console.error('Gagal ambil siswa:', error.message)
      } else {
        setSiswaList(data)
      }
    }
    fetchData()
  }, [router])

  const handleSubmit = () => {
    if (!selectedId) {
      alert('Pilih siswa terlebih dahulu!')
      return
    }
    router.push(`/dashboard/observasi/${selectedId}`)
  }

  const groupByKelas = (data) => {
    return data.reduce((acc, curr) => {
      const kelas = curr.kelas || 'Lainnya'
      if (!acc[kelas]) acc[kelas] = []
      acc[kelas].push(curr)
      return acc
    }, {})
  }

  return (
    <Layout pageTitle={pageTitle}>
      <div className="p-6 max-w-3xl mx-auto">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        >
          <option value="">-- Pilih Siswa --</option>
          {Object.entries(groupByKelas(siswaList)).map(([kelas, siswas]) => (
            <optgroup key={kelas} label={`Kelas ${kelas}`}>
              {siswas.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-8"
        >
          ✏️ Mulai Observasi
        </button>
      </div>
    </Layout>
  )
}
