import { useState } from 'react';
import type { FormEvent } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: data.get('name'),
      hotel: data.get('hotel'),
      email: data.get('email'),
      phone: data.get('phone'),
      message: data.get('message'),
    };

    setStatus('submitting');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/15 text-teal">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="font-display text-lg font-semibold text-headline">Thank you!</p>
        <p className="max-w-[22ch] text-sm text-white/70">We'll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h3 className="font-display text-lg font-semibold text-headline">
        Let's talk about your hotel
      </h3>

      <input
        name="name"
        type="text"
        required
        placeholder="Full name"
        autoComplete="name"
        className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-teal/60"
      />
      <input
        name="hotel"
        type="text"
        placeholder="Hotel name"
        autoComplete="organization"
        className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-teal/60"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        autoComplete="email"
        className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-teal/60"
      />
      <input
        name="phone"
        type="tel"
        placeholder="Phone (optional)"
        autoComplete="tel"
        className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-teal/60"
      />
      <textarea
        name="message"
        required
        placeholder="Message"
        rows={3}
        className="resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-teal/60"
      />

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-1 rounded-lg bg-gradient-to-r from-teal to-violet px-4 py-2 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === 'submitting' ? 'Sending…' : 'Send'}
      </button>

      {status === 'error' && (
        <p className="text-xs text-red-400">
          Something went wrong — please try again or email us directly.
        </p>
      )}
    </form>
  );
}
