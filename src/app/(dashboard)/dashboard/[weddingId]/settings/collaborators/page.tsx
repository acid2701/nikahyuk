import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CollaboratorPermissionForm } from "@/components/modules/settings/collaborator-permission-form";
import { CustomPermissions } from "@/types/database.types";
import { Users, ShieldCheck } from "lucide-react";

export default async function CollaboratorsPage(props: {
  params: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const supabase = await createClient();

  const { data: collaborators } = await supabase
    .from("wedding_collaborators")
    .select("*")
    .eq("wedding_id", weddingId);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Manajemen Akses & Kolaborator (RBAC)
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola hak akses Wedding Organizer (WO), panitia keluarga, dan delegasi modul.
        </p>
      </div>

      <div className="space-y-4">
        {collaborators && collaborators.length > 0 ? (
          collaborators.map((c) => {
            const perms = (c.custom_permissions || {
              budget: false,
              vendor: false,
              rundown: true,
              guest: true,
              gift_log: false,
            }) as CustomPermissions;

            return (
              <Card key={c.id} className="border-border/80">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">
                          Kolaborator ID: {c.user_id.substring(0, 8)}...
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Role:{" "}
                          <span className="font-semibold uppercase text-foreground">
                            {c.role}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={c.role === "wo" ? "default" : "secondary"}>
                      {c.role === "wo" ? "Wedding Organizer" : "Panitia Keluarga"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CollaboratorPermissionForm
                    collaboratorId={c.id}
                    weddingId={weddingId}
                    initialPermissions={perms}
                  />
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="border-dashed p-8 text-center space-y-3">
            <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Belum Ada Kolaborator Tambahan
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Anda adalah pemilik utama (Owner) ruang kerja pernikahan ini dengan akses Penuh (Full CRUD).
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
