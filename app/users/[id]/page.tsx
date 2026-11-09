import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { pool } from "@/lib/db";

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  // Not logged in, or an admin (admins use /admin only)
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");

  // A client can only open their own URL
  if (String(session.id) !== id) redirect(`/users/${session.id}`);

  const [rows]: any = await pool.query(
    "SELECT id, name, email, phone, address FROM users WHERE id = ?",
    [session.id]
  );
  const user = rows[0];
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500 text-2xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500">Client ID: #{user.id}</p>
          </div>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-b pb-2">
            <dt className="text-gray-500">Email</dt>
            <dd className="text-gray-900">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b pb-2">
            <dt className="text-gray-500">Phone</dt>
            <dd className="text-gray-900">{user.phone || "Not added"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b pb-2">
            <dt className="text-gray-500">Address</dt>
            <dd className="text-right text-gray-900">
              {user.address || "Not added"}
            </dd>
          </div>
        </dl>

        <Link
          href={`/users/${user.id}/edit`}
          className="mt-6 inline-block rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Edit profile
        </Link>
      </div>
    </main>
  );
}