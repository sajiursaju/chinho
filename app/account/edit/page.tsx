import Link from "next/link";
import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/session";
import AvatarUploader from "@/components/AvatarUploader";
import ProfileForm from "@/components/ProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import DeleteAccountForm from "@/components/DeleteAccountForm";

export const dynamic = "force-dynamic";

export default async function EditAccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [rows]: any = await pool.query(
    "SELECT name, email, phone, address, avatar IS NOT NULL AS has_avatar FROM users WHERE id = ?",
    [session.id]
  );
  const user = rows[0];
  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <Link href="/account" className="underline">
          Back to my account
        </Link>
      </div>

      <section className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Profile</h2>
        <div className="mb-6">
          <AvatarUploader name={user.name ?? ""} hasAvatar={Boolean(user.has_avatar)} />
        </div>
        <ProfileForm
          initial={{
            name: user.name ?? "",
            email: user.email ?? "",
            phone: user.phone ?? "",
            address: user.address ?? "",
          }}
        />
      </section>

      <section className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Security</h2>
        <ChangePasswordForm />
      </section>

      <section className="rounded-lg border border-red-300 p-6">
        <h2 className="mb-4 text-lg font-semibold text-red-600">Danger zone</h2>
        <DeleteAccountForm />
      </section>
    </main>
  );
}