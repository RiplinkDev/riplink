import { fetchTransaction, getExplorerUrl } from '@/lib/xrpl';

export default async function SuccessPage({
  params,
}: {
  params: { txHash: string };
}) {
  const tx = await fetchTransaction(params.txHash);

  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold mb-6">Payment Success ✅</h1>
      {tx.found ? (
        <>
          <p>Amount: {tx.amountXrp} XRP</p>
          <p>Destination: {tx.destination}</p>
          <p>Memo: {tx.memo}</p>
          <a
            href={getExplorerUrl(tx.hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-cyan-400 underline"
          >
            View on XRPL Explorer
          </a>
        </>
      ) : (
        <p>Transaction not found yet, try again soon.</p>
      )}
    </div>
  );
}
