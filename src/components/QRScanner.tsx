"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X, Loader2, Keyboard } from "lucide-react";

interface QRScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  isPending?: boolean;
}

export default function QRScanner({ onScan, onClose, isPending }: QRScannerProps) {
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);
  const scannerRef = useRef<any>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (mode === "camera" && !isScanning && !hasScanned && mountedRef.current) {
      startScanner();
    }
  }, [mode]);

  const startScanner = async () => {
    const container = document.getElementById("qr-reader");
    if (!container || !mountedRef.current) return;

    try {
      setIsScanning(true);
      setError(null);

      const { Html5Qrcode } = await import("html5-qrcode");

      if (!mountedRef.current) {
        return;
      }

      scannerRef.current = new Html5Qrcode("qr-reader");

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          // On success - only trigger once
          if (!hasScanned && mountedRef.current) {
            setHasScanned(true);
            stopScanner();
            onScan(decodedText);
          }
        },
        () => {
          // On failure - ignore continuous failures
        }
      );
      
      if (mountedRef.current) {
        setIsScanning(false);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError("Tidak dapat mengakses kamera. Gunakan input manual.");
        setMode("manual");
        setIsScanning(false);
      }
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      } catch (e) {
        // Ignore errors when stopping
      }
    }
    setIsScanning(false);
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim() || hasScanned) return;
    setHasScanned(true);
    stopScanner();
    onScan(manualCode.trim());
  };

  const handleClose = () => {
    mountedRef.current = false;
    stopScanner();
    onClose();
  };

  const handleModeChange = (newMode: "camera" | "manual") => {
    if (newMode === mode) return;
    stopScanner();
    setMode(newMode);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Scan QR Code</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleModeChange("camera")}
            className={`flex-1 py-3 text-sm font-medium ${
              mode === "camera"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500"
            }`}
          >
            <Camera className="w-4 h-4 inline mr-1" />
            Kamera
          </button>
          <button
            onClick={() => handleModeChange("manual")}
            className={`flex-1 py-3 text-sm font-medium ${
              mode === "manual"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500"
            }`}
          >
            <Keyboard className="w-4 h-4 inline mr-1" />
            Manual
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {mode === "camera" ? (
            <div>
              {/* Scanner Container */}
              <div
                id="qr-reader"
                className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden"
              />

              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}

              <p className="text-xs text-gray-500 text-center mt-3">
                Arahkan kamera ke QR Code
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Masukkan kode secara manual:
              </p>
              <input
                type="text"
                placeholder="Masukkan kode..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleManualSubmit();
                  }
                }}
              />
              <button
                onClick={handleManualSubmit}
                disabled={!manualCode.trim() || isPending || hasScanned}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {isPending || hasScanned ? (
                  <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                ) : (
                  "Submit"
                )}
                {hasScanned ? " Memproses..." : " Submit"}
              </button>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {(isScanning) && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
              <p className="text-gray-600">Memulai kamera...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
