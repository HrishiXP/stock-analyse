'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials for NSE-FO-Radar access.');
        setLoading(false);
      } else {
        // Use hard redirect for production reliability
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError('An authentication error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600">
            <svg
              className="h-10 w-10 text-slate-900"
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
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-100">
            Internal Access Only
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            F&O Intelligence Desk — Institutional Terminal
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-2xl border border-rose-500/50 bg-rose-500/10 p-3 text-center text-sm text-rose-300">
              {error}
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-500 ml-1">
                Security ID
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Terminal Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-500 ml-1">
                Access Token
              </label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Secure Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-2xl bg-emerald-600 px-4 py-4 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-500 focus:outline-none disabled:opacity-50"
          >
            {loading ? 'Validating Token...' : 'Initialize Secure Session'}
          </button>
        </form>

        <div className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-slate-600">
          Enforced by AI-Sentinel Security Protocol v2.5
        </div>
      </div>
    </div>
  );
}
