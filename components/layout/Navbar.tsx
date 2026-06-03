'use client';
import Link from 'next/link';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { CommandPalette } from './CommandPalette';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="text-slate-100 text-lg font-semibold tracking-wide flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          NSE F&O RADAR
        </Link>
        <div className="flex items-center gap-4">
          <button onClick={() => setOpen(true)} className="hidden sm:block rounded-2xl border border-slate-800 bg-slate-900 px-4 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-all">
            Cmd+K Search
          </button>
          
          {session?.user && (
            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <span className="hidden md:block text-xs font-medium text-slate-400">{session.user.name}</span>
              <button 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-rose-300 hover:bg-rose-500/20 transition-all"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
