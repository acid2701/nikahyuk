import { createClient } from "@/lib/supabase/server";
import { VendorManager } from "@/components/modules/vendors/vendor-manager";

export default async function VendorsPage(props: { params: Promise<any> }) {
  const { weddingId } = (await props.params) as { weddingId: string };
  const supabase = await createClient();

  const { data: vendorsData } = await supabase
    .from("vendors")
    .select("*, vendor_documents(*)")
    .eq("wedding_id", weddingId)
    .order("created_at", { ascending: false });

  const vendors = vendorsData || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            Vendor Directory & Hub Kontrak
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola mitra vendor, simpan dokumen kontrak, dan hubungi via WhatsApp.
          </p>
        </div>
      </div>

      <VendorManager weddingId={weddingId} initialVendors={vendors as any} />
    </div>
  );
}
