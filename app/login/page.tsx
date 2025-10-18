import { Suspense } from "react";
import LoginClient from "./LoginClient";

// Avoid static generation for this route (keeps it simple with middleware+cookies)
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center text-white/60">
          Loading…
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
