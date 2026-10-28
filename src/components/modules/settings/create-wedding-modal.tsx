"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createWeddingAction } from "@/actions/wedding-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Heart, Plus } from "lucide-react";

export interface CreateWeddingModalProps {
  trigger?: React.ReactNode;
}

export function CreateWeddingModal({ trigger }: CreateWeddingModalProps) {
  const [groomName, setGroomName] = React.useState("");
  const [brideName, setBrideName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!groomName.trim() || !brideName.trim()) {
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
      formData.append("groom_name", groomName.trim());
      formData.append("bride_name", brideName.trim());

      const newWedding = await createWeddingAction(formData);

      toast({
        title: "Workspace Berhasil Dibuat!",
        description: `Ruang kerja '${groomName} & ${brideName}' telah aktif dengan sub-event Akad Nikah & Resepsi.`,
        variant: "success",
      });

      setOpen(false);
      setGroomName("");
      setBrideName("");
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Buat Acara Baru
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-6 w-6 text-primary fill-primary/20" />
          </div>
          <DialogTitle className="font-sans text-xl">
            Buat Workspace Pernikahan Baru
          </DialogTitle>
          <DialogDescription className="text-xs">
            Isi nama calon pengantin pria dan wanita. Sistem akan menginisialisasi
            workspace lengkap dengan sub-event Akad Nikah & Resepsi secara otomatis.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label
              htmlFor="create-groom-name"
              className="text-xs font-semibold text-foreground"
            >
              Nama Pengantin Pria (Groom)
            </label>
            <Input
              id="create-groom-name"
              type="text"
              placeholder="e.g. Raden Romeo"
              value={groomName}
              onChange={(e) => setGroomName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="create-bride-name"
              className="text-xs font-semibold text-foreground"
            >
              Nama Pengantin Wanita (Bride)
            </label>
            <Input
              id="create-bride-name"
              type="text"
              placeholder="e.g. Puteri Juliet"
              value={brideName}
              onChange={(e) => setBrideName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 font-semibold text-xs"
          >
            {loading ? "Inisialisasi Workspace..." : "Buat Workspace Baru"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
