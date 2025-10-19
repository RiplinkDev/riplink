"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import HeaderUserMenu from "./HeaderUserMenu";
import SignOutButton from "./SignOutButton";

const Item = ({ href, label }: { href: string; label: string }) => {
  const path = usePathname();
  const active = path === href;

  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        active
          ? "bg-primary/20 text-primary glow-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-card"
      }`}
    >
      {label}
    </Link>
  );
};

export default function Nav() {
  const pathname = usePathname();
  const showAuthControls = pathname !== "/login"; // keep login page minimal

  return (
    <div className="fixed inset-x-0 top-0 z-50 glass border-b border-border/50">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        {/* Left: brand */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Logo />
        </Link>

        {/* Right: navigation + auth */}
        <div className="flex items-center gap-2">
          <Item href="/" label="Home" />
          <Item href="/create" label="Create" />
          <Item href="/roadmap" label="Roadmap" />
          <Item href="/dashboard" label="Dashboard" />

          {showAuthControls && (
            <>
              {/* User avatar / menu (shows Sign in if not authenticated) */}
              <HeaderUserMenu />
              {/* Explicit sign-out button (visible if you want a quick action) */}
              <SignOutButton />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
