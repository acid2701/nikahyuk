import { PreweddingChecklistManager } from "@/components/modules/checklist/prewedding-checklist-manager";
import { getCollaboratorSecurityContext } from "@/lib/auth/collaborator-security";
import { AccessDeniedCard } from "@/components/shared/access-denied-card";

export default async function PreweddingChecklistsPage(props: {
  params: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };

  const { permissions } = await getCollaboratorSecurityContext(weddingId);

  if (!permissions.checklist) {
    return <AccessDeniedCard moduleTitle="Checklist Persiapan" weddingId={weddingId} />;
  }

  return <PreweddingChecklistManager weddingId={weddingId} />;
}

