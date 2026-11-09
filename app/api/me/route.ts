import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserById } from "@/lib/users";

export async function GET() {
  try {
    const session = await getSession();

    // Not logged in, or an admin (admins never show as customers on the site)
    if (!session || session.role === "admin") {
      return NextResponse.json({ user: null });
    }

    // Load the customer's row so the header gets id, name, email and avatar
    const user = await getUserById(session.id);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}