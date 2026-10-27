import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAppBranding } from "@/lib/branding";
import { MobilePinGate } from "@/components/modules/view/mobile-pin-gate";
import { ThemeToggle } from "@/components/shared/theme/theme-toggle";

export default async function ViewTokenLayout(props: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const { token } = (await props.params) as { token: string };

  const tokenRecord = await prisma.shareableToken.findFirst({
    where: {
      tokenHash: token,
      isActive: true,
    },
    include: {
      wedding: {
        select: {
          groomName: true,
          brideName: true,
        },
      },
    },
  });

  if (!tokenRecord) {
    notFound();
  }

  const isExpired = new Date(tokenRecord.expiresAt) < new Date();
  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="space-y-2">
          <h1 className="font-serif text-xl font-bold text-rose-600">Tautan Akses Expired</h1>
          <p className="text-xs text-muted-foreground">
            Tautan akses publik ini telah melewati masa berlaku. Silakan hubungi pengantin/WO untuk tautan baru.
          </p>
        </div>
      </div>
    );
  }

  const requiresPin = !!tokenRecord.pinHash;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(`token_session_${token}`);
  const initialAuthenticated = sessionCookie?.value === "authenticated";

  const branding = await getAppBranding();
  const weddingTitle = tokenRecord.wedding
    ? `${tokenRecord.wedding.groomName} & ${tokenRecord.wedding.brideName}`
    : `${branding.appName} Event Portal`;

  return (
    <MobilePinGate
      token={token}
      weddingTitle={weddingTitle}
      requiresPin={requiresPin}
      initialAuthenticated={initialAuthenticated}
    >
      <div className="min-h-screen bg-background max-w-md mx-auto border-x border-border/60 flex flex-col justify-between shadow-xs">
        <header className="h-13 border-b border-border/60 px-4 flex items-center justify-between bg-background/85 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center space-x-2 min-w-0">
            <span className="h-2 w-2 rounded-full bg-primary/70 shrink-0" />
            <span className="font-serif text-xs font-bold tracking-tight truncate max-w-[220px] text-foreground">
              {weddingTitle}
            </span>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 pb-20">{props.children}</main>
      </div>
    </MobilePinGate>
  );
}
