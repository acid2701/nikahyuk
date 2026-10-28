"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crop, ZoomIn, ZoomOut, RotateCw, Check, X } from "lucide-react";

interface ImageCropModalProps {
  open: boolean;
  imageFile: File | null;
  onConfirmCrop: (croppedFile: File) => void;
  onCancel: () => void;
}

export function ImageCropModal({
  open,
  imageFile,
  onConfirmCrop,
  onCancel,
}: ImageCropModalProps) {
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState<number>(1);
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = React.useState<number | null>(null); // null = free, 1 = 1:1, 16/9 = 16:9, 4/3 = 4:3
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);

  // Load image object URL
  React.useEffect(() => {
    if (!imageFile) {
      setImageSrc(null);
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setImageSrc(url);
    setZoom(1);
    setPan({ x: 0, y: 0 });

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  // Touch and Mouse drag handling for image repositioning inside crop viewport
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }
  };

  // Perform canvas crop
  const handleApplyCrop = () => {
    if (!imageRef.current || !containerRef.current || !imageFile) return;

    const img = imageRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    // Natural dimensions vs displayed dimensions
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;

    // Crop box coordinates relative to natural image
    const cropX = Math.max(0, (containerRect.left - imgRect.left) * scaleX);
    const cropY = Math.max(0, (containerRect.top - imgRect.top) * scaleY);
    const cropWidth = Math.min(img.naturalWidth - cropX, containerRect.width * scaleX);
    const cropHeight = Math.min(img.naturalHeight - cropY, containerRect.height * scaleY);

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(cropWidth));
    canvas.height = Math.max(1, Math.round(cropHeight));
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // High quality canvas rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Export to File object matching target mime
    const mime = imageFile.type === "image/png" ? "image/png" : "image/jpeg";
    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], imageFile.name, {
        type: mime,
        lastModified: Date.now(),
      });
      onConfirmCrop(croppedFile);
    }, mime, 0.92);
  };

  if (!open || !imageFile || !imageSrc) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-lg w-[95vw] p-0 overflow-hidden rounded-3xl border-border bg-card">
        <DialogHeader className="p-4 sm:p-5 border-b border-border/80 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-[#ff385c]/10 text-[#ff385c] border border-[#ff385c]/20 flex items-center justify-center">
                <Crop className="h-4 w-4" />
              </div>
              <DialogTitle className="font-sans text-base sm:text-lg font-bold text-foreground">
                Sesuaikan & Potong Gambar
              </DialogTitle>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Geser posisi gambar dan atur rasio sebelum disimpan ke Cloudflare R2.
          </p>
        </DialogHeader>

        {/* Crop Viewport */}
        <div className="p-4 flex flex-col items-center justify-center bg-black/5 dark:bg-black/40">
          <div
            ref={containerRef}
            className="relative w-full max-w-[380px] h-[280px] sm:h-[320px] bg-black/80 rounded-2xl overflow-hidden border-2 border-[#ff385c] shadow-inner flex items-center justify-center select-none cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
              maxHeight: "340px",
            }}
          >
            {/* Rule of thirds grid lines */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10 opacity-30">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>

            {/* Draggable & Scalable Image */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop Preview"
              draggable={false}
              className="max-w-none transition-transform duration-75 will-change-transform select-none"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              }}
            />
          </div>

          {/* Aspect Ratio & Zoom Toolbar */}
          <div className="w-full max-w-[380px] mt-3 space-y-2.5">
            {/* Aspect Presets */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setAspectRatio(null)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                  aspectRatio === null
                    ? "bg-[#ff385c] text-white border-[#ff385c]"
                    : "border-border/80 text-muted-foreground hover:bg-muted"
                }`}
              >
                Bebas
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio(1)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                  aspectRatio === 1
                    ? "bg-[#ff385c] text-white border-[#ff385c]"
                    : "border-border/80 text-muted-foreground hover:bg-muted"
                }`}
              >
                1:1 (Persegi)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio(4 / 3)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                  aspectRatio === 4 / 3
                    ? "bg-[#ff385c] text-white border-[#ff385c]"
                    : "border-border/80 text-muted-foreground hover:bg-muted"
                }`}
              >
                4:3 (Standar)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio(16 / 9)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                  aspectRatio === 16 / 9
                    ? "bg-[#ff385c] text-white border-[#ff385c]"
                    : "border-border/80 text-muted-foreground hover:bg-muted"
                }`}
              >
                16:9 (Banner)
              </button>
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center gap-3 px-2 py-1 bg-background/80 rounded-full border border-border/70">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
                className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-[#ff385c]"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(1))))}
                className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                title="Reset Posisi"
                className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <RotateCw className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <DialogFooter className="p-4 border-t border-border/80 flex flex-row items-center justify-end gap-2 bg-background">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="rounded-full h-9 px-4 text-xs font-semibold border-border/80 hover:bg-muted"
          >
            <X className="h-3.5 w-3.5 mr-1" /> Batal
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleApplyCrop}
            className="rounded-full h-9 px-5 text-xs font-semibold bg-[#ff385c] hover:bg-[#e00b41] text-white shadow-xs"
          >
            <Check className="h-3.5 w-3.5 mr-1" /> Potong & Unggah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
