import Link from "next/link";

export default function LoginMenu() {
  return (
    <div className="group relative">
      <button className="rounded px-3 py-1 hover:bg-gray-100">Login</button>
      <div className="invisible absolute right-0 z-50 w-40 rounded border bg-white shadow group-hover:visible">
        <Link href="/login" className="block px-4 py-2 hover:bg-gray-100">
          Client Login
        </Link>
        <Link href="/admin-login" className="block px-4 py-2 hover:bg-gray-100">
          Admin Login
        </Link>
      </div>
    </div>
  );
}