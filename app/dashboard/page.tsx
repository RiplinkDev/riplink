import Link from 'next/link';
import { getSb } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const sb = getSb();
  const { data, error } = await sb
    .from('payment_links')
    .select(`
      id, title, destination_address, amount_drops, memo, status, slug, created_at,
      pay_requests ( status )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return <div className="px-4 py-12">Error loading links.</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/create"
          className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-4 py-2"
        >
          Create Link
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {(data || []).map((l) => {
          const paid = (l.pay_requests || []).filter((r: any) => r.status === 'signed').length;
          return (
            <div key={l.id} className="rounded-xl bg-white/5 border border-white/10 p-5">
              <div className="font-semibold">{l.title}</div>
              <div className="opacity-70 text-sm">Amount: {l.amount_drops / 1_000_000} XRP</div>
              {l.memo && <div className="opacity-70 text-sm">Memo: {l.memo}</div>}
              <div className="opacity-60 text-xs break-all mt-1">To: {l.destination_address}</div>
              <div className="mt-3 text-sm">Paid: {paid}</div>
              <div className="mt-3">
                <Link
                  href={`/pay/${l.slug}`}
                  className="inline-block text-cyan-300 underline text-sm"
                >
                  Open pay page
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
