// components/Footer.js
export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 text-sm py-4 mt-12 border-t">
      <div className="max-w-7xl mx-auto px-6 text-center">
        &copy; {new Date().getFullYear()} Sistem Pendataan Siswa Berbasis AI. Dikembangkan oleh Unsela.
      </div>
    </footer>
  )
}
