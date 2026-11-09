import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { pool } from "@/lib/db";
import EditProfileForm from "@/components/users/EditProfileForm";

export default async function EditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");
  if (String(session.id) !== id) redirect(`/users/${session.id}/edit`);

  const [rows]: any = await pool.query(
    "SELECT id, name, email, phone, address FROM users WHERE id = ?",
    [session.id]
  );
  const user = rows[0];
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <EditProfileForm
        id={user.id}
        name={user.name}
        email={user.email}
        phone={user.phone ?? ""}
        address={user.address ?? ""}
      />
    </main>
  );
}
