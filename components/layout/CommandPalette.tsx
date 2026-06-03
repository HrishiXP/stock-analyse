'use client';
import { useEffect } from 'react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/40">
        <div className="text-slate-200 text-lg font-semibold">Search symbol or command</div>
        <input autoFocus className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-slate-500" placeholder="Type RELIANCE, TCS, BANKNIFTY..." />
        <div className="mt-4 text-slate-500 text-sm">Use arrow keys or type to jump to analysis, scanner or news.</div>
        <button onClick={onClose} className="mt-6 rounded-xl bg-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-600">Close</button>
      </div>
    </div>
  );
}
