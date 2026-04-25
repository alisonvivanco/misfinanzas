import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { isAdminEmail, getSubscriptionStatus } from "@/lib/subscription";
import { AdminClient } from "@/components/admin/admin-client";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isAdminEmail(session.user.email)) redirect("/dashboard");

  await dbConnect();
  const usersRaw = await User.find()
    .select("email nombre apellido plan trialEndsAt subscribedUntil createdAt")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  const users = usersRaw.map((u) => {
    const status = getSubscriptionStatus({
      email: u.email,
      plan: u.plan,
      trialEndsAt: u.trialEndsAt,
      subscribedUntil: u.subscribedUntil,
    });
    return {
      _id: String(u._id),
      email: u.email,
      nombre: u.nombre || null,
      apellido: u.apellido || null,
      plan: u.plan,
      status: status.kind,
      active: status.active,
      daysLeft: status.daysLeft,
      expiresAt: status.expiresAt ? status.expiresAt.toISOString() : null,
      createdAt: u.createdAt.toISOString(),
    };
  });

  return <AdminClient users={users} />;
}
