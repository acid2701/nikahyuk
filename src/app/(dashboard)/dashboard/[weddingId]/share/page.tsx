import { prisma } from "@/lib/prisma";
import { ShareTokenManager } from "@/components/modules/share/share-token-manager";
import { getCollaboratorSecurityContext } from "@/lib/auth/collaborator-security";
import { AccessDeniedCard } from "@/components/shared/access-denied-card";

export default async function SharePage(props: { params: Promise<any> }) {
  const { weddingId } = (await props.params) as { weddingId: string };

  const { permissions } = await getCollaboratorSecurityContext(weddingId);

  if (!permissions.share) {
    return <AccessDeniedCard moduleTitle="Berbagi Link (Share)" weddingId={weddingId} />;
  }

  const rawTokens = await prisma.shareableToken.findMany({
    where: { weddingId },
    orderBy: { createdAt: "desc" },
  });

  const tokens = rawTokens.map((t) => ({
    id: t.id,
    wedding_id: t.weddingId,
    token_hash: t.tokenHash,
    pin_hash: t.pinHash,
    module_access: t.moduleAccess,
    hide_internal_notes: t.hideInternalNotes,
    expires_at: t.expiresAt.toISOString(),
    is_active: t.isActive,
    created_at: t.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Bagikan Akses Tautan Kru & Panitia
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Buat tautan akses cepat terlindungi PIN untuk tim registrasi meja tamu, MC, dan koordinator lapangan.
        </p>
      </div>

      <ShareTokenManager weddingId={weddingId} initialTokens={tokens as any} />
    </div>
  );
}
