"use client";

import * as React from "react";

export interface CropState {
  zoom: number;
  pan: { x: number; y: number };
  aspectRatio: number | null;
  isDragging: boolean;
}

/**
 * Reusable hook managing image crop coordinate transformations, zooming, and pan mechanics.
 */
export function useImageCrop() {
  const [zoom, setZoom] = React.useState<number>(1);
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = React.useState<number | null>(null);
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const reset = React.useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
  }, []);

  const startDrag = React.useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - pan.x, y: clientY - pan.y });
  }, [pan]);

  const onDrag = React.useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPan({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const endDrag = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  const zoomIn = React.useCallback(() => {
    setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(1))));
  }, []);

  const zoomOut = React.useCallback(() => {
    setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))));
  }, []);

  return {
    zoom,
    setZoom,
    pan,
    setPan,
    aspectRatio,
    setAspectRatio,
    isDragging,
    startDrag,
    onDrag,
    endDrag,
    zoomIn,
    zoomOut,
    reset,
  };
}
