import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface Lead {
  id: string;
  created_at: string;
  name: string;
  hotel: string | null;
  email: string;
  phone: string | null;
  message: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(true);
        } else {
          setLeads(data ?? []);
        }
        setLoading(false);
      });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-ink px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs tracking-[0.35em] text-teal">PRESENCE HOSPITALITY</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-headline">Leads</h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70 transition-colors hover:border-teal/50 hover:text-white"
          >
            Log out
          </button>
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-teal/20 bg-panel/50">
          {loading && <p className="p-6 text-sm text-white/40">Loading leads…</p>}
          {!loading && error && (
            <p className="p-6 text-sm text-red-400">Couldn't load leads. Please try again.</p>
          )}
          {!loading && !error && leads.length === 0 && (
            <p className="p-6 text-sm text-white/40">No leads yet.</p>
          )}
          {!loading && !error && leads.length > 0 && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Hotel</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Message</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/5 align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-white/60">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{lead.name}</td>
                    <td className="px-4 py-3 text-white/70">{lead.hotel || '—'}</td>
                    <td className="px-4 py-3 text-white/70">{lead.email}</td>
                    <td className="px-4 py-3 text-white/70">{lead.phone || '—'}</td>
                    <td className="max-w-xs px-4 py-3 text-white/70">{lead.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
