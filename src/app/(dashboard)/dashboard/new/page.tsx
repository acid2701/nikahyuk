"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createWeddingAction } from "@/actions/wedding-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewWeddingPage() {
  const [groomName, setGroomName] = React.useState("");
  const [brideName, setBrideName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!groomName || !brideName) {
      toast({
        title: "Perhatian",
        description: "Mohon isi nama pengantin pria dan wanita.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("groom_name", groomName);
      formData.append("bride_name", brideName);

      const newWedding = await createWeddingAction(formData);

      toast({
        title: "Workspace Berhasil Dibuat!",
        description: `Ruang kerja '${groomName} & ${brideName}' telah aktif dengan sub-event Akad Nikah & Resepsi.`,
        variant: "success",
      });

      router.push(`/dashboard/${newWedding.id}`);
      router.refresh();
    } catch (err) {
      toast({
        title: "Gagal Membuat Workspace",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full space-y-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1 h-8 text-xs px-2 mb-2">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Selector
          </Button>
        </Link>

        <Card className="shadow-md border-border/80">
          <CardHeader className="text-center space-y-1 pb-3">
            <Heart className="h-8 w-8 text-primary mx-auto mb-1 fill-primary/10" />
            <CardTitle className="font-serif text-2xl">Buat Workspace Pernikahan</CardTitle>
            <CardDescription className="text-xs">
              Isi nama calon pengantin pria dan wanita untuk menginisialisasi ruang kerja baru.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">Nama Pengantin Pria (Groom)</label>
                <Input
                  type="text"
                  placeholder="e.g. Raden Romeo"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Nama Pengantin Wanita (Bride)</label>
                <Input
                  type="text"
                  placeholder="e.g. Puteri Juliet"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full h-10 font-semibold text-xs">
                {loading ? "Inisialisasi Workspace..." : "Buat Workspace Baru"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
