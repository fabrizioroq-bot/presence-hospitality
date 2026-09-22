import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get('email') ?? '');
    const password = String(data.get('password') ?? '');

    setLoading(true);
    setError(false);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError(true);
      return;
    }
    navigate('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-6">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-teal/20 bg-panel/60 p-8 backdrop-blur-sm"
      >
        <div>
          <p className="font-mono text-xs tracking-[0.35em] text-teal">PRESENCE HOSPITALITY</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-headline">Sign in</h1>
        </div>

        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          autoComplete="email"
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-teal/60"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          autoComplete="current-password"
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-teal/60"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-lg bg-gradient-to-r from-teal to-violet px-4 py-2 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        {error && (
          <p className="text-xs text-red-400">Incorrect email or password.</p>
        )}
      </form>
    </div>
  );
}
