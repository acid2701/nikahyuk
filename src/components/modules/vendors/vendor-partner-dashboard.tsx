"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndonesiaRegionSelect } from "@/components/shared/location/indonesia-region-select";
import { MediaUploaderDropzone, UploadedFileMeta } from "@/components/shared/media-uploader/dropzone";
import { WAButton } from "@/components/shared/whatsapp/wa-button";
import { useToast } from "@/components/ui/use-toast";
import {
  createVendorPackageAction,
  updateVendorPackageAction,
  deleteVendorPackageAction,
  toggleVendorPackageStatusAction,
  getVendorPackagesAction,
  updateVendorProfilePartnerAction,
  getVendorClientDealsAction,
  createVendorClientDealAction,
  updateVendorClientDealAction,
  updateVendorClientDealStageAction,
  deleteVendorClientDealAction,
  getVendorDealPaymentsAction,
  addVendorDealPaymentAction,
  deleteVendorDealPaymentAction,
  VendorClientDealItem,
  VendorPaymentRecord,
} from "@/actions/vendor-partner-actions";
import { VendorPartnerItem, VendorPackageItem } from "@/types/vendor-partner.types";
import {
  Building2,
  CheckCircle2,
  FileText,
  Upload,
  Coins,
  Plus,
  Edit,
  Trash2,
  Star,
  Package,
  Check,
  Eye,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Copy,
  QrCode,
  MessageSquare,
  Layers,
  Power,
  PowerOff,
  AlertTriangle,
  ExternalLink,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  DollarSign,
  Calendar,
  ArrowRight,
  CheckSquare,
  Clock,
  CreditCard,
  Printer,
  History,
  Receipt,
  PiggyBank,
  Archive,
  AlertCircle,
  BellRing,
  CheckCircle,
  Tag,
  PartyPopper,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

// PRESET TEMPLATES FOR 1-CLICK FACILITY COPIER
const FACILITY_TEMPLATES: Record<string, string[]> = {
  Catering: [
    "Makanan Utama (Buffet 500 Pax)",
    "2 Stand Gubukan Spesial (100 Pax)",
    "Peralatan Makan Lengkap & Waiter Standby",
    "Food Testing Gratis 4 Pax H-14",
  ],
  "MUA & Busana": [
    "Rias & Busana Akad Sepasang Pengantin",
    "Rias & Busana Resepsi Sepasang Pengantin",
    "Rias & Busana 2 Orang Tua Ibu / Bapak",
    "Melati Asli & Aksesoris Busana Lengkap",
    "Retouch MUA Standby hingga Selesai",
  ],
  "Wedding Organizer": [
    "WO Tim Professional (4 Personel H-1 sd Hari H)",
    "Gladi Bersih & Rundown Acara Protocol",
    "Koordinasi Keluarga & Seluruh Vendor",
    "Pendampingan Pengantin H-30 Hari H",
  ],
  Dekorasi: [
    "Backdrop & Pelaminan Utama 8 Meter",
    "Bunga Fresh Flowers & Stand Lighting",
    "Photobooth Corner & Karpet Red Carpet",
    "Kotak Tentu & Gate Masuk Pelaminan",
  ],
  Dokumentasi: [
    "2 Fotografer & 1 Videografer Professional",
    "Unlimited Raw Photos & 100 Edited Photos",
    "Video Teaser 1 Menit & Full Movie 30 Menit",
    "Flashdisk 32GB All Files Softcopy",
  ],
};

// DYNAMIC EVENT TYPES PRESETS
const DYNAMIC_EVENT_TYPES = [
  "💍 Pernikahan (Wedding)",
  "💍 Lamaran / Engagement / Sangjit",
  "🎂 Ulang Tahun / Birthday Party",
  "💼 Corporate Gathering / Event Kantor",
  "👶 Acara Keluarga (7 Bulanan / Aqiqah)",
  "🎓 Pre-Wedding / Photoshoot Session",
  "🎉 Acara / Event Spesial Lainnya",
];

// INITIAL SAMPLE CLIENT DEALS FOR CRM PIPELINE DEMO
const INITIAL_CLIENT_DEALS: VendorClientDealItem[] = [
  {
    id: "deal-1",
    vendor_id: "demo",
    client_name: "Budi & Siti",
    event_type: "💍 Pernikahan (Wedding)",
    wedding_date: "2026-11-12",
    package_name: "Paket Gold Catering",
    deal_amount: 45000000,
    down_payment: 15000000,
    stage: "completed",
    notes: "DP 15 Jt Lunas via Transfer BCA. Acara sukses dilaksanakan.",
    created_at: new Date().toISOString(),
  },
  {
    id: "deal-2",
    vendor_id: "demo",
    client_name: "Rian & Maya",
    event_type: "💍 Pernikahan (Wedding)",
    wedding_date: "2026-12-24",
    package_name: "Paket Sultan MUA & Busana",
    deal_amount: 35000000,
    down_payment: 10000000,
    stage: "deal",
    notes: "Sudah fitting busana akad & resepsi.",
    created_at: new Date().toISOString(),
  },
  {
    id: "deal-3",
    vendor_id: "demo",
    client_name: "PT Jaya Abadi - Corporate Gathering",
    event_type: "💼 Corporate Gathering / Event Kantor",
    wedding_date: "2027-01-15",
    package_name: "Paket Bronze WO & Event",
    deal_amount: 25000000,
    down_payment: 0,
    stage: "proposal",
    notes: "Proposal penawaran gathering perusahaan dikirim via WA.",
    created_at: new Date().toISOString(),
  },
  {
    id: "deal-4",
    vendor_id: "demo",
    client_name: "Fajar & Clara",
    event_type: "💍 Lamaran / Engagement / Sangjit",
    wedding_date: "2027-02-28",
    package_name: "Paket Intimate Dekorasi Lamaran",
    deal_amount: 20000000,
    down_payment: 0,
    stage: "inquiry",
    notes: "Baru tanya ketersediaan tanggal via WhatsApp.",
    created_at: new Date().toISOString(),
  },
];

// INITIAL SAMPLE PAYMENT RECORDS FOR DEMO DEALS
const INITIAL_PAYMENTS_MAP: Record<string, VendorPaymentRecord[]> = {
  "deal-1": [
    {
      id: "pay-101",
      deal_id: "deal-1",
      amount: 15000000,
      payment_date: "2026-01-10",
      termin_label: "DP 1 (Booking Fee)",
      payment_method: "Transfer BCA",
      notes: "DP 1 Lunas via Transfer BCA a.n Budi",
      created_at: new Date().toISOString(),
    },
    {
      id: "pay-102",
      deal_id: "deal-1",
      amount: 30000000,
      payment_date: "2026-11-05",
      termin_label: "Pelunasan (H-7 Acara)",
      payment_method: "Transfer BCA",
      notes: "Pelunasan 100% Lunas sebelum hari H",
      created_at: new Date().toISOString(),
    },
  ],
  "deal-2": [
    {
      id: "pay-201",
      deal_id: "deal-2",
      amount: 10000000,
      payment_date: "2026-02-20",
      termin_label: "DP 1 (Booking Fee)",
      payment_method: "Transfer Mandiri",
      notes: "DP 1 Lunas via Mandiri",
      created_at: new Date().toISOString(),
    },
  ],
};

// SAMPLE INQUIRY LEADS DATA FOR SCALABLE BOARD DEMO
const INITIAL_BRIDE_LEADS = [
  { id: "1", names: "Budi & Siti", weddingDate: "12 Nov 2026", packageName: "Paket Bronze", price: 25000000, city: "Kota Jakarta Selatan, DKI Jakarta" },
  { id: "2", names: "Rian & Maya", weddingDate: "24 Des 2026", packageName: "Paket Gold", price: 45000000, city: "Kota Bandung, Jawa Barat" },
  { id: "3", names: "Dhani & Annisa", weddingDate: "15 Jan 2027", packageName: "Paket Silver", price: 30000000, city: "Kota Surabaya, Jawa Timur" },
  { id: "4", names: "Fajar & Clara", weddingDate: "28 Feb 2027", packageName: "Paket Diamond", price: 65000000, city: "Kota Jakarta Pusat, DKI Jakarta" },
  { id: "5", names: "Reza & Putri", weddingDate: "10 Mar 2027", packageName: "Paket Intimate", price: 20000000, city: "Kota Semarang, Jawa Tengah" },
  { id: "6", names: "Hendra & Lestari", weddingDate: "05 Apr 2027", packageName: "Paket Royal", price: 80000000, city: "Kota Medan, Sumatera Utara" },
  { id: "7", names: "Bagus & Kartika", weddingDate: "20 Mei 2027", packageName: "Paket Executive", price: 55000000, city: "Kota Yogyakarta, DI Yogyakarta" },
];

interface VendorPartnerDashboardProps {
  partner: VendorPartnerItem;
}

export function VendorPartnerDashboard({ partner }: VendorPartnerDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "overview";

  const [activeTab, setActiveTab] = React.useState(tabFromUrl);

  React.useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const [packages, setPackages] = React.useState<VendorPackageItem[]>(partner.packages || []);
  const [deals, setDeals] = React.useState<VendorClientDealItem[]>(INITIAL_CLIENT_DEALS);
  const [paymentsMap, setPaymentsMap] = React.useState<Record<string, VendorPaymentRecord[]>>(INITIAL_PAYMENTS_MAP);
  const [loading, setLoading] = React.useState(false);

  // Live Public Preview Modal & QR Code Modal State
  const [openPreviewModal, setOpenPreviewModal] = React.useState(false);
  const [openQrModal, setOpenQrModal] = React.useState(false);

  // Package Modal State (Create / Edit)
  const [openPackageModal, setOpenPackageModal] = React.useState(false);
  const [editingPackage, setEditingPackage] = React.useState<VendorPackageItem | null>(null);

  // Elegant Delete Confirmation Modal State
  const [deletingPackage, setDeletingPackage] = React.useState<VendorPackageItem | null>(null);

  // CRM Deal Form Modal State (Create / Edit & Reschedule & Dynamic Event Types)
  const [openDealModal, setOpenDealModal] = React.useState(false);
  const [editingDeal, setEditingDeal] = React.useState<VendorClientDealItem | null>(null);
  const [dealClientName, setDealClientName] = React.useState("");
  const [dealEventType, setDealEventType] = React.useState("💍 Pernikahan (Wedding)");
  const [dealWeddingDate, setDealWeddingDate] = React.useState("");
  const [dealPackageName, setDealPackageName] = React.useState("");
  const [dealAmount, setDealAmount] = React.useState("");
  const [dealDownPayment, setDealDownPayment] = React.useState("");
  const [dealStage, setDealStage] = React.useState("inquiry");
  const [dealNotes, setDealNotes] = React.useState("");

  // Multi-Termin Payment Ledger Modal State
  const [activeLedgerDeal, setActiveLedgerDeal] = React.useState<VendorClientDealItem | null>(null);
  const [newPayAmount, setNewPayAmount] = React.useState("");
  const [newPayDate, setNewPayDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [newPayTermin, setNewPayTermin] = React.useState("DP 1 (Booking Fee)");
  const [newPayMethod, setNewPayMethod] = React.useState("Transfer BCA");
  const [newPayNotes, setNewPayNotes] = React.useState("");

  // Digital Receipt Printable Modal State
  const [receiptDeal, setReceiptDeal] = React.useState<VendorClientDealItem | null>(null);

  // Completed Archive Search State
  const [archiveSearchQuery, setArchiveSearchQuery] = React.useState("");

  // Bride Leads Board State (Search, Numbering & Pagination)
  const [leadSearchQuery, setLeadSearchQuery] = React.useState("");
  const [leadCurrentPage, setLeadCurrentPage] = React.useState(1);
  const leadPageSize = 5;

  // Package Form State
  const [packageName, setPackageName] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [capacityPax, setCapacityPax] = React.useState("");
  const [featuresString, setFeaturesString] = React.useState("");
  const [packageDesc, setPackageDesc] = React.useState("");

  // Edit Profile Form State
  const [companyName, setCompanyName] = React.useState(partner.company_name || "");
  const [category, setCategory] = React.useState(partner.category || "Catering");
  const [province, setProvince] = React.useState(partner.province || "DKI Jakarta");
  const [city, setCity] = React.useState(partner.city || "Jakarta Selatan");
  const [picName, setPicName] = React.useState(partner.pic_name || "");
  const [phone, setPhone] = React.useState(partner.phone || "");
  const [description, setDescription] = React.useState(partner.description || "");

  // R2 File Upload State
  const [uploadedFileName, setUploadedFileName] = React.useState("");
  const [pricelistR2Key, setPricelistR2Key] = React.useState(partner.pricelist_r2_key || "");

  const { toast } = useToast();

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/v/${partner.id}` : `/v/${partner.id}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`;

  const reloadPackages = React.useCallback(async () => {
    try {
      const data = await getVendorPackagesAction(partner.id);
      setPackages(data);
    } catch (err) {
      console.warn("Failed reloading packages:", err);
    }
  }, [partner.id]);

  const reloadDeals = React.useCallback(async () => {
    try {
      const data = await getVendorClientDealsAction(partner.id);
      if (data && data.length > 0) {
        setDeals(data);
      }
    } catch (err) {
      console.warn("Failed reloading deals:", err);
    }
  }, [partner.id]);

  React.useEffect(() => {
    reloadPackages();
    reloadDeals();
  }, [reloadPackages, reloadDeals]);

  // Calculate profile completeness score
  const isProfileComplete = Boolean(partner.company_name && partner.city && partner.pic_name);
  const hasPackages = packages.length > 0;
  const hasPricelist = Boolean(pricelistR2Key);
  const completenessScore = (isProfileComplete ? 40 : 0) + (hasPackages ? 30 : 0) + (hasPricelist ? 30 : 0);

  // Helper calculation for deal payments balance
  function getDealPaymentStats(deal: VendorClientDealItem) {
    const list = paymentsMap[deal.id] || [];
    const totalPaid = list.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const dealAmount = Number(deal.deal_amount || 0);
    const remainingBalance = Math.max(0, dealAmount - totalPaid);
    const isFullyPaid = totalPaid >= dealAmount && dealAmount > 0;
    const progressPercent = dealAmount > 0 ? Math.min(100, Math.round((totalPaid / dealAmount) * 100)) : 0;

    return { list, totalPaid, dealAmount, remainingBalance, isFullyPaid, progressPercent };
  }

  // Calculate Financial & Operational CRM KPIs
  const activeDeals = deals.filter((d) => d.stage === "deal");
  const totalOmzetDeal = deals.filter((d) => d.stage === "deal" || d.stage === "completed").reduce((sum, d) => sum + Number(d.deal_amount || 0), 0);
  const totalDealFixCount = activeDeals.length;
  const totalProspekCount = deals.filter((d) => d.stage === "inquiry" || d.stage === "proposal").length;
  const conversionRate = deals.length > 0 ? (((activeDeals.length + deals.filter((d) => d.stage === "completed").length) / deals.length) * 100).toFixed(1) : "0";

  // 1. NEAREST UPCOMING EVENT
  const sortedUpcomingDeals = [...activeDeals].sort((a, b) => new Date(a.wedding_date).getTime() - new Date(b.wedding_date).getTime());
  const nearestDeal = sortedUpcomingDeals[0] || null;

  // 2. UNPAID BALANCE DEADLINE ALERTS (DEALS NEEDING PELUNASAN)
  const pendingPelunasanDeals = activeDeals.filter((d) => {
    const { remainingBalance } = getDealPaymentStats(d);
    return remainingBalance > 0;
  });

  // 3. TOTAL PENDING RECEIVABLES RP
  const totalPiutangRp = activeDeals.reduce((sum, d) => {
    const { remainingBalance } = getDealPaymentStats(d);
    return sum + remainingBalance;
  }, 0);

  // 4. CASH COLLECTION RATE %
  const totalCollectedRp = deals.reduce((sum, d) => {
    const { totalPaid } = getDealPaymentStats(d);
    return sum + totalPaid;
  }, 0);
  const cashCollectionRate = totalOmzetDeal > 0 ? Math.round((totalCollectedRp / totalOmzetDeal) * 100) : 0;

  // Filtered Completed Deals Archive
  const completedDeals = deals.filter((d) => d.stage === "completed");
  const filteredCompletedDeals = completedDeals.filter(
    (d) =>
      d.client_name.toLowerCase().includes(archiveSearchQuery.toLowerCase()) ||
      d.package_name.toLowerCase().includes(archiveSearchQuery.toLowerCase()) ||
      (d.event_type || "").toLowerCase().includes(archiveSearchQuery.toLowerCase()) ||
      d.wedding_date.includes(archiveSearchQuery)
  );

  // Filtered & Paginated Leads
  const filteredLeads = INITIAL_BRIDE_LEADS.filter(
    (item) =>
      item.names.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      item.packageName.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
      item.city.toLowerCase().includes(leadSearchQuery.toLowerCase())
  );

  const totalLeadPages = Math.ceil(filteredLeads.length / leadPageSize) || 1;
  const paginatedLeads = filteredLeads.slice(
    (leadCurrentPage - 1) * leadPageSize,
    leadCurrentPage * leadPageSize
  );

  function resetPackageForm() {
    setPackageName("");
    setPrice("");
    setCapacityPax("");
    setFeaturesString("");
    setPackageDesc("");
    setEditingPackage(null);
  }

  function resetDealForm() {
    setDealClientName("");
    setDealEventType("💍 Pernikahan (Wedding)");
    setDealWeddingDate("");
    setDealPackageName("");
    setDealAmount("");
    setDealDownPayment("");
    setDealStage("inquiry");
    setDealNotes("");
    setEditingDeal(null);
  }

  function handleOpenEditDeal(deal: VendorClientDealItem) {
    setEditingDeal(deal);
    setDealClientName(deal.client_name);
    setDealEventType(deal.event_type || "💍 Pernikahan (Wedding)");
    setDealWeddingDate(deal.wedding_date);
    setDealPackageName(deal.package_name || "");
    setDealAmount(String(deal.deal_amount || ""));
    setDealDownPayment(String(deal.down_payment || ""));
    setDealStage(deal.stage);
    setDealNotes(deal.notes || "");
    setOpenDealModal(true);
  }

  function applyFacilityTemplate(templateKey: string) {
    const list = FACILITY_TEMPLATES[templateKey] || FACILITY_TEMPLATES["Catering"];
    setFeaturesString(list.join("\n"));
    toast({
      title: `Templat Fasilitas ${templateKey} Diterapkan! ✨`,
      description: "Rincian fasilitas terisi otomatis. Anda dapat mengeditnya sesuai kebutuhan.",
      variant: "success",
    });
  }

  function handleOpenEditPackage(pkg: VendorPackageItem) {
    setEditingPackage(pkg);
    setPackageName(pkg.package_name);
    setPrice(String(pkg.price));
    setCapacityPax(pkg.capacity_pax ? String(pkg.capacity_pax) : "");
    setFeaturesString((pkg.features_include || []).join("\n"));
    setPackageDesc(pkg.description || "");
    setOpenPackageModal(true);
  }

  async function handleToggleStatus(packageId: string, newStatus: boolean) {
    try {
      await toggleVendorPackageStatusAction(packageId, newStatus);
      toast({
        title: newStatus ? "Paket Diaktifkan ✨" : "Paket Dinonaktifkan 🚫",
        description: newStatus
          ? "Paket kini aktif dan dapat dicari oleh calon pengantin."
          : "Paket disimpan sebagai draft nonaktif.",
        variant: newStatus ? "success" : "default",
      });
      await reloadPackages();
    } catch (err) {
      toast({
        title: "Gagal Mengubah Status Paket",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  async function handleSavePackage(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const featuresInclude = featuresString
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    try {
      if (editingPackage) {
        await updateVendorPackageAction(editingPackage.id, {
          packageName,
          price: Number(price) || 0,
          capacityPax: Number(capacityPax) || 0,
          featuresInclude,
          description: packageDesc,
        });
        toast({
          title: "Paket Penawaran Diperbarui",
          description: `'${packageName}' berhasil diperbarui.`,
          variant: "success",
        });
      } else {
        await createVendorPackageAction(partner.id, {
          packageName,
          price: Number(price) || 0,
          capacityPax: Number(capacityPax) || 0,
          featuresInclude,
          description: packageDesc,
        });
        toast({
          title: "Paket Penawaran Ditambahkan",
          description: `'${packageName}' berhasil dipublikasikan.`,
          variant: "success",
        });
      }

      setOpenPackageModal(false);
      resetPackageForm();
      await reloadPackages();
    } catch (err) {
      toast({
        title: "Gagal Menyimpan Paket",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function confirmDeletePackage() {
    if (!deletingPackage) return;
    setLoading(true);

    try {
      await deleteVendorPackageAction(deletingPackage.id);
      toast({
        title: "Paket Berhasil Dihapus",
        description: `Paket '${deletingPackage.package_name}' telah dihapus dari katalog Anda.`,
        variant: "default",
      });
      setDeletingPackage(null);
      await reloadPackages();
    } catch (err) {
      toast({
        title: "Gagal Menghapus Paket",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDeal(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingDeal) {
        // UPDATE EXISTING DEAL & RESCHEDULE DATE & EVENT TYPE
        setDeals((prev) =>
          prev.map((d) =>
            d.id === editingDeal.id
              ? {
                  ...d,
                  client_name: dealClientName,
                  event_type: dealEventType,
                  wedding_date: dealWeddingDate,
                  package_name: dealPackageName,
                  deal_amount: Number(dealAmount) || 0,
                  stage: dealStage as any,
                  notes: dealNotes,
                }
              : d
          )
        );

        try {
          await updateVendorClientDealAction(editingDeal.id, {
            clientName: dealClientName,
            eventType: dealEventType,
            weddingDate: dealWeddingDate,
            packageName: dealPackageName,
            dealAmount: Number(dealAmount) || 0,
            stage: dealStage,
            notes: dealNotes,
          });
        } catch (e) {
          console.warn("DB deal update error fallback:", e);
        }

        toast({
          title: "Informasi Acara & Reschedule Diperbarui! 🎉",
          description: `Perubahan rincian acara ${dealEventType} untuk ${dealClientName} tersimpan.`,
          variant: "success",
        });
      } else {
        // CREATE NEW DEAL WITH DYNAMIC EVENT TYPE
        const newDealId = `deal-${Date.now()}`;
        const initialDp = Number(dealDownPayment) || 0;

        const newDeal: VendorClientDealItem = {
          id: newDealId,
          vendor_id: partner.id,
          client_name: dealClientName,
          event_type: dealEventType,
          wedding_date: dealWeddingDate,
          package_name: dealPackageName,
          deal_amount: Number(dealAmount) || 0,
          down_payment: initialDp,
          stage: dealStage as any,
          notes: dealNotes,
          created_at: new Date().toISOString(),
        };

        setDeals((prev) => [newDeal, ...prev]);

        // If initial DP entered, record initial payment
        if (initialDp > 0) {
          const firstPayRecord: VendorPaymentRecord = {
            id: `pay-${Date.now()}`,
            deal_id: newDealId,
            amount: initialDp,
            payment_date: new Date().toISOString().split("T")[0],
            termin_label: "DP 1 (Booking Fee)",
            payment_method: "Transfer Bank",
            notes: dealNotes || "Setoran DP awal saat deal",
            created_at: new Date().toISOString(),
          };

          setPaymentsMap((prev) => ({
            ...prev,
            [newDealId]: [firstPayRecord],
          }));
        }

        try {
          await createVendorClientDealAction(partner.id, {
            clientName: dealClientName,
            eventType: dealEventType,
            weddingDate: dealWeddingDate,
            packageName: dealPackageName,
            dealAmount: Number(dealAmount) || 0,
            downPayment: initialDp,
            stage: dealStage,
            notes: dealNotes,
          });
        } catch (e) {
          console.warn("DB deal save error fallback to state:", e);
        }

        toast({
          title: "Order Event Client Dicatat! 🎉",
          description: `'${dealClientName}' (${dealEventType}) dimasukkan ke pipeline CRM.`,
          variant: "success",
        });
      }

      setOpenDealModal(false);
      resetDealForm();
    } catch (err) {
      toast({
        title: "Gagal Menyimpan Deal",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddPaymentRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!activeLedgerDeal) return;
    setLoading(true);

    const amountNum = Number(newPayAmount) || 0;
    if (amountNum <= 0) {
      toast({
        title: "Nominal Tidak Valid",
        description: "Masukkan nominal pembayaran yang valid di atas Rp 0.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const newPayRecord: VendorPaymentRecord = {
        id: `pay-${Date.now()}`,
        deal_id: activeLedgerDeal.id,
        amount: amountNum,
        payment_date: newPayDate,
        termin_label: newPayTermin,
        payment_method: newPayMethod,
        notes: newPayNotes,
        created_at: new Date().toISOString(),
      };

      setPaymentsMap((prev) => {
        const existing = prev[activeLedgerDeal.id] || [];
        return {
          ...prev,
          [activeLedgerDeal.id]: [...existing, newPayRecord],
        };
      });

      try {
        await addVendorDealPaymentAction(activeLedgerDeal.id, {
          amount: amountNum,
          paymentDate: newPayDate,
          terminLabel: newPayTermin,
          paymentMethod: newPayMethod,
          notes: newPayNotes,
        });
      } catch (e) {
        console.warn("DB payment save fallback:", e);
      }

      toast({
        title: "Termin Pembayaran Dicatat! 💳",
        description: `Setoran '${newPayTermin}' sebesar Rp ${amountNum.toLocaleString("id-ID")} berhasil dicatat.`,
        variant: "success",
      });

      setNewPayAmount("");
      setNewPayNotes("");
    } catch (err) {
      toast({
        title: "Gagal Mencatat Pembayaran",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePaymentRecord(dealId: string, paymentId: string) {
    setPaymentsMap((prev) => {
      const existing = prev[dealId] || [];
      return {
        ...prev,
        [dealId]: existing.filter((p) => p.id !== paymentId),
      };
    });

    try {
      await deleteVendorDealPaymentAction(paymentId);
    } catch (e) {
      console.warn("DB payment delete fallback:", e);
    }

    toast({
      title: "Catatan Pembayaran Dihapus",
      description: "Histori termin pembayaran berhasil dihapus.",
    });
  }

  async function handleChangeDealStage(dealId: string, newStage: "inquiry" | "proposal" | "deal" | "completed") {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
    );

    try {
      await updateVendorClientDealStageAction(dealId, newStage);
    } catch (e) {
      console.warn("DB stage update fallback:", e);
    }

    toast({
      title: "Tahap CRM Diperbarui! ⚡",
      description: newStage === "completed"
        ? `Acara dipindahkan ke Tabel Riwayat Acara Selesai (Completed Archive).`
        : `Status client dipindahkan ke '${newStage.toUpperCase()}'.`,
      variant: "success",
    });
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await updateVendorProfilePartnerAction(partner.id, {
        companyName,
        category,
        city,
        province,
        picName,
        phone,
        description,
        pricelistR2Key,
      });

      toast({
        title: "Profil Usaha Diperbarui! 🎉",
        description: "Informasi profil dan kontak PIC vendor berhasil disimpan.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Mengubah Profil",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleUploadSuccess(meta: UploadedFileMeta) {
    setPricelistR2Key(meta.r2_file_key);
    setUploadedFileName(meta.file_name);
    toast({
      title: "Brosur Pricelist R2 Terunggah",
      description: `File '${meta.file_name}' tersimpan aman di Cloudflare R2. Klik 'Simpan Profil' untuk mempublikasikannya.`,
      variant: "success",
    });
  }

  function handleCopyVendorLink() {
    navigator.clipboard.writeText(publicUrl);
    toast({
      title: "Link Publik Vendor Tersalin! 📋",
      description: `${publicUrl} berhasil disalin ke clipboard. Siap dipasang di Bio Instagram atau WhatsApp Story.`,
      variant: "success",
    });
  }

  return (
    <div className="space-y-4 w-full">
      {/* DASHBOARD MAIN TABS (CLEAN & DIRECT VIEW INTEGRATED WITH SIDEBAR MENU) */}
      <Tabs value={activeTab} className="space-y-4">
        {/* TAB 1: OVERVIEW & VENDOR PROFILE SUMMARY */}
        <TabsContent value="overview" className="space-y-6">
          {/* Header Banner Usaha Vendor */}
          <div className="bg-gradient-to-r from-amber-500/10 via-card to-card p-6 rounded-xl border border-amber-500/30 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl font-bold text-foreground">
                    {partner.company_name}
                  </h1>
                  {partner.status === "approved" ? (
                    <Badge className="bg-emerald-600 text-white text-xs gap-1">
                      <ShieldCheck className="h-3 w-3" /> Official Partner Verified ✅
                    </Badge>
                  ) : partner.status === "suspended" ? (
                    <Badge variant="destructive" className="text-xs">
                      Ditangguhkan (Suspended)
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                      Menunggu Moderasi
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span>{partner.category}</span> • <span>{partner.city}, {partner.province}</span> • <span>PIC: {partner.pic_name}</span>
                </p>
              </div>

              {/* 4 PRO FUNCTIONAL ACTION BUTTONS */}
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                <Button
                  onClick={handleCopyVendorLink}
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 border-border hover:bg-muted font-semibold"
                >
                  <Copy className="h-3.5 w-3.5 text-primary" /> Salin Link Profil
                </Button>
                <Button
                  onClick={() => setOpenQrModal(true)}
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 border-border hover:bg-muted font-semibold"
                >
                  <QrCode className="h-3.5 w-3.5 text-amber-500" /> QR Code Usaha
                </Button>
                <Button
                  onClick={() => setOpenPreviewModal(true)}
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 border-border hover:bg-muted font-semibold"
                >
                  <Eye className="h-4 w-4 text-emerald-600" /> Pratinjau Publik
                </Button>
                <WAButton
                  phone={partner.sanitized_phone}
                  templateString="Halo {nama_vendor}, dari Tim Support NikahYuk."
                  variables={{ nama_vendor: partner.company_name }}
                  label="Bantuan WA"
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* 4 INFORMATIVE KPI STATS */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <Card className="border-border flex-1">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Jumlah Paket</p>
                  <div className="text-lg font-bold font-mono text-primary mt-0.5">
                    {packages.length} Paket
                  </div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                  <Package className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border flex-1">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Harga Terendah</p>
                  <div className="text-sm font-bold font-mono text-emerald-600 mt-0.5 truncate">
                    {packages.length > 0
                      ? `Rp ${Math.min(...packages.map((p) => p.price)).toLocaleString("id-ID")}`
                      : "Rp 0"}
                  </div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border flex-1">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Harga Tertinggi</p>
                  <div className="text-sm font-bold font-mono text-amber-600 mt-0.5 truncate">
                    {packages.length > 0
                      ? `Rp ${Math.max(...packages.map((p) => p.price)).toLocaleString("id-ID")}`
                      : "Rp 0"}
                  </div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                  <Coins className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border flex-1">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Rating Mitra</p>
                  <div className="text-lg font-bold font-mono text-amber-500 flex items-center gap-1 mt-0.5">
                    <Star className="h-4 w-4 fill-amber-500" /> {partner.rating_avg || "5.0"}
                  </div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checklist Kelengkapan Profil */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-serif text-lg">Kelengkapan Profil Usaha Vendor</CardTitle>
                  <CardDescription className="text-xs">
                    Profil yang 100% lengkap memiliki tingkat impor 4x lebih tinggi dari calon pengantin & client acara.
                  </CardDescription>
                </div>
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-mono font-bold">
                  {completenessScore}% Selesai
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {/* Progress Bar */}
              <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${completenessScore}%` }}
                />
              </div>

              {/* HORIZONTAL LIST CHECKLIST ITEMS */}
              <div className="space-y-2 flex flex-col pt-2">
                <div className={`p-3 rounded-lg border flex items-center justify-between ${isProfileComplete ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700" : "bg-muted/40 border-border"}`}>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${isProfileComplete ? "text-emerald-600" : "text-muted-foreground"}`} />
                    <div>
                      <p className="font-semibold leading-none text-xs">1. Informasi Profil PIC & Wilayah Operasional</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Nama PIC: {partner.pic_name || "-"} | Kota: {partner.city || "-"}</p>
                    </div>
                  </div>
                  <Badge variant={isProfileComplete ? "default" : "outline"} className={isProfileComplete ? "bg-emerald-600 text-white text-[10px]" : "text-[10px]"}>
                    {isProfileComplete ? "Lengkap ✅" : "Belum Lengkap"}
                  </Badge>
                </div>

                <div className={`p-3 rounded-lg border flex items-center justify-between ${hasPackages ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700" : "bg-muted/40 border-border"}`}>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${hasPackages ? "text-emerald-600" : "text-muted-foreground"}`} />
                    <div>
                      <p className="font-semibold leading-none text-xs">2. Paket Penawaran Interaktif ({packages.length} Paket Aktif)</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Minimal 1 Paket Penawaran Aktif</p>
                    </div>
                  </div>
                  <Badge variant={hasPackages ? "default" : "outline"} className={hasPackages ? "bg-emerald-600 text-white text-[10px]" : "text-[10px]"}>
                    {hasPackages ? `${packages.length} Paket ✅` : "Perlu Paket"}
                  </Badge>
                </div>

                <div className={`p-3 rounded-lg border flex items-center justify-between ${hasPricelist ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700" : "bg-muted/40 border-border"}`}>
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${hasPricelist ? "text-emerald-600" : "text-muted-foreground"}`} />
                    <div>
                      <p className="font-semibold leading-none text-xs">3. Dokumen Brosur PDF Pricelist (Cloudflare R2)</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Brosur resmi dapat diunduh langsung oleh pengantin</p>
                    </div>
                  </div>
                  <Badge variant={hasPricelist ? "default" : "outline"} className={hasPricelist ? "bg-emerald-600 text-white text-[10px]" : "text-[10px]"}>
                    {hasPricelist ? "R2 Active ✅" : "Belum Ada R2"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: MANAJEMEN PAKET PENAWARAN INTERAKTIF */}
        <TabsContent value="packages" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground">
                Daftar Paket Penawaran Interaktif Usaha Anda
              </h2>
              <p className="text-xs text-muted-foreground">
                Kelola seluruh variasi paket penawaran dalam tampilan list horizontal yang rapi.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                resetPackageForm();
                setOpenPackageModal(true);
              }}
              className="gap-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Plus className="h-4 w-4" /> Tambah Paket Baru
            </Button>
          </div>

          {packages.length === 0 ? (
            <Card className="border-dashed p-8 text-center space-y-3">
              <Package className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium text-foreground">Belum Ada Paket Penawaran</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Tambahkan paket penawaran pertama Anda agar calon pengantin dapat memilih dan meng-impor rincian paket Anda ke acara mereka.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  resetPackageForm();
                  setOpenPackageModal(true);
                }}
                className="text-xs gap-1.5 bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Plus className="h-3.5 w-3.5" /> Buat Paket Pertama
              </Button>
            </Card>
          ) : (
            /* HORIZONTAL STACK LIST VIEW (NO GRID) WITH ICON TOGGLE & ICON BUTTONS */
            <div className="space-y-3 flex flex-col">
              {packages.map((pkg) => {
                const isActive = pkg.is_active !== false;

                return (
                  <Card key={pkg.id} className="border-border/80 shadow-xs hover:shadow-md transition-all">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* LEFT SECTION: Title, Pax, Description, Facilities Inline Pills */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h3 className="font-serif font-bold text-base text-foreground leading-none">
                            {pkg.package_name}
                          </h3>
                          {pkg.capacity_pax && pkg.capacity_pax > 0 ? (
                            <Badge variant="secondary" className="text-[10px] font-mono">
                              {pkg.capacity_pax} Pax
                            </Badge>
                          ) : null}

                          {isActive ? (
                            <Badge className="bg-emerald-600/10 text-emerald-700 border-emerald-500/30 text-[10px]">
                              Aktif Dipublikasikan ✅
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px]">
                              Nonaktif (Draft) 🚫
                            </Badge>
                          )}
                        </div>

                        {pkg.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {pkg.description}
                          </p>
                        )}

                        {/* INLINE FACILITY PILLS */}
                        {pkg.features_include && pkg.features_include.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] font-semibold text-muted-foreground mr-1">Fasilitas:</span>
                            {pkg.features_include.map((feat, fIdx) => (
                              <span key={fIdx} className="inline-flex items-center gap-1 text-[10px] bg-muted/60 text-foreground px-2 py-0.5 rounded-full border border-border/60">
                                <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                                {feat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* RIGHT SECTION: Price Badge & 3 ICON-ONLY ACTION BUTTONS */}
                      <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-border/60 pt-3 sm:pt-0 sm:pl-4 shrink-0 gap-2">
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground block">Harga Penawaran:</span>
                          <span className="font-mono font-bold text-emerald-600 text-lg">
                            Rp {Number(pkg.price).toLocaleString("id-ID")}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          {/* 1-CLICK ICON ONLY TOGGLE (POWER / POWEROFF) */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(pkg.id, !isActive)}
                            title={isActive ? "Status: Aktif Dipublikasikan (Klik untuk Nonaktifkan)" : "Status: Nonaktif (Klik untuk Aktifkan)"}
                            className={cn(
                              "h-8 w-8 p-0 border-border hover:bg-muted font-semibold transition-colors",
                              isActive
                                ? "text-emerald-600 border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10"
                                : "text-rose-600 border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10"
                            )}
                          >
                            {isActive ? (
                              <Power className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <PowerOff className="h-4 w-4 text-rose-500" />
                            )}
                          </Button>

                          {/* ICON ONLY EDIT BUTTON */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditPackage(pkg)}
                            title="Edit Rincian Paket"
                            className="h-8 w-8 p-0 border-border hover:bg-muted font-semibold"
                          >
                            <Edit className="h-4 w-4 text-amber-600" />
                          </Button>

                          {/* ICON ONLY ELEGANT DELETE BUTTON */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingPackage(pkg)}
                            title="Hapus Paket Penawaran"
                            className="h-8 w-8 p-0 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-semibold"
                          >
                            <Trash2 className="h-4 w-4 text-rose-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* NEW TAB: CRM PIPELINE CLIENT & DEAL TRACKER WITH DYNAMIC EVENT TYPES */}
        <TabsContent value="crm" className="space-y-6">
          {/* 1. FINANCIAL KPIS (ROW 1) */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <Card className="border-border flex-1 bg-gradient-to-br from-emerald-500/10 via-card to-card">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Total Omzet Nilai Deals</p>
                  <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
                    Rp {totalOmzetDeal.toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 border border-emerald-500/30">
                  <DollarSign className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border flex-1">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Client Booking Fix (DP)</p>
                  <div className="text-xl font-bold font-mono text-primary mt-0.5">
                    {totalDealFixCount} Acara Fix
                  </div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                  <CheckSquare className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border flex-1">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Prospek Aktif / Negosiasi</p>
                  <div className="text-xl font-bold font-mono text-blue-500 mt-0.5">
                    {totalProspekCount} Client
                  </div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20">
                  <Clock className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border flex-1">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Conversion Deal Rate</p>
                  <div className="text-xl font-bold font-mono text-amber-500 mt-0.5">
                    {conversionRate}%
                  </div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 2. OPERATIONAL & DEADLINE ALERT KPIS (ROW 2) */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            {/* KPI 1: NEAREST UPCOMING EVENT COUNTDOWN */}
            <Card className="border-border flex-1 bg-gradient-to-br from-amber-500/10 via-card to-card">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div className="space-y-0.5 min-w-0 pr-2">
                  <p className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Acara Terdekat
                  </p>
                  {nearestDeal ? (
                    <div>
                      <p className="text-sm font-bold text-foreground truncate">{nearestDeal.client_name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">
                        {nearestDeal.event_type || "💍 Pernikahan"} • {nearestDeal.wedding_date}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs font-semibold text-muted-foreground">Belum Ada Acara Aktif</p>
                  )}
                </div>
                <div className="h-9 w-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-600 border border-amber-500/30 shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            {/* KPI 2: UNPAID BALANCE DEADLINE ALERT */}
            <Card className="border-border flex-1 bg-gradient-to-br from-rose-500/10 via-card to-card">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> Alert Pelunasan (Belum Lunas)
                  </p>
                  <div className="text-xl font-bold font-mono text-rose-600 mt-0.5">
                    {pendingPelunasanDeals.length} Acara
                  </div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-600 border border-rose-500/30">
                  <BellRing className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            {/* KPI 3: TOTAL PENDING RECEIVABLES RP */}
            <Card className="border-border flex-1">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Total Piutang Sisa Pelunasan</p>
                  <div className="text-lg font-bold font-mono text-amber-600 mt-0.5 truncate">
                    Rp {totalPiutangRp.toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                  <PiggyBank className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            {/* KPI 4: CASH COLLECTION RATE % */}
            <Card className="border-border flex-1">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Tingkat Arus Kas Lunas</p>
                  <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
                    {cashCollectionRate}% Lunas
                  </div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                  <CheckCircle className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CRM ACTIVE PIPELINE BOARD (3 CLEAN COLUMNS WITH DYNAMIC EVENT BADGES) */}
          <Card className="border-border">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-serif text-lg">Papan Active CRM Pipeline (Acara Mendatang)</CardTitle>
                  <CardDescription className="text-xs">
                    Kelola prospek aktif dan jadwal berbagai acara (Pernikahan, Lamaran, Birthday, Corporate Gathering) yang membutuhkan penanganan vendor.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    resetDealForm();
                    setOpenDealModal(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Tambah Order / Deal Client
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* STAGE 1: INQUIRY */}
                <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border/60">
                  <div className="flex items-center justify-between pb-1 border-b border-border/40">
                    <span className="font-bold text-amber-600 text-xs flex items-center gap-1.5">
                      🟡 1. Inquiry / Prospek Baru
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono font-bold">
                      {deals.filter((d) => d.stage === "inquiry").length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {deals.filter((d) => d.stage === "inquiry").map((deal) => (
                      <Card key={deal.id} className="border-border/80 p-3 space-y-2 shadow-2xs">
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <p className="font-bold text-foreground">{deal.client_name}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-primary" /> {deal.wedding_date}
                            </p>
                          </div>

                          {/* EDIT DEAL BUTTON */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEditDeal(deal)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                            title="Edit Info Deal & Tanggal Acara"
                          >
                            <Edit className="h-3.5 w-3.5 text-amber-500" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-1 flex-wrap">
                          <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-700 border-amber-500/30">
                            {deal.event_type || "💍 Pernikahan"}
                          </Badge>
                          <Badge variant="secondary" className="text-[9px] truncate max-w-full">
                            {deal.package_name}
                          </Badge>
                        </div>

                        {deal.notes && <p className="text-[10px] text-muted-foreground italic line-clamp-2">{deal.notes}</p>}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleChangeDealStage(deal.id, "proposal")}
                          className="w-full h-7 text-[10px] gap-1 font-semibold"
                        >
                          Send Proposal <ArrowRight className="h-3 w-3 text-blue-500" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* STAGE 2: PROPOSAL SENT */}
                <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border/60">
                  <div className="flex items-center justify-between pb-1 border-b border-border/40">
                    <span className="font-bold text-blue-500 text-xs flex items-center gap-1.5">
                      🔵 2. Proposal Sent / Negosiasi
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono font-bold">
                      {deals.filter((d) => d.stage === "proposal").length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {deals.filter((d) => d.stage === "proposal").map((deal) => (
                      <Card key={deal.id} className="border-border/80 p-3 space-y-2 shadow-2xs">
                        <div className="flex items-start justify-between">
                          <div className="space-y-0.5">
                            <p className="font-bold text-foreground">{deal.client_name}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-primary" /> {deal.wedding_date}
                            </p>
                          </div>

                          {/* EDIT DEAL BUTTON */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEditDeal(deal)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                            title="Edit Info Deal & Tanggal Acara"
                          >
                            <Edit className="h-3.5 w-3.5 text-amber-500" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-1 flex-wrap">
                          <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-700 border-blue-500/30">
                            {deal.event_type || "💍 Pernikahan"}
                          </Badge>
                          <span className="font-mono font-bold text-emerald-600 text-xs">
                            Rp {Number(deal.deal_amount).toLocaleString("id-ID")}
                          </span>
                        </div>

                        {deal.notes && <p className="text-[10px] text-muted-foreground italic line-clamp-2">{deal.notes}</p>}
                        <Button
                          size="sm"
                          onClick={() => handleChangeDealStage(deal.id, "deal")}
                          className="w-full h-7 text-[10px] gap-1 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          🟢 Tandai Deal (DP Fix)
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* STAGE 3: DEAL FIX (DP PAID - DYNAMIC MULTI-TERMIN & PROGRESS BARS WITH DYNAMIC EVENT BADGES) */}
                <div className="space-y-3 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/20">
                  <div className="flex items-center justify-between pb-1 border-b border-emerald-500/30">
                    <span className="font-bold text-emerald-600 text-xs flex items-center gap-1.5">
                      🟢 3. Deal DP Fix (Acara Mendatang)
                    </span>
                    <Badge className="bg-emerald-600 text-white text-[10px] font-mono font-bold">
                      {deals.filter((d) => d.stage === "deal").length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {deals.filter((d) => d.stage === "deal").map((deal) => {
                      const { list, totalPaid, dealAmount, remainingBalance, isFullyPaid, progressPercent } = getDealPaymentStats(deal);

                      return (
                        <Card key={deal.id} className="border-emerald-500/30 p-3 space-y-2.5 shadow-2xs bg-card">
                          <div className="space-y-0.5">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-foreground">{deal.client_name}</p>

                              <div className="flex items-center space-x-1">
                                {isFullyPaid ? (
                                  <Badge className="bg-emerald-600 text-white text-[9px]">LUNAS 100% 🟢</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30 text-[9px]">
                                    DP Partial Paid 🟡
                                  </Badge>
                                )}

                                {/* EDIT DEAL BUTTON */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleOpenEditDeal(deal)}
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                                  title="Edit Info Deal & Reschedule Tanggal Acara"
                                >
                                  <Edit className="h-3.5 w-3.5 text-amber-500" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 flex-wrap">
                              <Badge variant="secondary" className="text-[9px]">
                                {deal.event_type || "💍 Pernikahan"}
                              </Badge>
                              <span>• {deal.wedding_date} • {deal.package_name}</span>
                            </p>
                          </div>

                          {/* PROGRESS BAR BALANCE INDICATOR */}
                          <div className="bg-muted/50 p-2 rounded-lg border border-border/60 space-y-1.5 text-[11px]">
                            <div className="flex justify-between font-mono">
                              <span className="text-muted-foreground">Terbayar ({list.length}x):</span>
                              <span className="font-bold text-emerald-600">Rp {totalPaid.toLocaleString("id-ID")}</span>
                            </div>

                            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>

                            <div className="flex justify-between font-mono text-[10px]">
                              <span className="text-muted-foreground">Sisa Pelunasan:</span>
                              <span className={cn("font-bold", remainingBalance === 0 ? "text-emerald-600" : "text-rose-500")}>
                                Rp {remainingBalance.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>

                          {/* ACTION BUTTONS FOR PAYMENTS & RECEIPT PRINT */}
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActiveLedgerDeal(deal)}
                              className="h-7 text-[10px] gap-1 font-semibold border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-500/5 hover:bg-amber-500/10"
                            >
                              <CreditCard className="h-3 w-3 text-amber-500" /> + Termin Bayar
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReceiptDeal(deal)}
                              className="h-7 text-[10px] gap-1 font-semibold border-border hover:bg-muted"
                            >
                              <Printer className="h-3 w-3 text-primary" /> Kwitansi PDF
                            </Button>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChangeDealStage(deal.id, "completed")}
                            className="w-full h-7 text-[10px] gap-1 font-semibold border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10"
                          >
                            🏁 Tandai Acara Selesai
                          </Button>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DEDICATED COMPLETED HISTORY ARCHIVE TABLE (RIWAYAT ACARA SELESAI) */}
          <Card className="border-border">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-serif text-lg flex items-center gap-2">
                    <Archive className="h-5 w-5 text-emerald-600" /> Tabel Riwayat Acara Selesai ({completedDeals.length} Acara)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Arsip histori seluruh acara (Pernikahan, Lamaran, Birthday, Gathering) yang telah sukses dilaksanakan beserta pencatatan pelunasan dan bukti kwitansi.
                  </CardDescription>
                </div>

                {/* ARCHIVE SEARCH BAR */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari client / event / paket..."
                    value={archiveSearchQuery}
                    onChange={(e) => setArchiveSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs bg-background"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 text-xs space-y-3">
              {filteredCompletedDeals.length === 0 ? (
                <div className="py-8 text-center space-y-1 border border-dashed rounded-lg">
                  <p className="font-semibold text-foreground">Belum Ada Riwayat Acara Selesai</p>
                  <p className="text-[11px] text-muted-foreground">
                    Klik tombol '🏁 Tandai Acara Selesai' pada papan deal untuk memindahkan acara yang sudah terlaksana ke arsip ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 flex flex-col">
                  {filteredCompletedDeals.map((deal, index) => {
                    const { list, totalPaid, dealAmount, remainingBalance, isFullyPaid } = getDealPaymentStats(deal);

                    return (
                      <div
                        key={deal.id}
                        className="p-3.5 rounded-lg border border-border bg-card hover:bg-accent/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <Badge variant="outline" className="h-5 rounded-full px-2 font-mono text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                              #{index + 1}
                            </Badge>
                            <p className="font-bold text-foreground text-sm">{deal.client_name}</p>
                            <Badge variant="secondary" className="text-[10px]">
                              {deal.event_type || "💍 Pernikahan"}
                            </Badge>
                            <Badge className="bg-emerald-600 text-white text-[10px]">Acara Selesai 🏁</Badge>
                            {isFullyPaid && (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-[10px]">
                                LUNAS 100% 🟢
                              </Badge>
                            )}

                            {/* EDIT DEAL BUTTON */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenEditDeal(deal)}
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                              title="Edit Info Deal & Tanggal"
                            >
                              <Edit className="h-3.5 w-3.5 text-amber-500" />
                            </Button>
                          </div>

                          <p className="text-[11px] text-muted-foreground">
                            Tanggal Acara: <span className="font-semibold text-foreground">{deal.wedding_date}</span> • Paket: <span className="font-semibold text-foreground">{deal.package_name}</span>
                          </p>
                          {deal.notes && <p className="text-[11px] text-muted-foreground italic line-clamp-1">{deal.notes}</p>}
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 shrink-0 border-t sm:border-t-0 border-border/60 pt-2 sm:pt-0">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Total Deal Lunas:</span>
                            <span className="font-mono font-bold text-emerald-600 text-sm">
                              Rp {dealAmount.toLocaleString("id-ID")}
                            </span>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActiveLedgerDeal(deal)}
                              className="h-8 text-xs gap-1 font-semibold border-border hover:bg-muted"
                            >
                              <CreditCard className="h-3.5 w-3.5 text-amber-500" /> Histori ({list.length}x)
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReceiptDeal(deal)}
                              className="h-8 text-xs gap-1 font-semibold border-border hover:bg-muted"
                            >
                              <Printer className="h-3.5 w-3.5 text-primary" /> Kwitansi PDF
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: FORM EDIT PROFIL USAHA MANDIRI & BROSUR R2 */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Edit Profil Usaha & Dokumen Pricelist R2</CardTitle>
              <CardDescription className="text-xs">
                Perbarui informasi kontak PIC, nama brand, wilayah operasional, dan brosur PDF R2 usaha Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="space-y-1 flex-1">
                    <label className="font-semibold">Nama Perusahaan / Brand *</label>
                    <Input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1 flex-1">
                    <label className="font-semibold">Kategori Layanan *</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Catering">🍱 Catering</SelectItem>
                        <SelectItem value="Venue">🏛️ Venue & Gedung</SelectItem>
                        <SelectItem value="Dekorasi">🌸 Dekorasi</SelectItem>
                        <SelectItem value="MUA & Busana">💄 MUA & Busana</SelectItem>
                        <SelectItem value="Dokumentasi">📷 Dokumentasi</SelectItem>
                        <SelectItem value="Entertainment">🎵 Entertainment</SelectItem>
                        <SelectItem value="Wedding Organizer">📋 Wedding Organizer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="space-y-1 flex-1">
                    <label className="font-semibold">Nama PIC / Penanggung Jawab *</label>
                    <Input
                      type="text"
                      value={picName}
                      onChange={(e) => setPicName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1 flex-1">
                    <label className="font-semibold">Nomor WhatsApp PIC *</label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* API Wilayah Indonesia */}
                <div className="space-y-1">
                  <label className="font-semibold">Wilayah Operasional Usaha *</label>
                  <IndonesiaRegionSelect
                    provinceName={province}
                    cityName={city}
                    onProvinceChange={setProvince}
                    onCityChange={setCity}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold">Deskripsi Usaha & Layanan</label>
                  <textarea
                    placeholder="Tuliskan keunggulan dan rincian usaha Anda..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="flex min-h-[90px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                {/* R2 Brosur Pricelist Upload */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <h4 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="h-4 w-4 text-blue-500" /> Unggah Brosur Pricelist PDF (Cloudflare R2)
                  </h4>
                  <div className="p-3 border border-border rounded-lg bg-card space-y-2">
                    {pricelistR2Key ? (
                      <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700">
                        <span className="font-semibold flex items-center gap-2 truncate min-w-0">
                          <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span className="truncate">{uploadedFileName || "Brosur Pricelist R2 Terunggah (Database)"}</span>
                        </span>

                        <div className="flex items-center space-x-1 shrink-0">
                          <Badge className="bg-emerald-600 text-white text-[9px] hidden sm:inline-flex">
                            Tersimpan di DB ✅
                          </Badge>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            asChild
                            className="h-7 text-[10px] gap-1 font-semibold border-border hover:bg-muted"
                          >
                            <a
                              href={`/api/storage/presign?key=${encodeURIComponent(pricelistR2Key)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Eye className="h-3 w-3 text-primary" /> Lihat
                            </a>
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPricelistR2Key("");
                              setUploadedFileName("");
                              toast({
                                title: "Pricelist Di-reset",
                                description: "Brosur lama dilepas dari draft. Silakan unggah berkas baru di bawah lalu simpan.",
                              });
                            }}
                            className="h-7 text-[10px] gap-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                          >
                            <Trash2 className="h-3 w-3 text-rose-600" /> Hapus
                          </Button>
                        </div>
                      </div>
                    ) : null}
                    <MediaUploaderDropzone
                      weddingId="public-vendor"
                      folder="contracts"
                      multiple={true}
                      onUploadSuccess={handleUploadSuccess}
                      onUploadError={(err) => {
                        toast({
                          title: "Gagal Mengunggah ke Cloudflare R2",
                          description: err,
                          variant: "destructive",
                        });
                      }}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {loading ? "Menyimpan Profil..." : "Simpan Perubahan Profil Usaha"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: VISIBILITAS & KONTAK PENGANTIN (HIGH PERFORMANCE BRIDE LEADS BOARD WITH NUMBERING, SEARCH & PAGINATION) */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <Card className="border-border flex-1">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Total Impresi Dilihat</p>
                  <div className="text-xl font-bold font-mono text-primary mt-0.5">142x</div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20">
                  <Eye className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border flex-1">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Total Impor Pengantin</p>
                  <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{INITIAL_BRIDE_LEADS.length} Total</div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                  <Users className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border flex-1">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Klik Kontak WA</p>
                  <div className="text-xl font-bold font-mono text-amber-500 mt-0.5">19x</div>
                </div>
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                  <MessageSquare className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-serif text-lg">Riwayat Impor & Pertanyaan Pengantin</CardTitle>
                  <CardDescription className="text-xs">
                    Daftar calon pengantin & client yang tertarik dan meng-impor paket penawaran usaha Anda.
                  </CardDescription>
                </div>

                {/* SEARCH INPUT BAR */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari pengantin / paket / kota..."
                    value={leadSearchQuery}
                    onChange={(e) => {
                      setLeadSearchQuery(e.target.value);
                      setLeadCurrentPage(1); // Reset to page 1 on search
                    }}
                    className="pl-8 h-8 text-xs bg-background"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-3 text-xs">
              {paginatedLeads.length === 0 ? (
                <div className="py-8 text-center space-y-1 border border-dashed rounded-lg">
                  <p className="font-semibold text-foreground">Tidak Ada Pertanyaan Sesuai Pencarian</p>
                  <p className="text-[11px] text-muted-foreground">Coba ubah kata kunci nama pengantin atau nama paket.</p>
                </div>
              ) : (
                <div className="space-y-2 flex flex-col">
                  {paginatedLeads.map((item, index) => {
                    const rowNumber = (leadCurrentPage - 1) * leadPageSize + index + 1;

                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border border-border bg-card hover:bg-accent/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          {/* NUMBERING BADGE */}
                          <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold bg-amber-500/10 text-amber-600 border-amber-500/30">
                            #{rowNumber}
                          </Badge>

                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="font-bold text-foreground text-xs leading-none">
                                {item.names}
                              </p>
                              <span className="text-[10px] text-amber-600 font-medium">
                                (Pernikahan: {item.weddingDate})
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">
                              Meng-impor <span className="font-semibold text-foreground">{item.packageName}</span> (Rp {Number(item.price).toLocaleString("id-ID")}) • {item.city}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <WAButton
                            phone={partner.sanitized_phone}
                            templateString={`Halo Kak ${item.names}, terima kasih telah memilih vendor {nama_vendor} di NikahYuk SaaS.`}
                            variables={{ nama_vendor: partner.company_name }}
                            label="💬 Sapa Pengantin di WA"
                            size="sm"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PAGINATION CONTROLS FOR BRIDE LEADS */}
              {filteredLeads.length > 0 && (
                <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                  <p className="text-muted-foreground text-[11px]">
                    Menampilkan <span className="font-semibold text-foreground">{(leadCurrentPage - 1) * leadPageSize + 1}</span> -{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(leadCurrentPage * leadPageSize, filteredLeads.length)}
                    </span>{" "}
                    dari <span className="font-semibold text-foreground">{filteredLeads.length}</span> Pertanyaan Pengantin
                  </p>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLeadCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={leadCurrentPage === 1}
                      className="h-7 text-xs gap-1"
                    >
                      <ChevronLeft className="h-3 w-3" /> Sebelumnya
                    </Button>

                    <span className="font-semibold text-foreground px-1 text-[11px]">
                      Halaman {leadCurrentPage} dari {totalLeadPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLeadCurrentPage((prev) => Math.min(prev + 1, totalLeadPages))}
                      disabled={leadCurrentPage === totalLeadPages}
                      className="h-7 text-xs gap-1"
                    >
                      Selanjutnya <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CREATE / EDIT PACKAGE MODAL WITH 1-CLICK FACILITY TEMPLATES */}
      <Dialog open={openPackageModal} onOpenChange={setOpenPackageModal}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSavePackage}>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {editingPackage ? "Edit Paket Penawaran" : "Tambah Paket Penawaran Baru"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Isi rincian fasilitas dan harga paket penawaran usaha Anda.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold">Nama Paket Penawaran *</label>
                <Input
                  type="text"
                  placeholder="e.g. Paket Intimate Bronze / Paket Sultan Gold"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  required
                />
              </div>

              <div className="flex space-x-2">
                <div className="space-y-1 flex-1">
                  <label className="font-semibold">Harga Paket (IDR) *</label>
                  <Input
                    type="number"
                    placeholder="e.g. 25000000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1 flex-1">
                  <label className="font-semibold">Kapasitas Pax (Optional)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 500"
                    value={capacityPax}
                    onChange={(e) => setCapacityPax(e.target.value)}
                  />
                </div>
              </div>

              {/* 1-CLICK FAST FACILITY TEMPLATE SELECTOR */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-primary" /> Templat Fasilitas 1-Klik:
                  </label>
                  <span className="text-[10px] text-muted-foreground">Klik untuk isi otomatis</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(FACILITY_TEMPLATES).map((tKey) => (
                    <Button
                      key={tKey}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => applyFacilityTemplate(tKey)}
                      className="h-6 text-[10px] border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400 font-semibold hover:bg-amber-500/10"
                    >
                      + {tKey}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Rincian Fasilitas / Include (1 per baris)</label>
                <textarea
                  placeholder="e.g.&#10;Catering 300 Pax Makanan Utama&#10;MUA Rias Sepasang Pengantin&#10;WO 4 Personel H-1 sd Hari H"
                  value={featuresString}
                  onChange={(e) => setFeaturesString(e.target.value)}
                  className="flex min-h-[90px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Deskripsi Tambahan / Catatan Paket</label>
                <textarea
                  placeholder="Catatan bonus atau syarat ketentuan paket..."
                  value={packageDesc}
                  onChange={(e) => setPackageDesc(e.target.value)}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenPackageModal(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                {loading ? "Menyimpan..." : "Simpan Paket"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CREATE / EDIT CLIENT DEAL MODAL (WITH TOP DYNAMIC EVENT TYPE SELECTOR & GENERALIZED LABELS) */}
      <Dialog open={openDealModal} onOpenChange={setOpenDealModal}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSaveDeal}>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {editingDeal ? "Edit Informasi Deal & Reschedule Tanggal" : "Tambah Order / Deal Client Baru"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {editingDeal
                  ? "Ubah jenis acara, tanggal acara (reschedule), nama paket, atau rincian nilai deal."
                  : "Catat data pengantin, perusahaan, atau client yang baru booking atau sedang dalam tahap penawaran."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              {/* FIELD 1: TOP EVENT TYPE SELECTOR */}
              <div className="space-y-1">
                <label className="font-semibold flex items-center gap-1.5 text-amber-600">
                  <Tag className="h-3.5 w-3.5" /> Kategori / Jenis Acara (Event Type) *
                </label>
                <Select value={dealEventType} onValueChange={setDealEventType}>
                  <SelectTrigger className="h-9 text-xs font-semibold">
                    <SelectValue placeholder="Pilih Jenis Acara" />
                  </SelectTrigger>
                  <SelectContent>
                    {DYNAMIC_EVENT_TYPES.map((eType) => (
                      <SelectItem key={eType} value={eType}>
                        {eType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* FIELD 2: GENERALIZED CLIENT / COUPLE / COMPANY NAME */}
              <div className="space-y-1">
                <label className="font-semibold">Nama Client / Pasangan / Perusahaan *</label>
                <Input
                  type="text"
                  placeholder="e.g. Budi & Siti / Maya Birthday / PT Jaya Abadi"
                  value={dealClientName}
                  onChange={(e) => setDealClientName(e.target.value)}
                  required
                />
              </div>

              {/* FIELD 3 & 4: GENERALIZED EVENT DATE & STAGE */}
              <div className="flex space-x-2">
                <div className="space-y-1 flex-1">
                  <label className="font-semibold flex items-center gap-1 text-primary">
                    <Calendar className="h-3.5 w-3.5" /> Tanggal Acara *
                  </label>
                  <Input
                    type="date"
                    value={dealWeddingDate}
                    onChange={(e) => setDealWeddingDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1 flex-1">
                  <label className="font-semibold">Tahap Deal Status</label>
                  <Select value={dealStage} onValueChange={setDealStage}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Pilih Tahap" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inquiry">🟡 Inquiry / Prospek Baru</SelectItem>
                      <SelectItem value="proposal">🔵 Proposal Sent</SelectItem>
                      <SelectItem value="deal">🟢 Deal DP Fix</SelectItem>
                      <SelectItem value="completed">⚪ Acara Selesai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* FIELD 5: PACKAGE NAME */}
              <div className="space-y-1">
                <label className="font-semibold">Paket Penawaran Terpilih</label>
                <Input
                  type="text"
                  placeholder="e.g. Paket Gold Catering 500 Pax"
                  value={dealPackageName}
                  onChange={(e) => setDealPackageName(e.target.value)}
                />
              </div>

              {/* FIELD 6 & 7: FINANCIAL AMOUNTS */}
              <div className="flex space-x-2">
                <div className="space-y-1 flex-1">
                  <label className="font-semibold">Total Nilai Deal (Rp)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 45000000"
                    value={dealAmount}
                    onChange={(e) => setDealAmount(e.target.value)}
                  />
                </div>

                {!editingDeal && (
                  <div className="space-y-1 flex-1">
                    <label className="font-semibold">Setoran DP Awal (Rp)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 15000000"
                      value={dealDownPayment}
                      onChange={(e) => setDealDownPayment(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* FIELD 8: NOTES */}
              <div className="space-y-1">
                <label className="font-semibold">Catatan Khusus / Status DP</label>
                <textarea
                  placeholder="e.g. DP 15 Jt Lunas via BCA, pelunasan H-7 acara."
                  value={dealNotes}
                  onChange={(e) => setDealNotes(e.target.value)}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenDealModal(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                {loading ? "Menyimpan..." : editingDeal ? "Simpan Perubahan Deal" : "Simpan Order Deal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MULTI-TERMIN PAYMENT LEDGER MODAL */}
      {activeLedgerDeal && (
        <Dialog open={Boolean(activeLedgerDeal)} onOpenChange={() => setActiveLedgerDeal(null)}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl flex items-center gap-2">
                <Receipt className="h-5 w-5 text-amber-500" /> Histori & Termin Pembayaran Client
              </DialogTitle>
              <DialogDescription className="text-xs">
                {activeLedgerDeal.client_name} • {activeLedgerDeal.event_type || "Pernikahan"} • Tanggal Acara: {activeLedgerDeal.wedding_date}
              </DialogDescription>
            </DialogHeader>

            {(() => {
              const { list, totalPaid, dealAmount, remainingBalance, isFullyPaid, progressPercent } = getDealPaymentStats(activeLedgerDeal);

              return (
                <div className="space-y-4 py-2 text-xs">
                  {/* BALANCE KPI BOX */}
                  <div className="bg-gradient-to-r from-amber-500/10 via-card to-card p-4 rounded-xl border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Kontrak Deal:</span>
                        <p className="font-mono font-bold text-foreground text-lg">
                          Rp {dealAmount.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Status Pelunasan:</span>
                        <div className="pt-0.5">
                          {isFullyPaid ? (
                            <Badge className="bg-emerald-600 text-white text-xs">LUNAS 100% 🟢</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30 text-xs">
                              Sisa Rp {remainingBalance.toLocaleString("id-ID")} 🟡
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span>Total Terbayar ({list.length} Termin): Rp {totalPaid.toLocaleString("id-ID")}</span>
                        <span className="font-bold text-emerald-600">{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* PAST PAYMENTS TABLE */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <History className="h-4 w-4 text-primary" /> Catatan Histori Pembayaran ({list.length}):
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setActiveLedgerDeal(null);
                          setReceiptDeal(activeLedgerDeal);
                        }}
                        className="h-6 text-[10px] text-primary hover:underline p-0 font-semibold"
                      >
                        📄 Cetak Kwitansi PDF
                      </Button>
                    </h4>

                    {list.length === 0 ? (
                      <div className="p-4 text-center border border-dashed rounded-lg text-muted-foreground">
                        Belum ada catatan termin pembayaran. Gunakan form di bawah untuk mencatat setoran pertama.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {list.map((p, pIdx) => (
                          <div key={p.id} className="p-3 rounded-lg border border-border bg-card flex items-center justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                                  #{pIdx + 1} {p.termin_label}
                                </Badge>
                                <span className="text-[11px] text-muted-foreground">
                                  {p.payment_date} • {p.payment_method}
                                </span>
                              </div>
                              {p.notes && <p className="text-[11px] text-foreground/80 italic">{p.notes}</p>}
                            </div>

                            <div className="flex items-center space-x-2 shrink-0">
                              <span className="font-mono font-bold text-emerald-600 text-sm">
                                Rp {Number(p.amount).toLocaleString("id-ID")}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeletePaymentRecord(activeLedgerDeal.id, p.id)}
                                className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-50"
                                title="Hapus catatan pembayaran ini"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ADD NEW TERMIN PAYMENT FORM */}
                  <form onSubmit={handleAddPaymentRecord} className="p-3.5 border border-border rounded-xl bg-muted/20 space-y-3 pt-3">
                    <h5 className="font-semibold text-foreground flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-amber-500" /> + Tambah Termin / Setoran Pembayaran Baru
                    </h5>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="space-y-1 flex-1">
                        <label className="font-semibold">Nominal Pembayaran (IDR) *</label>
                        <Input
                          type="number"
                          placeholder="e.g. 15000000"
                          value={newPayAmount}
                          onChange={(e) => setNewPayAmount(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-1 flex-1">
                        <label className="font-semibold">Tanggal Pembayaran *</label>
                        <Input
                          type="date"
                          value={newPayDate}
                          onChange={(e) => setNewPayDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="space-y-1 flex-1">
                        <label className="font-semibold">Label Termin</label>
                        <Select value={newPayTermin} onValueChange={setNewPayTermin}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Pilih Label Termin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DP 1 (Booking Fee)">DP 1 (Booking Fee)</SelectItem>
                            <SelectItem value="Termin 2 (Food Testing)">Termin 2 (Food Testing)</SelectItem>
                            <SelectItem value="Termin 3 (TM Technical Meeting)">Termin 3 (TM Meeting)</SelectItem>
                            <SelectItem value="Pelunasan (H-7 Acara)">Pelunasan (H-7 Acara)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1 flex-1">
                        <label className="font-semibold">Metode Pembayaran</label>
                        <Select value={newPayMethod} onValueChange={setNewPayMethod}>
                          <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Pilih Metode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Transfer BCA">Transfer BCA</SelectItem>
                            <SelectItem value="Transfer Mandiri">Transfer Mandiri</SelectItem>
                            <SelectItem value="Transfer BNI / BRI">Transfer BNI / BRI</SelectItem>
                            <SelectItem value="Cash / Tunai">Cash / Tunai</SelectItem>
                            <SelectItem value="QRIS / E-Wallet">QRIS / E-Wallet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold">Catatan Khusus / Bukti Bayar</label>
                      <Input
                        type="text"
                        placeholder="e.g. Transfer BCA a.n Budi • Bukti WA terlampir"
                        value={newPayNotes}
                        onChange={(e) => setNewPayNotes(e.target.value)}
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> {loading ? "Menyimpan..." : "Simpan Setoran Termin Baru"}
                    </Button>
                  </form>
                </div>
              );
            })()}

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setActiveLedgerDeal(null)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* PRINTABLE DIGITAL RECEIPT MODAL WITH DYNAMIC EVENT TYPES */}
      {receiptDeal && (
        <Dialog open={Boolean(receiptDeal)} onOpenChange={() => setReceiptDeal(null)}>
          <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
            <DialogHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
              <div>
                <DialogTitle className="font-serif text-xl flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-amber-500" /> Kwitansi Pembayaran Digital Resmi
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Struk kwitansi bukti pembayaran resmi NikahYuk Partner Ecosystem.
                </DialogDescription>
              </div>
              <Button
                onClick={() => window.print()}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs gap-1.5 font-semibold"
              >
                <Printer className="h-3.5 w-3.5" /> Cetak / Print PDF
              </Button>
            </DialogHeader>

            {(() => {
              const { list, totalPaid, dealAmount, remainingBalance, isFullyPaid } = getDealPaymentStats(receiptDeal);

              return (
                <div id="printable-receipt" className="p-6 bg-white text-slate-900 rounded-xl space-y-6 text-xs shadow-md border border-slate-200">
                  {/* RECEIPT BRAND HEADER */}
                  <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-amber-600">{partner.company_name}</h2>
                      <p className="text-[11px] text-slate-600">{partner.category} • {partner.city}, {partner.province}</p>
                      <p className="text-[11px] text-slate-600">PIC: {partner.pic_name} ({partner.phone})</p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-lg font-serif font-bold text-slate-800 uppercase tracking-widest block">KWITANSI RESMI</span>
                      <span className="text-[10px] font-mono text-slate-500 block">No: KW/{partner.id.substring(0, 5)}/{receiptDeal.id.substring(0, 5)}</span>
                      <span className="text-[11px] text-slate-600 block">Tanggal: {new Date().toLocaleDateString("id-ID")}</span>
                    </div>
                  </div>

                  {/* CLIENT & DYNAMIC EVENT DETAILS */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Telah Diterima Dari:</span>
                      <p className="font-bold text-slate-900 text-sm">{receiptDeal.client_name}</p>
                      <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                        Kategori: {receiptDeal.event_type || "Pernikahan (Wedding)"}
                      </p>
                      <p className="text-[11px] text-slate-600">Tanggal Acara: {receiptDeal.wedding_date}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Paket Penawaran:</span>
                      <p className="font-bold text-slate-900 text-sm">{receiptDeal.package_name}</p>
                      <p className="font-mono font-bold text-amber-700">Nilai Kontrak: Rp {dealAmount.toLocaleString("id-ID")}</p>
                    </div>
                  </div>

                  {/* PAYMENTS ITEMIZED TABLE */}
                  <div className="space-y-2">
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">Rincian Setoran Pembayaran Masuk:</span>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-300 bg-slate-100 text-[11px] text-slate-700">
                          <th className="py-2 px-3">No</th>
                          <th className="py-2 px-3">Tanggal</th>
                          <th className="py-2 px-3">Label Termin</th>
                          <th className="py-2 px-3">Metode</th>
                          <th className="py-2 px-3 text-right">Nominal (IDR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-[11px]">
                        {list.map((p, idx) => (
                          <tr key={p.id}>
                            <td className="py-2 px-3 font-mono">#{idx + 1}</td>
                            <td className="py-2 px-3">{p.payment_date}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900">{p.termin_label}</td>
                            <td className="py-2 px-3 text-slate-600">{p.payment_method}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                              Rp {Number(p.amount).toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* SUMMARY TOTALS */}
                  <div className="border-t border-slate-300 pt-3 flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Status Pelunasan Acara:</span>
                      {isFullyPaid ? (
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded border border-emerald-300">
                          LUNAS 100% ✅
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded border border-amber-300">
                          Sisa Pelunasan: Rp {remainingBalance.toLocaleString("id-ID")}
                        </span>
                      )}
                    </div>

                    <div className="text-right space-y-1 font-mono">
                      <div className="text-xs text-slate-600">Total Nilai Deal: Rp {dealAmount.toLocaleString("id-ID")}</div>
                      <div className="text-sm font-bold text-emerald-700">Total Diterima: Rp {totalPaid.toLocaleString("id-ID")}</div>
                    </div>
                  </div>

                  {/* SIGNATURE STAMP */}
                  <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-center text-[11px] text-slate-600">
                    <div>
                      <p>Penyelenggara / Client,</p>
                      <div className="h-12"></div>
                      <p className="font-bold underline">{receiptDeal.client_name}</p>
                    </div>

                    <div>
                      <p>Hormat Kami, {partner.company_name}</p>
                      <div className="h-12"></div>
                      <p className="font-bold underline">{partner.pic_name}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setReceiptDeal(null)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ELEGANT DELETE CONFIRMATION MODAL */}
      {deletingPackage && (
        <Dialog open={Boolean(deletingPackage)} onOpenChange={() => setDeletingPackage(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="font-serif text-lg text-rose-600 dark:text-rose-400">
                    Hapus Paket Penawaran?
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Tindakan ini tidak dapat dibatalkan. Paket akan dihapus secara permanen.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="p-3 bg-rose-500/5 rounded-lg border border-rose-500/20 text-xs space-y-1 my-1">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Paket yang akan dihapus:</span>
              <p className="font-bold text-foreground text-sm">{deletingPackage.package_name}</p>
              <p className="font-mono text-emerald-600 font-bold">
                Rp {Number(deletingPackage.price).toLocaleString("id-ID")}
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setDeletingPackage(null)}>
                Batal
              </Button>
              <Button
                size="sm"
                onClick={confirmDeletePackage}
                disabled={loading}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> {loading ? "Menghapus..." : "Ya, Hapus Paket Ini"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* LIVE PUBLIC PREVIEW MODAL INTEGRATED WITH REAL PUBLIC LANDING PAGE */}
      <Dialog open={openPreviewModal} onOpenChange={setOpenPreviewModal}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader className="pb-2 border-b border-border flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-600 text-white text-[10px]">Pratinjau Publik Live</Badge>
                <span className="text-xs font-mono text-muted-foreground truncate">{publicUrl}</span>
              </div>
              <DialogTitle className="font-serif text-xl pt-1">
                Tampilan Usaha Anda di Mata Calon Pengantin
              </DialogTitle>
            </div>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="text-xs gap-1.5 font-semibold"
            >
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 text-primary" /> Buka di Tab Baru
              </a>
            </Button>
          </DialogHeader>

          <Card className="border-border/80 shadow-md">
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-xl text-foreground">{companyName}</h3>
                    <Badge className="bg-emerald-600 text-white text-[9px]">Verified Partner ✅</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {city}, {province}
                  </p>
                </div>
                <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                  {category}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-muted/40 p-3 rounded-lg border border-border/60">
                {description || "Belum ada deskripsi usaha terlampir."}
              </p>

              <div className="space-y-2">
                <span className="font-semibold text-foreground text-xs block">Paket Penawaran Dipublikasikan ({packages.length}):</span>
                {packages.map((pkg) => (
                  <div key={pkg.id} className="p-3 rounded-lg border border-border bg-card flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-foreground">{pkg.package_name}</p>
                      {pkg.features_include && pkg.features_include.length > 0 && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          ✓ {pkg.features_include.join(" • ")}
                        </p>
                      )}
                    </div>
                    <span className="font-mono font-bold text-emerald-600 text-sm">
                      Rp {Number(pkg.price).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="font-medium text-foreground">PIC: {picName}</span>
                {pricelistR2Key && (
                  <a
                    href={`/api/storage/presign?key=${encodeURIComponent(pricelistR2Key)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <FileText className="h-3.5 w-3.5 text-primary" /> Unduh Brosur PDF R2
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      {/* DYNAMIC SCANNABLE & DOWNLOADABLE QR CODE MODAL */}
      <Dialog open={openQrModal} onOpenChange={setOpenQrModal}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl mx-auto flex items-center gap-2">
              <QrCode className="h-5 w-5 text-amber-500" /> QR Code Usaha Vendor
            </DialogTitle>
            <DialogDescription className="text-xs">
              Pindai QR Code ini menggunakan kamera HP untuk langsung membuka Landing Page publik vendor Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3">
            <div className="bg-white p-4 rounded-xl border border-border/80 inline-block shadow-sm">
              {/* Dynamic Scannable QR Code Image */}
              <img
                src={qrApiUrl}
                alt={`QR Code ${companyName}`}
                className="w-44 h-44 mx-auto object-contain rounded-md"
              />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-serif font-bold text-foreground">{companyName}</p>
              <p className="text-[11px] text-muted-foreground">{category} • {city}, {province}</p>
            </div>

            <div className="bg-muted/50 p-2.5 rounded-lg border border-border/60 max-w-xs mx-auto text-center space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Tautan Profil Publik:</span>
              <p className="text-[11px] text-foreground font-mono break-all leading-tight select-all">
                {publicUrl}
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-center flex-col sm:flex-row gap-2">
            <Button onClick={handleCopyVendorLink} variant="outline" size="sm" className="text-xs gap-1.5 font-semibold">
              <Copy className="h-3.5 w-3.5" /> Salin Link
            </Button>
            <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white text-xs gap-1.5 font-semibold">
              <a href={qrApiUrl} download={`QR-NikahYuk-${companyName}.png`} target="_blank" rel="noopener noreferrer">
                <Download className="h-3.5 w-3.5" /> Unduh Gambar QR
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
