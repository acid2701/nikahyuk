"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [groomName, setGroomName] = React.useState("");
  const [brideName, setBrideName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          groomName,
          brideName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat akun.");
      }

      toast({
        title: "Pendaftaran Berhasil",
        description: "Akun pengantin Anda telah berhasil dibuat.",
        variant: "success",
      });

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast({
        title: "Gagal Mendaftar",
        description: err instanceof Error ? err.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-border/80">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="font-sans text-2xl font-bold tracking-tight">
          Daftar Akun Pengantin
        </CardTitle>
        <CardDescription className="text-xs">
          Buat akun pasangan pengantin Anda untuk mengelola seluruh kebutuhan pernikahan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nama Lengkap Anda
            </label>
            <Input
              type="text"
              placeholder="e.g. Budi Santoso"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nama Pengantin Pria
              </label>
              <Input
                type="text"
                placeholder="Nama Pria"
                value={groomName}
                onChange={(e) => setGroomName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Nama Pengantin Wanita
              </label>
              <Input
                type="text"
                placeholder="Nama Wanita"
                value={brideName}
                onChange={(e) => setBrideName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Alamat Email
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Kata Sandi
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors rounded"
                title={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-full bg-[#ff385c] text-white hover:bg-[#e00b41] font-semibold shadow-xs transition-all"
            disabled={loading}
          >
            {loading ? "Membuat Akun..." : "Daftar Sekarang"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2 justify-center border-t border-border/60 pt-4 text-center">
        <p className="text-xs text-muted-foreground">
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className="text-foreground font-semibold hover:underline"
          >
            Masuk
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
