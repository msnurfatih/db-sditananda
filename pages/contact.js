// pages/contact.js
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <Header />
      <main className="flex-grow px-6 py-12 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Hubungi Kami</h1>
        <p className="mb-6">
          Untuk informasi lebih lanjut mengenai sistem ini, silakan hubungi tim pengembang:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Email:{' '}
            <a
              href="mailto:admin@siswaupdate.id"
              className="text-primary hover:underline"
            >
              admin@siswaupdate.id
            </a>
          </li>
          <li>
            WhatsApp:{' '}
            <a
              href="https://wa.me/6281234567890"
              className="text-primary hover:underline"
            >
              +62 812-3456-7890
            </a>
          </li>
          <li>Alamat: Kampus Unsela, Lahat, Sumatera Selatan</li>
        </ul>
      </main>
      <Footer />
    </div>
  )
}
