
// pages/index.js
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <Header />

{/* Ilustrasi Hero */}
<section className="bg-primary text-white">
  <div className="container mx-auto px-6 py-12 md:py-24 flex flex-col-reverse md:flex-row items-center
                  min-h-[60vh]">
    {/* Teks Hero */}
    <div className="md:w-1/2 text-center md:text-left">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        Sistem Pendataan Siswa Berbasis AI
      </h1>
      <p className="text-lg mb-6">
        Efisiensikan proses pendataan siswa dengan teknologi kecerdasan buatan.
      </p>
      <Link
        href="/login"
        className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-md shadow hover:opacity-90 transition"
      >
        Login
      </Link>
    </div>

    {/* Ilustrasi Hero */}
    <div className="md:w-1/2 mb-10 md:mb-0">
      <Image
        src="/hero.png"
        alt="Ilustrasi guru menggunakan laptop"
        width={500}
        height={400}
      />
    </div>
  </div>
</section>


      {/* Fitur Unggulan */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Fitur Unggulan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-primary mb-4 text-4xl">✔️</div>
              <h3 className="text-xl font-semibold mb-2">Pendataan Otomatis</h3>
              <p>Pendataan siswa secara otomatis dengan AI canggih.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-primary mb-4 text-4xl">📊</div>
              <h3 className="text-xl font-semibold mb-2">Analisis Grafik</h3>
              <p>Tampilan grafik untuk analisis perkembangan siswa.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-primary mb-4 text-4xl">🧑‍💼</div>
              <h3 className="text-xl font-semibold mb-2">Kelola dengan Mudah</h3>
              <p>Interface sederhana mempermudah pengelolaan data siswa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-100 py-16 px-6 text-center">
        <h2 className="text-2xl font-bold mb-6">
          Mulai Kelola Data Siswa dengan Efektif
        </h2>
        <Link
          href="/login"
          className="bg-primary text-white font-semibold px-10 py-3 rounded-md shadow hover:bg-primary-dark transition"
        >
          Login
        </Link>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
