import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, Heart, Shield, Users, ArrowRight } from "lucide-react";
import { CreateWeddingModal } from "@/components/modules/settings/create-wedding-modal";

export interface WorkspaceItem {
  id: string;
  groom_name: string;
  bride_name: string;
  wedding_slug: string;
  roleLabel: string;
  isOwner: boolean;
}

export default async function DashboardSelectorPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch Weddings Owned by User
  const ownedWeddings = await prisma.wedding.findMany({
    where: { createdBy: user.userId },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch Weddings where User is Invited as Collaborator
  const collabRows = await prisma.weddingCollaborator.findMany({
    where: { userId: user.userId },
    include: { wedding: true },
  });

  const workspacesMap = new Map<string, WorkspaceItem>();

  // Add Owned Weddings
  (ownedWeddings || []).forEach((w) => {
    workspacesMap.set(w.id, {
      id: w.id,
      groom_name: w.groomName,
      bride_name: w.brideName,
      wedding_slug: w.weddingSlug,
      roleLabel: "Owner / Pasangan",
      isOwner: true,
    });
  });

  // Add Collaborator Weddings
  (collabRows || []).forEach((c: any) => {
    if (c.wedding && !workspacesMap.has(c.wedding.id)) {
      const perms = (c.customPermissions as any) || {};
      const roleName =
        perms.role_name ||
        (c.role === "wo"
          ? "Wedding Organizer"
          : c.role === "partner"
          ? "Partner"
          : "Panitia Keluarga");

      workspacesMap.set(c.wedding.id, {
        id: c.wedding.id,
        groom_name: c.wedding.groomName,
        bride_name: c.wedding.brideName,
        wedding_slug: c.wedding.weddingSlug,
        roleLabel: roleName,
        isOwner: false,
      });
    }
  });

  const accessibleWorkspaces = Array.from(workspacesMap.values());

  // Auto-redirect if user has exactly 1 accessible workspace
  if (accessibleWorkspaces.length === 1) {
    redirect(`/dashboard/${accessibleWorkspaces[0].id}`);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6">
      <div className="max-w-3xl w-full space-y-6">
        <div className="text-center space-y-2">
          <Heart className="h-10 w-10 text-primary mx-auto" />
          <h1 className="font-serif text-3xl font-bold tracking-tight">
            Pilih Workspace Pernikahan
          </h1>
          <p className="text-sm text-muted-foreground">
            Anda terdaftar di {accessibleWorkspaces.length} ruang kerja pernikahan. Pilih workspace yang ingin Anda akses.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {accessibleWorkspaces.length > 0 ? (
            accessibleWorkspaces.map((w) => (
              <Card
                key={w.id}
                className="hover:border-primary/50 transition-all cursor-pointer shadow-xs relative overflow-hidden"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="font-serif text-lg font-bold">
                      {w.groom_name} & {w.bride_name}
                    </CardTitle>
                    <Badge
                      variant={w.isOwner ? "default" : "secondary"}
                      className="text-[10px] uppercase font-semibold shrink-0"
                    >
                      {w.roleLabel}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Slug: <span className="font-mono">{w.wedding_slug}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <Button asChild className="w-full h-9 text-xs gap-1.5 font-semibold" size="sm">
                    <Link href={`/dashboard/${w.id}`}>
                      Buka Workspace <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="sm:col-span-2 border-dashed p-8 text-center space-y-3">
              <Users className="h-10 w-10 text-muted-foreground mx-auto" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Belum Ada Workspace Pernikahan
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Anda belum memiliki ruang kerja pernikahan sendiri atau belum diundang sebagai kolaborator.
                </p>
              </div>
            </Card>
          )}
        </div>

        <div className="flex justify-center pt-2">
          <CreateWeddingModal
            trigger={
              <Button size="lg" className="gap-2 px-6 h-11 text-sm font-semibold shadow-md">
                <Plus className="h-4 w-4" />
                Buat Acara Pernikahan Baru
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
