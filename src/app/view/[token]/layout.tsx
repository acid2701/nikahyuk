import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MobilePinGate } from "@/components/modules/view/mobile-pin-gate";

export default async function ViewTokenLayout(props: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const { token } = (await props.params) as { token: string };
  const supabase = await createClient();

  const { data: tokenRecord } = await supabase
    .from("shareable_tokens")
    .select("*, weddings(groom_name, bride_name, groom_father_name, groom_mother_name, bride_father_name, bride_mother_name)")
    .eq("token_hash", token)
    .eq("is_active", true)
    .single();

  if (!tokenRecord) {
    notFound();
  }

  const isExpired = new Date(tokenRecord.expires_at) < new Date();
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

  const requiresPin = !!tokenRecord.pin_hash;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(`token_session_${token}`);
  const initialAuthenticated = sessionCookie?.value === "authenticated";

  const weddingTitle = tokenRecord.weddings
    ? `${tokenRecord.weddings.groom_name} & ${tokenRecord.weddings.bride_name}`
    : "NikahYuk Event Portal";

  return (
    <MobilePinGate
      token={token}
      weddingTitle={weddingTitle}
      requiresPin={requiresPin}
      initialAuthenticated={initialAuthenticated}
    >
      <div className="min-h-screen bg-background max-w-md mx-auto border-x border-border flex flex-col justify-between">
        <main className="flex-1 p-4 pb-20">{props.children}</main>
      </div>
    </MobilePinGate>
  );
}
