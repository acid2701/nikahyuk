import { prisma } from "@/lib/prisma";
import { Heart, Calendar } from "lucide-react";
import { WeddingProfileForm } from "@/components/modules/settings/wedding-profile-form";

export default async function WeddingProfileSettingsPage(props: { params: Promise<any> }) {
  const { weddingId } = (await props.params) as { weddingId: string };

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
  });

  if (!wedding) {
    return <div>Workspace tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-1">
        <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Profil Pasangan & Pernikahan
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Kelola data nama kedua mempelai, identitas keluarga, dan alamat tautan unik undangan Anda.
        </p>
      </div>

      <WeddingProfileForm
        weddingId={weddingId}
        groomName={wedding.groomName}
        brideName={wedding.brideName}
        weddingSlug={wedding.weddingSlug}
        groomFatherName=""
        groomMotherName=""
        brideFatherName=""
        brideMotherName=""
      />

      <div className="p-3 rounded-lg border border-border bg-card/40 space-y-1 max-w-sm">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Calendar className="h-3 w-3" /> Tanggal Pembuatan Workspace
        </span>
        <p className="font-mono text-sm font-semibold text-foreground">
          {new Date(wedding.createdAt).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
