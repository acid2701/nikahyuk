import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, Link as LinkIcon } from "lucide-react";

export default async function WeddingProfileSettingsPage(props: { params: Promise<any> }) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const supabase = await createClient();

  const { data: wedding } = await supabase
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

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500/20" />
            Detail Pasangan Pengantin
          </CardTitle>
          <CardDescription>
            Informasi identitas utama workspace pernikahan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-3 rounded-lg border border-border bg-card/40 space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pengantin Pria (Groom)
              </span>
              <p className="font-bold text-base text-foreground">
                {wedding.groom_name || "Belum diisi"}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card/40 space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pengantin Wanita (Bride)
              </span>
              <p className="font-bold text-base text-foreground">
                {wedding.bride_name || "Belum diisi"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-3 rounded-lg border border-border bg-card/40 space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <LinkIcon className="h-3 w-3" /> Slug Acara Unik
              </span>
              <p className="font-mono text-sm font-semibold text-primary">
                /{wedding.wedding_slug}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card/40 space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Tanggal Pembuatan
              </span>
              <p className="font-mono text-sm font-semibold text-foreground">
                {new Date(wedding.created_at).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
