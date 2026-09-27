import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

// Each Channel Partner tier gets its own protected URL — /portal/digital-cp,
// /portal/field-cp, /portal/company-cp — so the link itself always shows
// which CP it belongs to, and a partner can never open a tier that isn't
// theirs (they're bounced to their own correct URL instead).
export async function requireCpUser(expectedCpType) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");
  if (user.accountType !== "freelancer") redirect("/account");
  if (user.cpType !== expectedCpType) redirect(`/portal/${user.cpType}-cp`);
  return user;
}
