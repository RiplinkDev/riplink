// components/HeaderUserMenu.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import SignOutButton from '@/components/SignOutButton';

type UserInfo = { email: string | null };

export default function HeaderUserMenu() {
  const sb = getSupabaseBrowser();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch current user (from Supabase client session)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await sb.auth.getUser();
      if (mounted) setUser({ email: data.user?.email ?? null });
    })();
    return () => {
      mounted = false;
    };
  }, [sb]);

  // close on outside click / ESC
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const label = user?.email ?? 'Account';
  const initials =
    (user?.email?.[0]?.toUpperCase() ?? 'U') +
    (user?.email?.split('@')[0]?.[1]?.toUpperCase() ?? '');

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-semibold">
          {initials}
        </span>
        <span className="max-w-[160px] truncate">{label}</span>
        <svg
          className={`h-4 w-4 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#0B1020]/95 backdrop-blur p-1 shadow-xl"
        >
          <div className="px-3 py-2 text-xs text-white/60">
            Signed in as
            <div className="truncate text-white/90">{user?.email ?? '—'}</div>
          </div>
          <div className="my-1 h-px bg-white/10" />
          <Link
            href="/dashboard"
            role="menuitem"
            className="block rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/create"
            role="menuitem"
            className="block rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            Create Link
          </Link>
          <div className="my-1 h-px bg-white/10" />
          <div className="px-3 pb-2 pt-1">
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  );
}
