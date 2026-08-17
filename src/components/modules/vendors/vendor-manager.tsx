"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhoneInput } from "@/components/shared/whatsapp/phone-input";
import { WAButton } from "@/components/shared/whatsapp/wa-button";
import { MediaUploaderDropzone, UploadedFileMeta } from "@/components/shared/media-uploader/dropzone";
import {
  createVendorAction,
  addVendorDocumentAction,
  deleteVendorDocumentAction,
  deleteVendorAction,
} from "@/actions/vendor-actions";
import { useToast } from "@/components/ui/use-toast";
import { Briefcase, Plus, Trash2, FileText, Upload, UserCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface VendorDocumentItem {
  id: string;
  document_title: string;
  r2_file_key: string;
  file_size_bytes: number;
  mime_type: string;
  uploaded_at: string;
}

export interface VendorItem {
  id: string;
  vendor_name: string;
  category: string;
  pic_name?: string | null;
  sanitized_phone?: string | null;
  contract_value: number;
  vendor_documents?: VendorDocumentItem[];
}

export interface VendorManagerProps {
  weddingId: string;
  initialVendors: VendorItem[];
}

export function VendorManager({ weddingId, initialVendors }: VendorManagerProps) {
  const [vendors, setVendors] = React.useState<VendorItem[]>(initialVendors);
  const [openModal, setOpenModal] = React.useState(false);
  const [activeUploadVendorId, setActiveUploadVendorId] = React.useState<string | null>(null);

  const [vendorName, setVendorName] = React.useState("");
  const [category, setCategory] = React.useState("Catering");
  const [picName, setPicName] = React.useState("");
  const [contactNumber, setContactNumber] = React.useState("");
  const [contractValue, setContractValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    setVendors(initialVendors);
  }, [initialVendors]);

  async function handleCreateVendor(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await createVendorAction({
        weddingId,
        vendorName,
        category,
        picName,
        contactNumber,
        contractValue: Number(contractValue) || 0,
      });

      toast({
        title: "Vendor Berhasil Ditambahkan",
        description: `Vendor '${vendorName}' kategori ${category} tersimpan.`,
        variant: "success",
      });

      setOpenModal(false);
      setVendorName("");
      setPicName("");
      setContactNumber("");
      setContractValue("");
    } catch (err) {
      toast({
        title: "Gagal Menambahkan Vendor",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddDocumentSuccess(vendorId: string, meta: UploadedFileMeta) {
    try {
      await addVendorDocumentAction(vendorId, weddingId, {
        documentTitle: meta.file_name,
        r2FileKey: meta.r2_file_key,
        fileSizeBytes: meta.file_size_bytes,
        mimeType: meta.mime_type,
      });

      toast({
        title: "Dokumen Kontrak Disimpan",
        description: `Dokumen '${meta.file_name}' terikat pada vendor.`,
        variant: "success",
      });
      setActiveUploadVendorId(null);
    } catch (err) {
      toast({
        title: "Gagal Menyimpan Dokumen",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteDoc(docId: string, r2Key: string) {
    try {
      await deleteVendorDocumentAction(docId, r2Key, weddingId);
      toast({
        title: "Dokumen Dihapus",
        description: "Metadata & file fisik R2 berhasil dibersihkan.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Menghapus Dokumen",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteVendor(vendorId: string, name: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus vendor '${name}' beserta seluruh berkas fisiknya?`)) {
      return;
    }

    try {
      await deleteVendorAction(vendorId, weddingId);
      toast({
        title: "Vendor Dihapus",
        description: `Vendor '${name}' & seluruh dokumen fisiknya telah dihapus dari R2.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Menghapus Vendor",
        description: err instanceof Error ? err.message : "Internal error",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Vendor Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleCreateVendor}>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Tambah Mitra Vendor</DialogTitle>
                <DialogDescription>
                  Catat rincian vendor, nilai kontrak, & kontak PIC.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Nama Vendor</label>
                  <Input
                    type="text"
                    placeholder="e.g. Berkah Catering Utama"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Kategori Layanan</label>
                  <Input
                    type="text"
                    placeholder="e.g. Catering, Venue, MUA, Decor, Photo, Music"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nama PIC</label>
                    <Input
                      type="text"
                      placeholder="e.g. Ibu Rita"
                      value={picName}
                      onChange={(e) => setPicName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium">Nilai Kontrak (IDR)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 45000000"
                      value={contractValue}
                      onChange={(e) => setContractValue(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Nomor WhatsApp PIC</label>
                  <PhoneInput
                    value={contactNumber}
                    onChange={setContactNumber}
                    placeholder="081234567890"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenModal(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Vendor"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {vendors.length === 0 ? (
        <Card className="border-dashed p-8 text-center space-y-3">
          <Briefcase className="h-10 w-10 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Belum Ada Vendor Terdaftar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Klik tombol &apos;Tambah Vendor Baru&apos; untuk mencatat vendor pertama Anda.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {vendors.map((v) => {
            const docs = v.vendor_documents || [];
            return (
              <Card key={v.id} className="border-border/80 flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg font-serif">{v.vendor_name}</CardTitle>
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {v.category}
                        </Badge>
                      </div>
                      {v.pic_name && (
                        <CardDescription className="text-xs mt-0.5 flex items-center gap-1">
                          <UserCheck className="h-3 w-3" /> PIC: {v.pic_name}
                        </CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteVendor(v.id, v.vendor_name)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-xs border-y border-border/50 py-2">
                    <div>
                      <p className="text-muted-foreground">Nilai Kontrak</p>
                      <p className="font-mono font-bold text-foreground">
                        Rp {Number(v.contract_value || 0).toLocaleString("id-ID")}
                      </p>
                    </div>

                    {v.sanitized_phone && (
                      <WAButton
                        phone={v.sanitized_phone}
                        templateString="Halo {nama_vendor}, untuk koordinasi acara pernikahan."
                        variables={{ nama_vendor: v.vendor_name }}
                        label="Hubungi WA"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-foreground flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        Dokumen Kontrak ({docs.length}):
                      </h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setActiveUploadVendorId(
                            activeUploadVendorId === v.id ? null : v.id
                          )
                        }
                        className="h-6 text-[11px] px-2 gap-1 text-primary"
                      >
                        <Upload className="h-3 w-3" />
                        Unggah Kontrak
                      </Button>
                    </div>

                    {activeUploadVendorId === v.id && (
                      <div className="p-2 border border-border rounded-lg bg-card/60">
                        <MediaUploaderDropzone
                          weddingId={weddingId}
                          folder="contracts"
                          onUploadSuccess={(meta) => handleAddDocumentSuccess(v.id, meta)}
                        />
                      </div>
                    )}

                    {docs.length > 0 && (
                      <ul className="space-y-1">
                        {docs.map((d) => (
                          <li
                            key={d.id}
                            className="flex items-center justify-between text-xs p-2 rounded bg-muted/40 border border-border/40"
                          >
                            <span className="truncate max-w-[200px] font-medium text-foreground">
                              {d.document_title}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {(d.file_size_bytes / 1024).toFixed(0)} KB
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteDoc(d.id, d.r2_file_key)}
                                className="h-6 w-6 text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
