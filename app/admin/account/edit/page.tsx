import Link from "next/link";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/adminProducts";
import AccountForms from "../AccountForms";

export const dynamic = "force-dynamic";

export default async function EditAdminAccountPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  const [rows]: any = await pool.query(
    "SELECT name, email, phone, address FROM users WHERE id = ? LIMIT 1",
    [admin.id]
  );
  const profile = rows[0];
  if (!profile) redirect("/");

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Edit account</h2>
        <Link
          href="/admin/account"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to account
        </Link>
      </div>

      <AccountForms
        name={profile.name ?? ""}
        email={profile.email ?? ""}
        phone={profile.phone ?? ""}
        address={profile.address ?? ""}
      />
    </main>
  );
}