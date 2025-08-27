// pages/logout.js
import { useEffect } from 'react';
import supabase from '../utils/supabaseClient'
import { useRouter } from 'next/router';

export default function Logout() {
  const router = useRouter();
  useEffect(() => {
    supabase.auth.signOut().then(() => {
      router.replace('/login');
    });
  }, []);
  return <div className="p-6 text-center">Logging out…</div>;
}
