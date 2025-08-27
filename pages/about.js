// pages/about.js
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <Header />
      <main className="flex-grow px-6 py-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Tentang Sistem</h1>
        <p className="text-lg leading-relaxed">
          Sistem Pendataan Siswa Berbasis AI dirancang untuk membantu guru dalam mencatat,
          memantau, dan menganalisis perkembangan siswa secara efisien. Dengan integrasi teknologi
          kecerdasan buatan, guru dapat mengakses grafik perkembangan, mengisi catatan observasi,
          serta menerima insight berdasarkan data siswa.
        </p>
      </main>
      <Footer />
    </div>
  )
}
