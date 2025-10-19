// Server component fetches link by slug, then passes minimal data to client
import { getSb } from '@/lib/supabase';
import PayClient from './pay-client';

export const dynamic = 'force-dynamic';

export default async function PaySlugPage({ params }: { params: { slug: string } }) {
  const sb = getSb();
  const { data: link } = await sb
    .from('payment_links')
    .select('id, title, destination_address, amount_drops, memo, slug, status')
    .eq('slug', params.slug)
    .single();

  if (!link || link.status !== 'active') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Link not found</h1>
        <p className="opacity-70 mt-2">This payment link may be archived or invalid.</p>
      </div>
    );
  }

  return (
    <PayClient
      linkId={link.id}
      title={link.title}
      to={link.destination_address}
      amountXrp={link.amount_drops / 1_000_000}
      memo={link.memo || undefined}
    />
  );
}
