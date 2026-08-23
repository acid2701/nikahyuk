import { createClient } from "@/lib/supabase/server";
import { ShareTokenManager } from "@/components/modules/share/share-token-manager";
import { getCollaboratorSecurityContext } from "@/lib/auth/collaborator-security";
import { AccessDeniedCard } from "@/components/shared/access-denied-card";

export default async function SharePage(props: { params: Promise<any> }) {
  const { weddingId } = (await props.params) as { weddingId: string };

  const { permissions } = await getCollaboratorSecurityContext(weddingId);

  if (!permissions.share) {
    return <AccessDeniedCard moduleTitle="Berbagi Link (Share)" weddingId={weddingId} />;
  }

  const supabase = await createClient();


  const { data: tokensData } = await supabase
    .from("shareable_tokens")
    .select("*")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: false });

  const tokens = tokensData || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Shareable Token Manager & Access Controls
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola token tautan publik PWA untuk kru lapangan, panitia meja registrasi, dan WO.
        </p>
      </div>

      <ShareTokenManager weddingId={weddingId} initialTokens={tokens as any} />
    </div>
  );
}
