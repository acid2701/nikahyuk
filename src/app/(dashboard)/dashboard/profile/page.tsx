import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserProfileForm } from "@/components/modules/profile/user-profile-form";
import { ChangePasswordForm } from "@/components/modules/profile/change-password-form";
import { UserWorkspacesCard, WorkspaceItem } from "@/components/modules/profile/user-workspaces-card";

export default async function GlobalUserProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "";
  const phone = user.user_metadata?.phone || "";
  const provider = user.app_metadata?.provider || user.identities?.[0]?.provider || "email";
  const isOAuthUser = provider === "google";

  // Fetch owned weddings
  const { data: ownedWeddings } = await supabase
    .from("weddings")
    .select("id, groom_name, bride_name, wedding_slug")
    .eq("created_by", user.id);

  // Fetch collaborated weddings
  const { data: colabs } = await supabase
    .from("wedding_collaborators")
    .select("role, weddings(id, groom_name, bride_name, wedding_slug)")
    .eq("user_id", user.id);

  const workspacesMap = new Map<string, WorkspaceItem>();

  (ownedWeddings || []).forEach((w) => {
    workspacesMap.set(w.id, {
      id: w.id,
      groom_name: w.groom_name,
      bride_name: w.bride_name,
      wedding_slug: w.wedding_slug,
      role: "owner",
    });
  });

  (colabs || []).forEach((c: any) => {
    if (c.weddings && !workspacesMap.has(c.weddings.id)) {
      workspacesMap.set(c.weddings.id, {
        id: c.weddings.id,
        groom_name: c.weddings.groom_name,
        bride_name: c.weddings.bride_name,
        wedding_slug: c.weddings.wedding_slug,
        role: c.role || "wo",
      });
    }
  });

  const workspacesList = Array.from(workspacesMap.values());

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Pengaturan Profil Akun Saya
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola informasi identitas akun, keamanan kata sandi, dan ruang kerja pernikahan terhubung.
        </p>
      </div>

      <UserProfileForm
        email={user.email || "user@nikahyuk.com"}
        initialFullName={fullName}
        initialPhone={phone}
        provider={provider}
        createdAt={user.created_at || new Date().toISOString()}
      />

      <ChangePasswordForm isOAuthUser={isOAuthUser} />

      <UserWorkspacesCard workspaces={workspacesList} />
    </div>
  );
}
