"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function RegisterPage() {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [groomName, setGroomName] = React.useState("");
  const [brideName, setBrideName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || !groomName || !brideName) {
      toast({
        title: "Perhatian",
        description: "Mohon lengkapi seluruh kolom formulir registrasi.",
        variant: "warning",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Kata Sandi Lemah",
        description: "Kata sandi minimal harus terdiri dari 6 karakter.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || `${groomName} & ${brideName}`,
          groom_name: groomName,
          bride_name: brideName,
        },
      },
    });

    if (authError) {
      toast({
        title: "Gagal Pendaftaran",
        description: authError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (authData.user) {
      const weddingSlug = `${groomName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${brideName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

      const { error: weddingError } = await supabase.from("weddings").insert({
        created_by: authData.user.id,
        groom_name: groomName,
        bride_name: brideName,
        wedding_slug: weddingSlug,
      });

      if (weddingError) {
        console.error("Error creating initial workspace:", weddingError);
      }
    }

    toast({
      title: "Pendaftaran Berhasil",
      description: "Akun calon pengantin telah dibuat. Silakan lanjut ke dashboard.",
      variant: "success",
    });

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="shadow-sm border-border/70">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-semibold text-center">
          Registrasi Calon Pengantin
        </CardTitle>
        <CardDescription className="text-center">
          Buat akun dan ruang kerja pernikahan Anda dalam beberapa langkah
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Nama Lengkap Pendaftar
            </label>
            <Input
              type="text"
              placeholder="Contoh: Sarah Az-Zahra"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Nama Pengantin Pria
              </label>
              <Input
                type="text"
                placeholder="Dimas"
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Nama Pengantin Wanita
              </label>
              <Input
                type="text"
                placeholder="Sarah"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Email
            </label>
            <Input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Kata Sandi
            </label>
            <Input
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses Pendaftaran..." : "Daftar Akun Pengantin"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-xs text-muted-foreground">
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
