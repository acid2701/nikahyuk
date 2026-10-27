import { createClient } from "@/lib/db/server";
import { Heart, Calendar } from "lucide-react";
import { WeddingProfileForm } from "@/components/modules/settings/wedding-profile-form";

export default async function WeddingProfileSettingsPage(props: { params: Promise<any> }) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const db = await createClient();

  const { data: wedding } = await db
    .from("weddings")
    .select("*")
    .eq("id", weddingId)
    .single();

  if (!wedding) {
    return <div>Workspace tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          Profil Pernikahan & Pasangan
        </h1>
        <p className="text-sm text-muted-foreground">
          Kelola rincian data pengantin pria, pengantin wanita, dan URL slug publik.
        </p>
      </div>

      <WeddingProfileForm
        weddingId={weddingId}
        groomName={wedding.groom_name}
        brideName={wedding.bride_name}
        weddingSlug={wedding.wedding_slug}
        groomFatherName={wedding.groom_father_name}
        groomMotherName={wedding.groom_mother_name}
        brideFatherName={wedding.bride_father_name}
        brideMotherName={wedding.bride_mother_name}
      />

      <div className="p-3 rounded-lg border border-border bg-card/40 space-y-1 max-w-sm">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Calendar className="h-3 w-3" /> Tanggal Pembuatan Workspace
        </span>
        <p className="font-mono text-sm font-semibold text-foreground">
          {new Date(wedding.created_at).toLocaleDateString("id-ID", {
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
