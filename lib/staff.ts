import { redirect } from "next/navigation";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/session";
import { canAccess, isStaff, type Role } from "@/lib/roles";

export type StaffUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

// Returns null for customers, pending/rejected staff, and logged-out visitors.
export async function getStaffUser(): Promise<StaffUser | null> {
  const session = await getSession();
  if (!session) return null;

  const [rows]: any = await pool.query(
    "SELECT id, name, email, role, staff_status FROM users WHERE id = ? LIMIT 1",
    [session.id]
  );
  const u = rows[0];
  if (!u || !isStaff(u.role)) return null;

  // The CEO is always active. Everyone else must be approved by the MD.
  if (u.role !== "admin" && u.staff_status !== "approved") return null;

  return { id: u.id, name: u.name, email: u.email, role: u.role as Role };
}

// For pages: pass the page URL, e.g. guardPage("/admin/products")
export async function guardPage(path: string): Promise<StaffUser> {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await getStaffUser();
  if (user) {
    if (canAccess(user.role, path)) return user;
    redirect(path === "/admin" ? "/" : "/admin");
  }

  const [rows]: any = await pool.query(
    "SELECT staff_status FROM users WHERE id = ? LIMIT 1",
    [session.id]
  );
  if (rows[0]?.staff_status === "pending") redirect("/staff/pending");
  redirect("/");
}