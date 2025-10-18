// /lib/auth.ts
export const COOKIE_NAME = "riplink_gate"; // what middleware looks for

// Constant-time compare to avoid timing leaks
export function safeEqual(a: string, b: string) {
  const A = new TextEncoder().encode(a);
  const B = new TextEncoder().encode(b);
  if (A.length !== B.length) return false;
  let diff = 0;
  for (let i = 0; i < A.length; i++) diff |= A[i] ^ B[i];
  return diff === 0;
}
