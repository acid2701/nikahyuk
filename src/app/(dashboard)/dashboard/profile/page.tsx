import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { UserProfileForm } from "@/components/modules/profile/user-profile-form";
import { ChangePasswordForm } from "@/components/modules/profile/change-password-form";
import { UserWorkspacesCard, WorkspaceItem } from "@/components/modules/profile/user-workspaces-card";

export default async function GlobalUserProfilePage() {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    redirect("/login");
  }

  const fullName = user.fullName || "";
  const phone = user.phone || "";
  const provider = "email";
  const isOAuthUser = false;

  // Fetch owned weddings
  const ownedWeddings = await prisma.wedding.findMany({
    where: { createdBy: user.id },
    select: { id: true, groomName: true, brideName: true, weddingSlug: true },
    orderBy: { createdAt: "desc" },
  });

  // Fetch collaborated weddings
  const colabs = await prisma.weddingCollaborator.findMany({
    where: { userId: user.id },
    select: {
      role: true,
      wedding: {
        select: { id: true, groomName: true, brideName: true, weddingSlug: true },
      },
    },
  });

  const workspacesMap = new Map<string, WorkspaceItem>();

  (ownedWeddings || []).forEach((w) => {
    workspacesMap.set(w.id, {
      id: w.id,
      groom_name: w.groomName,
      bride_name: w.brideName,
      wedding_slug: w.weddingSlug,
      role: "owner",
    });
  });

  (colabs || []).forEach((c: any) => {
    if (c.wedding && !workspacesMap.has(c.wedding.id)) {
      workspacesMap.set(c.wedding.id, {
        id: c.wedding.id,
        groom_name: c.wedding.groomName,
        bride_name: c.wedding.brideName,
        wedding_slug: c.wedding.weddingSlug,
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
        email={user.email || "user@nikahyu.my.id"}
        initialFullName={fullName}
        initialPhone={phone}
        provider={provider}
        createdAt={user.createdAt ? user.createdAt.toISOString() : new Date().toISOString()}
      />

      <ChangePasswordForm isOAuthUser={isOAuthUser} />

      <UserWorkspacesCard workspaces={workspacesList} />
    </div>
  );
}
