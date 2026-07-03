"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import { Loader2, CameraOff } from "lucide-react";

export function BarcodeScanner({ onDetected }: { onDetected: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let controls: IScannerControls | undefined;
    let cancelled = false;
    const reader = new BrowserMultiFormatReader();

    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current ?? undefined,
        (result) => {
          if (result && !cancelled) {
            onDetected(result.getText());
          }
        }
      )
      .then((c) => {
        controls = c;
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError("Camera access was denied or is unavailable.");
      });

    return () => {
      cancelled = true;
      controls?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        <CameraOff className="size-6" />
        {error}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg bg-black">
      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 text-white">
          <Loader2 className="size-6 animate-spin" />
        </div>
      )}
      <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
      <div className="pointer-events-none absolute inset-6 rounded-lg border-2 border-primary/70" />
    </div>
  );
}
