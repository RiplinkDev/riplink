'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function PayPage({ params }: { params: { slug: string } }) {
  const [qr, setQr] = useState<string | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [uuid, setUuid] = useState<string | null>(null);
  const [status, setStatus] = useState('waiting');

  async function createPayment() {
    const res = await fetch('/api/payments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: 'rEXAMPLEADDRESS',
        amountXrp: 10,
        memo: `Payment for ${params.slug}`,
      }),
    });
    const data = await res.json();
    setQr(data.qr);
    setNext(data.next);
    setUuid(data.uuid);
  }

  useEffect(() => {
    createPayment();
  }, []);

  useEffect(() => {
    if (!uuid) return;
    const i = setInterval(async () => {
      const res = await fetch(`/api/payments/${uuid}/status`);
      const data = await res.json();
      if (data.signed) {
        setStatus('signed');
        clearInterval(i);
      } else if (data.cancelled || data.expired) {
        setStatus('cancelled');
        clearInterval(i);
      }
    }, 3000);
    return () => clearInterval(i);
  }, [uuid]);

  return (
    <div className="text-center py-20">
      <h1 className="text-3xl font-bold mb-6">Pay with XRP</h1>
      {qr ? (
        <>
          <Image src={qr} alt="QR" width={256} height={256} className="mx-auto" />
          <a
            href={next!}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-3 rounded-lg"
          >
            Open in Xumm
          </a>
        </>
      ) : (
        <p>Creating payment...</p>
      )}
      {status === 'signed' && <p className="mt-6 text-green-400">✅ Payment confirmed</p>}
      {status === 'cancelled' && <p className="mt-6 text-red-400">❌ Cancelled or expired</p>}
    </div>
  );
}
