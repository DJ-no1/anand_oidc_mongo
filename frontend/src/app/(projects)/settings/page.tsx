import { redirect } from "next/navigation";

import { SettingsForm } from "./settings-form";
import { fetchApi } from "@/lib/server-api";
import { type UserProfile } from "@/lib/api";

export const metadata = {
  title: "Profile Settings",
};

export default async function SettingsPage() {
  const res = await fetchApi("/api/auth/me");
  
  if (!res.ok) {
    redirect("/login?return_to=" + encodeURIComponent("/settings"));
  }

  const json = (await res.json()) as { data?: UserProfile };
  const user = json.data;

  if (!user) {
    redirect("/login?return_to=" + encodeURIComponent("/settings"));
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your public profile and personal information.
        </p>
      </div>
      <SettingsForm user={user} />
    </main>
  );
}
