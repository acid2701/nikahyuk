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

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [authConfig, setAuthConfig] = React.useState<{
    googleEnabled: boolean;
    appBaseUrl: string;
  } | null>(null);

  React.useEffect(() => {
    async function loadAuthConfig() {
      try {
        const res = await fetch("/api/public/auth-config");
        if (res.ok) {
          const json = await res.json();
          if (json.config) {
            setAuthConfig(json.config);
          }
        }
      } catch {
        // Fallback to default
      }
    }
    loadAuthConfig();
  }, []);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Perhatian",
        description: "Mohon isi email dan kata sandi Anda.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Gagal Masuk",
          description: data.error || "Email atau kata sandi tidak valid.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const user = data.user;
      const isSuperadmin = user.role === "superadmin" || user.role === "admin";
      const isVendor = user.userType === "vendor";

      toast({
        title: isSuperadmin
          ? "Berhasil Masuk Superadmin"
          : isVendor
          ? "Berhasil Masuk Portal Vendor"
          : "Berhasil Masuk",
        description: isSuperadmin
          ? "Selamat datang di Superadmin Control Plane!"
          : isVendor
          ? "Selamat datang di Dashboard Mandiri Mitra Vendor!"
          : "Selamat datang kembali!",
        variant: "success",
      });

      const targetPath = isSuperadmin
        ? "/admin"
        : isVendor
        ? "/vendor/dashboard"
        : "/dashboard";
      router.push(targetPath);
      router.refresh();
    } catch {
      toast({
        title: "Kesalahan Jaringan",
        description: "Gagal menghubungkan ke server.",
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    toast({
      title: "Google Auth Dinonaktifkan",
      description: "Metode masuk Google dialihkan ke login email/kata sandi mandiri.",
      variant: "warning",
    });
  }

  return (
    <Card className="shadow-sm border-border/70">
      <CardHeader className="space-y-1">
        <CardTitle className="font-sans text-2xl font-bold text-center tracking-tight">
          Masuk ke Akun
        </CardTitle>
        <CardDescription className="text-center text-xs">
          Masukkan email dan kata sandi untuk melanjutkan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 rounded-full border-border/80 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-muted transition-all"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          Masuk dengan Google
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="bg-card px-2 text-xs text-muted-foreground uppercase absolute">
            Atau
          </span>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-3">
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">
                Kata Sandi
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Lupa kata sandi?
              </Link>
            </div>
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
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-3 justify-center pt-2">
        <p className="text-xs text-muted-foreground">
          Belum memiliki akun?{" "}
          <Link
            href="/register"
            className="text-foreground font-semibold hover:underline"
          >
            Daftar
          </Link>
        </p>
        <p className="text-xs text-muted-foreground">
          Mitra Vendor?{" "}
          <Link
            href="/vendor/login"
            className="text-foreground font-semibold hover:underline"
          >
            Masuk ke Portal Vendor
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
