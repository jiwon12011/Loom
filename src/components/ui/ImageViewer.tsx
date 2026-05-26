"use client";

import { X } from "lucide-react";

interface ImageViewerProps {
  src: string;
  open: boolean;
  onClose: () => void;
}

export default function ImageViewer({ src, open, onClose }: ImageViewerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-14 right-4 p-2 text-white/80 z-10">
        <X size={24} strokeWidth={1.5} />
      </button>
      <img
        src={src}
        alt=""
        className="max-w-full max-h-[80vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
