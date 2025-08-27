// components/Layout.js
import {
  HomeIcon,
  UserIcon,
  ChartBarIcon,
  SparklesIcon,
  ClipboardIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'
import { supabase } from '../utils/supabaseClient'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', Icon: HomeIcon, withChildren: false },
  { href: '/dashboard/siswa', label: 'Siswa', Icon: UserIcon, withChildren: true },
  { href: '/dashboard/monitoring', label: 'Monitoring', Icon: ChartBarIcon, withChildren: false },
  { href: '/dashboard/observasi', label: 'Observasi', Icon: SparklesIcon, withChildren: false },
  { href: '/dashboard/evaluasi', label: 'Evaluasi', Icon: ClipboardIcon, withChildren: false },
  { href: '/dashboard/akun', label: 'Profil', Icon: UserCircleIcon, withChildren: false },
]

export default function Layout({ children, pageTitle }) {
  const router = useRouter()
  const { pathname } = router

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleNavClick = (href) => {
    const current = router.asPath.split('?')[0]
    if (current === href) {
      router.push(`${href}?refresh=${Date.now()}`) // Force reload kalau klik ulang
    } else {
      router.push(href)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="flex flex-col w-64 bg-white border-r p-6">
        <h2 className="text-lg font-bold mb-8">
          Sistem Pendataan<br />Berbasis AI
        </h2>

        <nav className="flex-1 space-y-4">
          {menuItems.map(({ href, label, Icon, withChildren }) => {
            const isActive = withChildren
              ? pathname === href || pathname.startsWith(href + '/')
              : pathname === href

            return (
              <button
                key={href}
                onClick={() => handleNavClick(href)}
                className={`
                  flex items-center gap-2 px-2 py-1 rounded w-full text-left transition-colors
                  ${isActive
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'}
                `}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-2 text-red-600 hover:underline"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
        </button>
      </aside>

      {/* Konten utama */}
      <div className="flex-1 overflow-auto">
        {pageTitle && (
          <header className="px-8 py-2">
            <h1 className="text-2xl font-bold">{pageTitle}</h1>
          </header>
        )}
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
