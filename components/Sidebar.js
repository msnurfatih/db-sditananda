import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Menu,
  X,
  Home,
  User,
  BarChart2,
  FileText,
  UserCircle,
  BrainCircuit,
  LogOut,
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', Icon: Home },
  { href: '/dashboard/siswa', label: 'Siswa', Icon: User },
  { href: '/dashboard/monitoring', label: 'Monitoring', Icon: BarChart2 },
  { href: '/dashboard/observasi', label: 'Observasi', Icon: BrainCircuit },
  { href: '/dashboard/evaluasi', label: 'Evaluasi', Icon: FileText },
  { href: '/dashboard/akun', label: 'Profil', Icon: UserCircle },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleNavigation = (href) => {
    setOpen(false);
    const current = router.asPath.split('?')[0];
    if (current === href) {
      router.push(`${href}?refresh=${Date.now()}`); // ← paksa refresh halaman
    } else {
      router.push(href);
    }
  };

  return (
    <>
      {/* Hamburger for mobile */}
      <div className="md:hidden p-sm">
        <button onClick={() => setOpen(true)} className="text-primary">
          <Menu size={28} />
        </button>
      </div>

      {/* Sidebar panel */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r shadow-lg
        transform ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-transform duration-200 z-20 flex flex-col justify-between`}
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between p-lg border-b">
            <span className="text-base font-bold leading-tight text-gray-800">
              SISTEM PENDATAAN <br /> BERBASIS AI
            </span>
            <button onClick={() => setOpen(false)} className="md:hidden text-gray-600">
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-lg space-y-md">
            {menuItems.map(({ href, label, Icon }) => {
              const isActive = router.pathname === href;

              return (
                <button
                  key={href}
                  onClick={() => handleNavigation(href)}
                  className={`
                    w-full text-left flex items-center space-x-sm p-sm rounded-md
                    transition-colors
                    ${
                      isActive
                        ? 'bg-white text-blue-700 font-bold border-l-4 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="border-t p-lg">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 hover:text-red-800"
          >
            <LogOut size={20} />
            <span className="font-medium">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Overlay on mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
