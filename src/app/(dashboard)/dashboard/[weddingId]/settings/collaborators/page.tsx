import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { CollaboratorCardItem } from "@/components/modules/settings/collaborator-card-item";
import { CollaboratorInviteModal } from "@/components/modules/settings/collaborator-invite-modal";
import { CustomRoleManagerModal } from "@/components/modules/settings/custom-role-manager-modal";
import { ShieldCheck } from "lucide-react";

export default async function CollaboratorsPage(props: {
  params: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    select: { groomName: true, brideName: true },
  });

  const weddingTitle = wedding
    ? `${wedding.groomName} & ${wedding.brideName}`
    : "Pernikahan";

  const rawCollaborators = await prisma.weddingCollaborator.findMany({
    where: { weddingId },
    include: { user: { select: { email: true } } },
  });

  const collaborators = rawCollaborators.map((c) => ({
    id: c.id,
    wedding_id: c.weddingId,
    user_id: c.userId,
    email: c.user?.email || "user@nikahyu.my.id",
    role: c.role,
    custom_permissions: c.customPermissions,
    created_at: c.createdAt.toISOString(),
  }));

  const rawEvents = await prisma.weddingEvent.findMany({
    where: { weddingId },
    select: { id: true, eventName: true },
    orderBy: { createdAt: "asc" },
  });

  const events = rawEvents.map((e) => ({
    id: e.id,
    event_name: e.eventName,
  }));

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Tim Kolaborator & Hak Akses
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Undang pasangan, Wedding Organizer (WO), serta panitia keluarga dengan izin modul yang teratur.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CustomRoleManagerModal weddingId={weddingId} />
          <CollaboratorInviteModal weddingId={weddingId} events={events || []} />
        </div>
      </div>

      <div className="space-y-4">
        {collaborators && collaborators.length > 0 ? (
          collaborators.map((c) => (
            <CollaboratorCardItem
              key={c.id}
              collaborator={c}
              weddingId={weddingId}
              weddingTitle={weddingTitle}
              events={events || []}
            />
          ))
        ) : (
          <Card className="border-dashed p-8 text-center space-y-3">
            <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Belum Ada Kolaborator Tambahan
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Anda adalah pemilik utama (Owner) ruang kerja pernikahan ini. Klik &quot;Undang Kolaborator&quot; atau &quot;Kelola Peran Kustom&quot; untuk menambahkan tim acara.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
