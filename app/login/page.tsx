import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

// Keep this page dynamic so it isn't statically prerendered
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
