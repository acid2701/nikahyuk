"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { rateVendorAction } from "@/actions/vendor-actions";
import { useToast } from "@/components/ui/use-toast";

interface VendorRatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: string;
  vendorName: string;
  weddingId: string;
  initialRating?: number;
  initialReviewNotes?: string;
  onSuccess?: () => void;
}

export function VendorRatingModal({
  open,
  onOpenChange,
  vendorId,
  vendorName,
  weddingId,
  initialRating = 5,
  initialReviewNotes = "",
  onSuccess,
}: VendorRatingModalProps) {
  const [rating, setRating] = React.useState<number>(initialRating || 5);
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  const [reviewNotes, setReviewNotes] = React.useState<string>(initialReviewNotes || "");
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setRating(initialRating || 5);
    setReviewNotes(initialReviewNotes || "");
  }, [initialRating, initialReviewNotes, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await rateVendorAction(vendorId, weddingId, rating, reviewNotes);
      toast({
        title: "Penilaian Berhasil Disimpan",
        description: `Rating ${rating} bintang untuk '${vendorName}' berhasil dicatat.`,
        variant: "success",
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast({
        title: "Gagal Menyimpan Penilaian",
        description: err instanceof Error ? err.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const activeStars = hoverRating !== null ? hoverRating : rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Evaluasi & Scorecard Vendor</DialogTitle>
            <DialogDescription className="text-xs">
              Berikan penilaian profesionalisme, kualitas layanan, dan hasil kerja dari <span className="font-semibold text-foreground">{vendorName}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Interactive Star Rating */}
            <div className="space-y-1.5 text-center bg-secondary/20 p-3 rounded-lg border border-border/60">
              <label className="text-xs font-semibold text-foreground block">
                Skor Kualitas Layanan (1-5 Bintang)
              </label>
              <div className="flex items-center justify-center space-x-1 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 focus:outline-hidden transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        star <= activeStars
                          ? "text-amber-500 fill-amber-500"
                          : "text-muted border-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-amber-600 font-medium block">
                {activeStars === 5
                  ? "Sangat Memuaskan & Sempurna ⭐⭐⭐⭐⭐"
                  : activeStars === 4
                  ? "Bagus & Profesional ⭐⭐⭐⭐"
                  : activeStars === 3
                  ? "Cukup Baik ⭐⭐⭐"
                  : activeStars === 2
                  ? "Kurang Memuaskan ⭐⭐"
                  : "Perlu Evaluasi Khusus ⭐"}
              </span>
            </div>

            {/* Review Notes Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Catatan Ulasan & Rekomendasi</label>
              <textarea
                placeholder="Tulis ulasan pengalaman bekerja sama dengan vendor ini..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Ulasan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
