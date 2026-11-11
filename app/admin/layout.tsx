// app/admin/layout.tsx
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/adminProducts";
import AdminShell from "./_components/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  // Admin accounts are stored in the admins table, not users.
  const [rows]: any = await pool.query(
    "SELECT name, email FROM admins WHERE id = ? LIMIT 1",
    [admin.id]
  );

  const profile = rows[0];
  const name = profile?.name ?? admin.name ?? "Admin";
  const email = profile?.email ?? "Email unavailable";

  return (
    <AdminShell name={name} email={email}>
      {children}
    </AdminShell>
  );
}