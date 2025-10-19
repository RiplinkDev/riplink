// /app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb.auth.getUser()

  if (!data?.user) {
    redirect('/login')
  }

  // ... keep the rest of your dashboard code here
}
import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type PayRequestRow = {
  status: "awaiting" | "signed" | "expired" | "cancelled" | "error";
};

type LinkRow = {
  id: string;
  title: string | null;
  destination_address: string;
  amount_drops: number;
  memo: string | null;
  status: "draft" | "active" | "archived";
  slug: string;
  created_at: string;
  pay_requests: PayRequestRow[] | null;
};

function dropsToXrp(drops: number) {
  return (drops / 1_000_000).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
}

export default async function DashboardPage() {
  // RLS-safe, user-scoped Supabase client (ANON key + cookies)
  const sb = getServerSupabase();

  let rows: LinkRow[] = [];
  try {
    // All RLS is enforced by your Supabase policies (owner-only, etc.)
    const { data, error } = await sb
      .from("payment_links")
      .select(
        `
        id,
        title,
        destination_address,
        amount_drops,
        memo,
        status,
        slug,
        created_at,
        pay_requests ( status )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    rows = (data ?? []) as LinkRow[];
  } catch {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
        <p className="mt-2 text-sm opacity-70">
          We couldn’t load your links right now. Please try again in a moment.
        </p>
        <div className="mt-6">
          <Link
            href="/create"
            className="inline-flex items-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-4 py-2"
          >
            Create Link
          </Link>
        </div>
      </div>
    );
  }

  const isEmpty = rows.length === 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
        <Link
          href="/create"
          className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-4 py-2"
        >
          Create Link
        </Link>
      </div>

      {isEmpty ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <h2 className="text-lg font-semibold">No payment links yet</h2>
          <p className="mt-2 text-sm opacity-70">
            Create your first Riplink to start accepting XRP payments.
          </p>
          <div className="mt-4">
            <Link
              href="/create"
              className="inline-flex items-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-4 py-2"
            >
              Create your first link
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {rows.map((l) => {
            const paidCount = (l.pay_requests ?? []).filter(
              (r) => r.status === "signed"
            ).length;
            const amountLabel = dropsToXrp(l.amount_drops);

            return (
              <div
                key={l.id}
                className="rounded-xl bg-white/5 border border-white/10 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{l.title ?? "Payment"}</div>
                    <div className="opacity-70 text-sm">
                      Amount: {amountLabel} XRP
                    </div>
                  </div>
                  <span
                    className="text-xs rounded-md px-2 py-1 border border-white/10 opacity-75"
                    title={`Status: ${l.status}`}
                  >
                    {l.status}
                  </span>
                </div>

                {l.memo && (
                  <div className="opacity-70 text-sm mt-1">Memo: {l.memo}</div>
                )}
                <div className="opacity-60 text-xs break-all mt-2">
                  To: {l.destination_address}
                </div>

                <div className="mt-3 text-sm">Paid: {paidCount}</div>

                <div className="mt-4 flex items-center gap-3">
                  <Link
                    href={`/pay/${l.slug}`}
                    className="inline-block text-cyan-300 underline text-sm"
                  >
                    Open pay page
                  </Link>
                  <Link
                    href={`/success/sample?link=${encodeURIComponent(l.id)}`}
                    className="inline-block text-white/70 underline text-xs"
                  >
                    View sample success
                  </Link>
                </div>

                <div className="mt-4 border-t border-white/10 pt-3 text-xs opacity-60">
                  Created {new Date(l.created_at).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
