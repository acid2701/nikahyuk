import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, Clock, Users, ShieldCheck, Heart } from "lucide-react";

export default async function ViewTokenPage(props: { params: Promise<any> }) {
  const { token } = (await props.params) as { token: string };

  const tokenRecord = await prisma.shareableToken.findUnique({
    where: { tokenHash: token },
    include: {
      wedding: {
        select: {
          groomName: true,
          brideName: true,
        },
      },
    },
  });

  const groomName = tokenRecord?.wedding?.groomName || "Mempelai Pria";
  const brideName = tokenRecord?.wedding?.brideName || "Mempelai Wanita";

  const groomParents = "";
  const brideParents = "";

  const moduleAccess = (tokenRecord?.moduleAccess as any) || {
    canCheckin: true,
    canViewRundown: true,
    canViewGuests: true,
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="text-center space-y-1.5 py-4 border-b border-border">
        <div className="inline-flex items-center justify-center p-2 rounded-full bg-rose-500/10 text-rose-500 mb-1">
          <Heart className="h-5 w-5 fill-rose-500" />
        </div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          {groomName} & {brideName}
        </h1>

        {(groomParents || brideParents) && (
          <div className="text-[11px] text-muted-foreground space-y-0.5 pt-0.5">
            {groomParents && <p>Pria: <span className="font-medium text-foreground">{groomParents}</span></p>}
            {brideParents && <p>Wanita: <span className="font-medium text-foreground">{brideParents}</span></p>}
          </div>
        )}

        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 pt-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Portal Panitia & Kru Lapangan
        </p>
      </div>

      <div className="space-y-3">
        {moduleAccess.canCheckin !== false && (
          <Link href={`/view/${token}/checkin`} className="block">
            <Card className="hover:border-primary transition-all border-border shadow-sm active:scale-[0.99]">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="font-bold text-sm text-foreground">Meja Registrasi & Check-in</h2>
                  <p className="text-xs text-muted-foreground">
                    Scan QR / cari nama tamu, catat kehadiran realtime & suvenir.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {moduleAccess.canViewRundown !== false && (
          <Link href={`/view/${token}/rundown`} className="block">
            <Card className="hover:border-primary transition-all border-border shadow-sm active:scale-[0.99]">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="font-bold text-sm text-foreground">Live Rundown Checklist</h2>
                  <p className="text-xs text-muted-foreground">
                    Pantau susunan acara langsung & checklist sesi oleh WO.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {moduleAccess.canViewGuests !== false && (
          <Link href={`/view/${token}/guests`} className="block">
            <Card className="hover:border-primary transition-all border-border shadow-sm active:scale-[0.99]">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="font-bold text-sm text-foreground">Buku Tamu & Lookup Meja</h2>
                  <p className="text-xs text-muted-foreground">
                    Pencarian cepat nomor meja & denah tempat duduk tamu.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
