import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// Keep the familiar /account link while customer profiles are stored at /users/[id].
export const dynamic = "force-dynamic";

export default async function AccountRedirectPage() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin/account");

  redirect(`/users/${session.id}`);
}