import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center text-slate-100">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-emerald-600 shadow-2xl shadow-emerald-500/20">
        <svg
          className="h-14 w-14 text-slate-950"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      </div>
      <h1 className="text-5xl font-bold tracking-tight text-slate-100 sm:text-7xl">
        NSE F&O <span className="text-emerald-500">RADAR</span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
        Institutional-grade AI intelligence terminal for Indian derivatives markets. 
        Deep neural analysis of selective news flows, technical levels, and multi-factor catalysts.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Link
          href="/dashboard"
          className="rounded-2xl bg-emerald-600 px-8 py-4 text-sm font-bold text-slate-900 shadow-sm hover:bg-emerald-500 transition-all"
        >
          Enter Terminal
        </Link>
        <Link
          href="/login"
          className="text-sm font-semibold leading-6 text-slate-100 border-b border-slate-800 pb-1 hover:border-emerald-500 transition-all"
        >
          Operator Login <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="mt-16 text-[10px] uppercase tracking-[0.3em] text-slate-600">
        Restricted Access System | Sentinel v2.5
      </div>
    </div>
  );
}
