"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordAuditLog } from "@/lib/audit/logger";
import { sanitizePhoneNumber } from "@/lib/utils/wa-sanitizer";
import {
  RegisterVendorPartnerInput,
  VendorPartnerItem,
  VendorPackageItem,
  CreateVendorPackageInput,
} from "@/types/vendor-partner.types";

export async function loginVendorPartnerAction(email: string, password: string) {
  const supabase = await createClient();

  // 1. Attempt standard password login
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!authError && authData?.user) {
    // Check if partner record is suspended
    const { data: partner } = await (supabase.from("vendor_partners" as any) as any)
      .select("*")
      .or(`user_id.eq.${authData.user.id},email.eq.${authData.user.email}`)
      .maybeSingle();

    if (partner && partner.status === "suspended") {
      await supabase.auth.signOut();
      return {
        success: false,
        error: "Akun vendor Anda sedang ditangguhkan (suspended) oleh Admin. Silakan hubungi Support NikahYuk.",
      };
    }

    return { success: true };
  }

  // 2. Smart Auto-Repair & Confirmation using Admin Client if initial login fails
  console.warn("Vendor login auth error, attempting auto-repair:", authError?.message);
  const adminSupabase = createAdminClient();

  const { data: partner } = await (adminSupabase.from("vendor_partners" as any) as any)
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (!partner) {
    return {
      success: false,
      error: "Email vendor ini belum terdaftar di NikahYuk. Silakan lakukan pendaftaran mitra vendor terlebih dahulu (30 detik).",
    };
  }

  if (partner.status === "suspended") {
    return {
      success: false,
      error: "Akun vendor Anda sedang ditangguhkan (suspended) oleh Admin. Silakan hubungi Support NikahYuk.",
    };
  }

  // Find existing Auth user by email
  const { data: userList } = await adminSupabase.auth.admin.listUsers();
  const existingAuthUser = userList?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (existingAuthUser) {
    // Confirm email and update password to what the user entered
    await adminSupabase.auth.admin.updateUserById(existingAuthUser.id, {
      password: password,
      email_confirm: true,
      user_metadata: {
        ...(existingAuthUser.user_metadata || {}),
        user_type: "vendor",
        is_vendor: true,
      },
    });

    // Link user_id if missing
    if (!partner.user_id) {
      await (adminSupabase.from("vendor_partners" as any) as any)
        .update({ user_id: existingAuthUser.id })
        .eq("id", partner.id);
    }

    // Retry sign-in now that email is confirmed and password synced
    const retryResult = await supabase.auth.signInWithPassword({ email, password });
    if (!retryResult.error) {
      return { success: true };
    }
  } else {
    // Auth user doesn't exist yet for this vendor partner! Create it with email_confirm: true!
    const { data: newAuthUser, error: createErr } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: partner.pic_name, user_type: "vendor", is_vendor: true },
    });

    if (!createErr && newAuthUser?.user) {
      await (adminSupabase.from("vendor_partners" as any) as any)
        .update({ user_id: newAuthUser.user.id })
        .eq("id", partner.id);

      const retryResult = await supabase.auth.signInWithPassword({ email, password });
      if (!retryResult.error) {
        return { success: true };
      }
    }
  }

  return {
    success: false,
    error: "Email atau kata sandi tidak cocok. Pastikan Anda mengetikkan kata sandi yang sesuai saat pendaftaran.",
  };
}

export async function registerVendorPartnerAction(input: RegisterVendorPartnerInput) {
  const adminSupabase = createAdminClient();
  const supabase = await createClient();
  const sanitized = sanitizePhoneNumber(input.phone);

  let createdUserId: string | null = null;

  // 1. Create or Link Auth User with DUAL-ROLE Metadata (Model A: 1 Email Banyak Peran)
  if (input.password && input.password.length >= 6) {
    try {
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true, // AUTO-CONFIRM EMAIL INSTANTLY
        user_metadata: {
          full_name: input.picName,
          user_type: "vendor",
          is_vendor: true,
        },
      });

      if (authError) {
        console.warn("Vendor Auth Admin Create Notice:", authError.message);

        // MODEL A DUAL-ROLE: If user is ALREADY REGISTERED (e.g. as a Couple), link their account to Vendor Partner!
        if (authError.message.toLowerCase().includes("already registered")) {
          const { data: userList } = await adminSupabase.auth.admin.listUsers();
          const existingUser = userList?.users?.find((u) => u.email?.toLowerCase() === input.email.toLowerCase());

          if (existingUser) {
            // Update metadata to grant Vendor role alongside Couple role!
            await adminSupabase.auth.admin.updateUserById(existingUser.id, {
              password: input.password,
              email_confirm: true,
              user_metadata: {
                ...(existingUser.user_metadata || {}),
                user_type: "vendor",
                is_vendor: true,
              },
            });
            createdUserId = existingUser.id;
          }
        }
      } else if (authData?.user) {
        createdUserId = authData.user.id;
      }
    } catch (authErr) {
      console.warn("Auth admin signup notice:", authErr);
    }
  }

  // 2. Prepare payload for vendor_partners table (DEFAULT INSTANT APPROVED ACTIVE)
  const insertPayload: any = {
    company_name: input.companyName,
    category: input.category,
    city: input.city,
    province: input.province || "Indonesia",
    price_tier: "standard",
    min_price: 0,
    max_price: 0,
    pic_name: input.picName,
    phone: input.phone,
    sanitized_phone: sanitized,
    email: input.email,
    status: "approved", // INSTANT ACTIVE
    is_verified: true,
  };

  if (createdUserId) {
    insertPayload.user_id = createdUserId;
  }

  try {
    let { error: insertError } = await (supabase.from("vendor_partners" as any) as any).insert(insertPayload);

    // Fallback if user_id column does not exist on pre-existing vendor_partners table in Supabase
    if (insertError && insertError.message?.includes("user_id")) {
      console.warn("Retrying insert without user_id column fallback...");
      delete insertPayload.user_id;
      const { error: retryErr } = await (supabase.from("vendor_partners" as any) as any).insert(insertPayload);
      insertError = retryErr;
    }

    if (insertError) {
      console.error("Supabase Vendor Insert Error:", insertError);
      if (insertError.code === "42P01" || insertError.message?.includes("does not exist")) {
        return {
          success: false,
          error:
            "Tabel database 'vendor_partners' belum dibuat di Supabase SQL Editor. Silakan jalankan skrip SQL migrasi yang tersedia.",
        };
      }
      if (insertError.code === "23505" || insertError.message?.includes("unique constraint")) {
        return {
          success: false,
          error: "Vendor dengan email atau nama brand ini sudah pernah terdaftar.",
        };
      }
      return {
        success: false,
        error: insertError.message || "Gagal menyimpan data vendor ke database Supabase.",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Vendor Partner Registration Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan internal server.",
    };
  }
}

export async function getVendorPartnersAdminAction(statusFilter: string = "all") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  let query = (supabase.from("vendor_partners" as any) as any)
    .select("*")
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    console.warn("vendor_partners query warning:", error.message);
    return [] as VendorPartnerItem[];
  }

  return (data || []) as VendorPartnerItem[];
}

export async function approveVendorPartnerAction(partnerId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await (supabase.from("vendor_partners" as any) as any)
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", partnerId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/vendor-partners");
  return { success: true };
}

export async function suspendVendorPartnerAction(partnerId: string, reason: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await (supabase.from("vendor_partners" as any) as any)
    .update({ status: "suspended", rejection_reason: reason, updated_at: new Date().toISOString() })
    .eq("id", partnerId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/vendor-partners");
  return { success: true };
}

export async function rejectVendorPartnerAction(partnerId: string, reason: string) {
  return suspendVendorPartnerAction(partnerId, reason);
}

export async function getApprovedVendorPartnersAction(filters?: {
  city?: string;
  category?: string;
  priceTier?: string;
  search?: string;
}) {
  const supabase = await createClient();

  let query = (supabase.from("vendor_partners" as any) as any)
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (filters?.city && filters.city !== "all") {
    query = query.ilike("city", `%${filters.city}%`);
  }

  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters?.priceTier && filters.priceTier !== "all") {
    query = query.eq("price_tier", filters.priceTier);
  }

  if (filters?.search) {
    query = query.or(`company_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data: partnersData, error } = await query;
  if (error) {
    console.warn("Failed fetching approved vendor partners:", error.message);
    return [] as VendorPartnerItem[];
  }

  const partners = (partnersData || []) as VendorPartnerItem[];

  // Fetch packages for all returned partners
  if (partners.length > 0) {
    const partnerIds = partners.map((p) => p.id);
    const { data: pkgData } = await (supabase.from("vendor_packages" as any) as any)
      .select("*")
      .in("partner_id", partnerIds)
      .eq("is_active", true);

    const pkgs = (pkgData || []) as VendorPackageItem[];

    partners.forEach((p) => {
      p.packages = pkgs.filter((pkg) => pkg.partner_id === p.id);
      if (p.packages.length > 0) {
        const prices = p.packages.map((pkg) => pkg.price);
        p.min_price = Math.min(...prices);
        p.max_price = Math.max(...prices);
      }
    });
  }

  return partners;
}

/* ========================================================================= */
/* VENDOR PACKAGES CRUD SERVER ACTIONS                                       */
/* ========================================================================= */

export async function getVendorPackagesAction(partnerId: string) {
  const supabase = await createClient();

  const { data, error } = await (supabase.from("vendor_packages" as any) as any)
    .select("*")
    .eq("partner_id", partnerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("getVendorPackagesAction warning:", error.message);
    return [] as VendorPackageItem[];
  }

  return (data || []) as VendorPackageItem[];
}

export async function createVendorPackageAction(partnerId: string, input: CreateVendorPackageInput) {
  const supabase = await createClient();

  const insertPayload: any = {
    partner_id: partnerId,
    package_name: input.packageName,
    price: input.price || 0,
    capacity_pax: input.capacityPax || 0,
    features_include: input.featuresInclude || [],
    description: input.description || null,
    is_active: true,
  };

  let { data, error } = await (supabase.from("vendor_packages" as any) as any)
    .insert(insertPayload)
    .select()
    .single();

  // Smart Schema Fallback if features_include column is missing in Supabase schema cache
  if (error && error.message?.includes("features_include")) {
    console.warn("Retrying package insert without features_include column fallback...");
    delete insertPayload.features_include;

    if (input.featuresInclude && input.featuresInclude.length > 0) {
      const formattedFeatures = `Include Fasilitas: ${input.featuresInclude.join(", ")}`;
      insertPayload.description = input.description
        ? `${input.description}\n${formattedFeatures}`
        : formattedFeatures;
    }

    const { data: retryData, error: retryErr } = await (supabase.from("vendor_packages" as any) as any)
      .insert(insertPayload)
      .select()
      .single();

    data = retryData;
    error = retryErr;
  }

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/vendor/dashboard");
  return { success: true, packageItem: data as VendorPackageItem };
}

export async function updateVendorPackageAction(packageId: string, input: CreateVendorPackageInput) {
  const supabase = await createClient();

  const updatePayload: any = {
    package_name: input.packageName,
    price: input.price || 0,
    capacity_pax: input.capacityPax || 0,
    features_include: input.featuresInclude || [],
    description: input.description || null,
  };

  let { data, error } = await (supabase.from("vendor_packages" as any) as any)
    .update(updatePayload)
    .eq("id", packageId)
    .select()
    .single();

  // Smart Schema Fallback if features_include column is missing in Supabase schema cache
  if (error && error.message?.includes("features_include")) {
    console.warn("Retrying package update without features_include column fallback...");
    delete updatePayload.features_include;

    if (input.featuresInclude && input.featuresInclude.length > 0) {
      const formattedFeatures = `Include Fasilitas: ${input.featuresInclude.join(", ")}`;
      updatePayload.description = input.description
        ? `${input.description}\n${formattedFeatures}`
        : formattedFeatures;
    }

    const { data: retryData, error: retryErr } = await (supabase.from("vendor_packages" as any) as any)
      .update(updatePayload)
      .eq("id", packageId)
      .select()
      .single();

    data = retryData;
    error = retryErr;
  }

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/vendor/dashboard");
  return { success: true, packageItem: data as VendorPackageItem };
}

export async function deleteVendorPackageAction(packageId: string) {
  const supabase = await createClient();

  const { error } = await (supabase.from("vendor_packages" as any) as any)
    .delete()
    .eq("id", packageId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/vendor/dashboard");
  return { success: true };
}

export async function toggleVendorPackageStatusAction(packageId: string, isActive: boolean) {
  const supabase = await createClient();

  const { error } = await (supabase.from("vendor_packages" as any) as any)
    .update({ is_active: isActive })
    .eq("id", packageId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/vendor/dashboard");
  return { success: true };
}

export async function getPublicVendorPartnerByIdAction(partnerId: string): Promise<VendorPartnerItem | null> {
  const supabase = await createClient();

  const { data: partner, error } = await (supabase.from("vendor_partners" as any) as any)
    .select("*")
    .eq("id", partnerId)
    .maybeSingle();

  if (error || !partner) return null;

  const { data: pkgs } = await (supabase.from("vendor_packages" as any) as any)
    .select("*")
    .eq("partner_id", partnerId)
    .order("price", { ascending: true });

  return {
    ...partner,
    packages: pkgs || [],
  };
}

/* ========================================================================= */
/* VENDOR CRM CLIENT & DEAL TRACKER ACTIONS                                  */
/* ========================================================================= */

export interface VendorClientDealItem {
  id: string;
  vendor_id: string;
  client_name: string;
  event_type?: string;
  wedding_date: string;
  package_name: string;
  deal_amount: number;
  down_payment: number;
  stage: "inquiry" | "proposal" | "deal" | "completed";
  notes?: string;
  created_at: string;
}

export async function getVendorClientDealsAction(partnerId: string): Promise<VendorClientDealItem[]> {
  const supabase = await createClient();

  const { data, error } = await (supabase.from("vendor_client_deals" as any) as any)
    .select("*")
    .eq("vendor_id", partnerId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data || []) as VendorClientDealItem[];
}

export async function createVendorClientDealAction(partnerId: string, input: {
  clientName: string;
  eventType?: string;
  weddingDate: string;
  packageName: string;
  dealAmount: number;
  downPayment: number;
  stage: string;
  notes?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await (supabase.from("vendor_client_deals" as any) as any)
    .insert({
      vendor_id: partnerId,
      client_name: input.clientName,
      event_type: input.eventType || "Pernikahan",
      wedding_date: input.weddingDate,
      package_name: input.packageName,
      deal_amount: input.dealAmount || 0,
      down_payment: input.downPayment || 0,
      stage: input.stage || "inquiry",
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/vendor/dashboard");
  return { success: true, deal: data as VendorClientDealItem };
}

export async function updateVendorClientDealStageAction(dealId: string, stage: string) {
  const supabase = await createClient();

  const { error } = await (supabase.from("vendor_client_deals" as any) as any)
    .update({ stage })
    .eq("id", dealId);

  if (error) throw new Error(error.message);
  revalidatePath("/vendor/dashboard");
  return { success: true };
}

export async function updateVendorClientDealAction(dealId: string, input: {
  clientName: string;
  eventType?: string;
  weddingDate: string;
  packageName: string;
  dealAmount: number;
  stage: string;
  notes?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await (supabase.from("vendor_client_deals" as any) as any)
    .update({
      client_name: input.clientName,
      event_type: input.eventType || "Pernikahan",
      wedding_date: input.weddingDate,
      package_name: input.packageName,
      deal_amount: input.dealAmount || 0,
      stage: input.stage,
      notes: input.notes || null,
    })
    .eq("id", dealId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/vendor/dashboard");
  return { success: true, deal: data as VendorClientDealItem };
}

export async function deleteVendorClientDealAction(dealId: string) {
  const supabase = await createClient();

  const { error } = await (supabase.from("vendor_client_deals" as any) as any)
    .delete()
    .eq("id", dealId);

  if (error) throw new Error(error.message);
  revalidatePath("/vendor/dashboard");
  return { success: true };
}

/* ========================================================================= */
/* MULTI-TERMIN PAYMENT LEDGER ACTIONS                                       */
/* ========================================================================= */

export interface VendorPaymentRecord {
  id: string;
  deal_id: string;
  amount: number;
  payment_date: string;
  termin_label: string;
  payment_method: string;
  notes?: string;
  created_at: string;
}

export async function getVendorDealPaymentsAction(dealId: string): Promise<VendorPaymentRecord[]> {
  const supabase = await createClient();

  const { data, error } = await (supabase.from("vendor_deal_payments" as any) as any)
    .select("*")
    .eq("deal_id", dealId)
    .order("payment_date", { ascending: true });

  if (error) return [];
  return (data || []) as VendorPaymentRecord[];
}

export async function addVendorDealPaymentAction(dealId: string, input: {
  amount: number;
  paymentDate: string;
  terminLabel: string;
  paymentMethod: string;
  notes?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await (supabase.from("vendor_deal_payments" as any) as any)
    .insert({
      deal_id: dealId,
      amount: input.amount || 0,
      payment_date: input.paymentDate,
      termin_label: input.terminLabel || "Termin Pembayaran",
      payment_method: input.paymentMethod || "Transfer Bank",
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/vendor/dashboard");
  return { success: true, payment: data as VendorPaymentRecord };
}

export async function deleteVendorDealPaymentAction(paymentId: string) {
  const supabase = await createClient();

  const { error } = await (supabase.from("vendor_deal_payments" as any) as any)
    .delete()
    .eq("id", paymentId);

  if (error) throw new Error(error.message);
  revalidatePath("/vendor/dashboard");
  return { success: true };
}

/* ========================================================================= */
/* 1-CLICK SPECIFIC PACKAGE IMPORT FOR COUPLES                                */
/* ========================================================================= */

export async function importPartnerPackageToWeddingAction(
  partnerId: string,
  packageId: string | null,
  weddingId: string,
  eventId?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Fetch partner
  const { data: partner, error: partnerErr } = await (supabase.from("vendor_partners" as any) as any)
    .select("*")
    .eq("id", partnerId)
    .single();

  if (partnerErr || !partner) {
    throw new Error("Partner vendor tidak ditemukan.");
  }

  const partnerData = partner as any;
  let selectedPkg: VendorPackageItem | null = null;

  if (packageId) {
    const { data: pkg } = await (supabase.from("vendor_packages" as any) as any)
      .select("*")
      .eq("id", packageId)
      .single();
    if (pkg) selectedPkg = pkg as VendorPackageItem;
  }

  const contractVal = selectedPkg ? Number(selectedPkg.price) : Number(partnerData.min_price || 0);
  const pkgTitle = selectedPkg ? `Paket: ${selectedPkg.package_name}` : "Vendor Partner Resmi";
  const pkgDetails = selectedPkg
    ? `Terpilih Paket '${selectedPkg.package_name}' (Rp ${contractVal.toLocaleString("id-ID")}). ${selectedPkg.description || ""}`
    : partnerData.description || `Vendor Partner Resmi (${partnerData.city})`;

  // Insert into user's vendors table
  const { data: importedVendor, error: insertErr } = await supabase
    .from("vendors")
    .insert({
      wedding_id: weddingId,
      event_id: eventId || null,
      vendor_name: `${partnerData.company_name} (${pkgTitle})`,
      category: partnerData.category,
      pic_name: partnerData.pic_name,
      sanitized_phone: partnerData.sanitized_phone,
      contract_value: contractVal,
      status: "candidate",
      package_details: pkgDetails,
      pros_cons_notes: `Partner Resmi NikahYuk - Wilayah ${partnerData.city}. Kontak: ${partnerData.phone}`,
    } as any)
    .select()
    .single();

  if (insertErr || !importedVendor) {
    throw new Error(insertErr?.message || "Gagal mengimpor vendor ke acara pernikahan.");
  }

  // Auto create budget item
  try {
    await supabase.from("budget_items").insert({
      wedding_id: weddingId,
      event_id: eventId || null,
      vendor_id: importedVendor.id,
      item_name: `Vendor ${partnerData.category} - ${partnerData.company_name} (${pkgTitle})`,
      estimated_cost: contractVal,
      target_payer: "joint",
      notes: `Di-impor dari Katalog Partner Vendor Resmi NikahYuk`,
    } as any);
  } catch (budgetErr) {
    console.warn("Auto budget sync warning:", budgetErr);
  }

  // Link R2 pricelist/brochure if exists (from vendor profile or package)
  const r2FileKeyToLink = partnerData.pricelist_r2_key || (selectedPkg as any)?.brochure_r2_key || (selectedPkg as any)?.pdf_r2_key;
  if (r2FileKeyToLink) {
    try {
      const adminSupabase = createAdminClient();
      const docPayload: any = {
        vendor_id: importedVendor.id,
        document_title: `Pricelist Resmi - ${partnerData.company_name} ${selectedPkg ? `(${selectedPkg.package_name})` : ""}`,
        r2_file_key: r2FileKeyToLink,
        file_size_bytes: 1024 * 500,
        mime_type: "application/pdf",
        doc_type: "pricelist",
      };

      let { error: docErr } = await (adminSupabase.from("vendor_documents" as any) as any).insert(docPayload);

      if (docErr && docErr.message?.includes("doc_type")) {
        delete docPayload.doc_type;
        await (adminSupabase.from("vendor_documents" as any) as any).insert(docPayload);
      }
    } catch (docErr) {
      console.warn("Pricelist document link warning:", docErr);
    }
  }

  await recordAuditLog({
    weddingId,
    userId: user.id,
    userDisplayName: user.email || "Pengantin",
    moduleName: "Vendors",
    actionType: "CREATE",
    changeDiff: { importedFromPartnerId: partnerId, packageId, vendorName: partnerData.company_name },
  });

  revalidatePath(`/dashboard/${weddingId}/vendors`);
  return { success: true, vendor: importedVendor };
}

export async function autoLinkMissingPartnerDocumentsAction(weddingId: string) {
  try {
    const adminSupabase = createAdminClient();
    const { data: vendors } = await (adminSupabase.from("vendors" as any) as any)
      .select("id, vendor_name, pros_cons_notes, vendor_documents(id)")
      .eq("wedding_id", weddingId);

    if (!vendors || vendors.length === 0) return { success: true, count: 0 };

    let linkedCount = 0;

    for (const v of vendors) {
      const docs = v.vendor_documents || [];
      if (docs.length === 0) {
        const compName = v.vendor_name.split(" (")[0]?.trim();
        if (compName) {
          const { data: partner } = await (adminSupabase.from("vendor_partners" as any) as any)
            .select("company_name, pricelist_r2_key")
            .ilike("company_name", compName)
            .maybeSingle();

          if (partner && partner.pricelist_r2_key) {
            const docPayload: any = {
              vendor_id: v.id,
              document_title: `Brosur PDF Resmi - ${partner.company_name}`,
              r2_file_key: partner.pricelist_r2_key,
              file_size_bytes: 1024 * 500,
              mime_type: "application/pdf",
              doc_type: "pricelist",
            };

            let { error: docErr } = await (adminSupabase.from("vendor_documents" as any) as any).insert(docPayload);

            if (docErr && docErr.message?.includes("doc_type")) {
              delete docPayload.doc_type;
              await (adminSupabase.from("vendor_documents" as any) as any).insert(docPayload);
            }
            linkedCount++;
          }
        }
      }
    }

    if (linkedCount > 0) {
      revalidatePath(`/dashboard/${weddingId}/vendors`);
    }

    return { success: true, count: linkedCount };
  } catch (e) {
    console.warn("Auto link missing partner documents warning:", e);
    return { success: false, count: 0 };
  }
}

/* ========================================================================= */
/* CURRENT USER VENDOR PROFILE & SETUP ACTIONS                               */
/* ========================================================================= */

export async function getCurrentUserVendorPartnerAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, partner: null };
  }

  const { data: partnerData } = await (supabase.from("vendor_partners" as any) as any)
    .select("*")
    .or(`user_id.eq.${user.id},email.eq.${user.email}`)
    .maybeSingle();

  if (!partnerData) {
    return {
      user: {
        id: user.id,
        email: user.email || "",
        fullName: (user.user_metadata?.full_name as string) || (user.email?.split("@")[0] as string) || "",
      },
      partner: null,
    };
  }

  const partner = partnerData as VendorPartnerItem;

  // Link user_id if missing
  if (!partner.user_id) {
    try {
      await (supabase.from("vendor_partners" as any) as any)
        .update({ user_id: user.id })
        .eq("id", partner.id);
    } catch (e) {
      console.warn("Failed linking user_id to partner:", e);
    }
  }

  // Fetch packages
  const { data: pkgData } = await (supabase.from("vendor_packages" as any) as any)
    .select("*")
    .eq("partner_id", partner.id)
    .order("created_at", { ascending: false });

  partner.packages = (pkgData || []) as VendorPackageItem[];

  return {
    user: {
      id: user.id,
      email: user.email || "",
      fullName: (user.user_metadata?.full_name as string) || (user.email?.split("@")[0] as string) || "",
    },
    partner,
  };
}

export async function setupVendorProfileForExistingUserAction(input: {
  companyName: string;
  category: string;
  city: string;
  province?: string;
  picName: string;
  phone: string;
}) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Sesi pengguna tidak ditemukan. Silakan login terlebih dahulu." };
  }

  const sanitized = sanitizePhoneNumber(input.phone);

  const insertPayload: any = {
    user_id: user.id,
    company_name: input.companyName,
    category: input.category,
    city: input.city,
    province: input.province || "Indonesia",
    price_tier: "standard",
    min_price: 0,
    max_price: 0,
    pic_name: input.picName,
    phone: input.phone,
    sanitized_phone: sanitized,
    email: user.email,
    status: "approved",
    is_verified: true,
  };

  try {
    let { error: insertError } = await (supabase.from("vendor_partners" as any) as any).insert(insertPayload);

    // Fallback if user_id column is missing in schema
    if (insertError && insertError.message?.includes("user_id")) {
      delete insertPayload.user_id;
      const { error: retryErr } = await (supabase.from("vendor_partners" as any) as any).insert(insertPayload);
      insertError = retryErr;
    }

    if (insertError) {
      console.error("Setup vendor profile error:", insertError);
      return { success: false, error: insertError.message || "Gagal menyimpan profil vendor." };
    }

    // Update user metadata to grant vendor access
    try {
      await adminSupabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...(user.user_metadata || {}),
          user_type: "vendor",
          is_vendor: true,
        },
      });
    } catch (metaErr) {
      console.warn("Failed updating user metadata:", metaErr);
    }

    revalidatePath("/vendor/dashboard");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan internal server.",
    };
  }
}

export async function updateVendorProfilePartnerAction(partnerId: string, input: {
  companyName: string;
  category: string;
  city: string;
  province?: string;
  picName: string;
  phone: string;
  description?: string;
  pricelistR2Key?: string;
}) {
  const supabase = await createClient();
  const sanitized = sanitizePhoneNumber(input.phone);

  const updateData: any = {
    company_name: input.companyName,
    category: input.category,
    city: input.city,
    province: input.province || "Indonesia",
    pic_name: input.picName,
    phone: input.phone,
    sanitized_phone: sanitized,
    description: input.description || null,
    updated_at: new Date().toISOString(),
  };

  if (input.pricelistR2Key) {
    updateData.pricelist_r2_key = input.pricelistR2Key;
  }

  const { error } = await (supabase.from("vendor_partners" as any) as any)
    .update(updateData)
    .eq("id", partnerId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/vendor/dashboard");
  revalidatePath("/admin/vendor-partners");
  return { success: true };
}
