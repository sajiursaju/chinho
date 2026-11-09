"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type User = { id: number; name: string; role: string; hasAvatar?: boolean };

export default function AuthLinks() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let ignore = false;

    function loadUser() {
      fetch("/api/me", { cache: "no-store" })
        .then((response) => response.json())
        .then((data) => {
          if (!ignore) setUser(data.user ?? null);
        })
        .catch(() => {
          if (!ignore) setUser(null);
        });
    }

    loadUser();
    window.addEventListener("auth-changed", loadUser);
    return () => {
      ignore = true;
      window.removeEventListener("auth-changed", loadUser);
    };
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/");
    router.refresh();
  }

  if (user) {
    const firstName = user.name.trim().split(" ")[0] || "Account";
    const initial = user.name.trim().charAt(0).toUpperCase() || "A";

    return (
      <div className="flex items-center gap-2 whitespace-nowrap text-sm sm:gap-3">
        <Link href={`/users/${user.id}`} className="flex items-center gap-2 hover:text-indigo-200" aria-label="My account">
          {user.hasAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/api/account/avatar" alt="" className="h-8 w-8 shrink-0 rounded-full border border-white/30 object-cover" />
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">{initial}</span>
          )}
          <span className="hidden sm:inline">Hi, {firstName}</span>
        </Link>
        <button type="button" onClick={handleLogout} className="underline underline-offset-2 hover:text-indigo-200">Log out</button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 whitespace-nowrap text-sm sm:gap-3">
      <Link href="/login" className="underline underline-offset-2 hover:text-indigo-200">Log in</Link>
      <Link href="/signup" className="rounded bg-indigo-500 px-3 py-1.5 transition hover:bg-indigo-600">Sign up</Link>
    </div>
  );
}
