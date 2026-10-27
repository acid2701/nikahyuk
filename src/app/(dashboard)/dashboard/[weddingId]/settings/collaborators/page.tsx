import { createClient } from "@/lib/db/server";
import { Card } from "@/components/ui/card";
import { CollaboratorCardItem } from "@/components/modules/settings/collaborator-card-item";
import { CollaboratorInviteModal } from "@/components/modules/settings/collaborator-invite-modal";
import { CustomRoleManagerModal } from "@/components/modules/settings/custom-role-manager-modal";
import { ShieldCheck } from "lucide-react";

export default async function CollaboratorsPage(props: {
  params: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const db = await createClient();

  const { data: wedding } = await db
    .from("weddings")
    .select("groom_name, bride_name")
    .eq("id", weddingId)
    .maybeSingle();

  const weddingTitle = wedding
    ? `${wedding.groom_name} & ${wedding.bride_name}`
    : "Pernikahan";

  const { data: collaborators } = await db
    .from("wedding_collaborators")
    .select("*")
    .eq("wedding_id", weddingId);

  const { data: events } = await db
    .from("wedding_events")
    .select("id, event_name")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            Kolaborator & Tim Acara
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola hak akses Pasangan, Wedding Organizer (WO), panitia keluarga, dan peran kustom.
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
