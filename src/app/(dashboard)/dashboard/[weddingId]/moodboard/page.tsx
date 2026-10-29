import { prisma } from "@/lib/prisma";
import { MoodboardManager, MoodboardItemData } from "@/components/modules/moodboard/moodboard-manager";
import { getCollaboratorSecurityContext } from "@/lib/auth/collaborator-security";
import { formatR2PublicUrl } from "@/lib/cloudflare-r2/presign-helper";
import { getDynamicR2Client } from "@/lib/cloudflare-r2/dynamic-config";

export default async function MoodboardPage(props: {
  params: Promise<any>;
}) {
  const { weddingId } = (await props.params) as { weddingId: string };

  await getCollaboratorSecurityContext(weddingId);

  // 1. Fetch Dynamic Storage CDN Domain from Database
  const { config: r2Config } = await getDynamicR2Client();
  const publicCdn = r2Config.publicCdnDomain;

  // 2. Fetch Saved Color Palette
  const rawPalette = await prisma.weddingColorPalette.findFirst({
    where: { weddingId },
  });

  const initialPalette = {
    paletteName: rawPalette?.paletteName || "Tema Warna Utama",
    colors: (rawPalette?.colors as any) || [
      { hex: "#9CAF88", name: "Sage Green" },
      { hex: "#D4AF37", name: "Champagne Gold" },
      { hex: "#FDFBF7", name: "Warm Ivory" },
      { hex: "#E8B4A2", name: "Dusty Blush" },
      { hex: "#3A3A3A", name: "Charcoal" },
    ],
  };

  // 3. Fetch Moodboard Gallery Items
  const rawItems = await prisma.moodboardItem.findMany({
    where: { weddingId },
    orderBy: { createdAt: "desc" },
  });

  const initialItems: MoodboardItemData[] = rawItems.map((item) => ({
    id: item.id,
    category: item.category as any,
    title: item.title,
    notes: item.notes,
    r2_file_key: item.r2FileKey,
    public_url: formatR2PublicUrl(item.r2FileKey, publicCdn),
    source_url: item.sourceUrl,
    vendor_name: item.vendorName,
    created_at: item.createdAt.toISOString(),
  }));

  return (
    <MoodboardManager
      weddingId={weddingId}
      initialPalette={initialPalette}
      initialItems={initialItems}
    />
  );
}
