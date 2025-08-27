import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo dan Judul */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"       // taruh logo Anda di public/logo.png
            alt="Logo SiswaAI"
            width={40}
            height={40}
          />
          <span className="ml-3 text-2xl font-bold text-primary">SD IT ANANADA EMPAT LAWANG</span>
        </Link>

        {/* Navigasi */}
        <nav className="flex space-x-8 text-base font-medium">
          <Link href="/" className="text-gray-700 hover:text-primary transition">
            Beranda
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-primary transition">
            Tentang
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-primary transition">
            Kontak
          </Link>
          <Link href="/login" className="text-primary hover:underline transition">
            Login
          </Link>
        </nav>
      </div>
    </header>
  )
}
