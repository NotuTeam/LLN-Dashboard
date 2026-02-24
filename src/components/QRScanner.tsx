"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, X, Loader2, Keyboard } from "lucide-react";

interface QRScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  isPending?: boolean;
}

export default function QRScanner({
  onScan,
  onClose,
  isPending,
}: QRScannerProps) {
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [manualCode, setManualCode] = useState("");
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  const scannerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isScanningRef = useRef(false);
  const mountedRef = useRef(true);

  // Force release all camera resources
  const releaseCamera = useCallback(() => {
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    // Also try to find and stop any video elements' streams
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
      }
    });
  }, []);

  // Cleanup function that safely stops the scanner
  const cleanupScanner = useCallback(() => {
    const scanner = scannerRef.current;

    // Immediately clear refs to prevent double cleanup
    scannerRef.current = null;
    isScanningRef.current = false;

    if (!scanner) {
      releaseCamera();
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const doCleanup = async () => {
        try {
          // First stop the scanner
          await scanner.stop().catch(() => {});
        } catch (e) {
          // Ignore
        }

        try {
          // Then clear
          await scanner.clear().catch(() => {});
        } catch (e) {
          // Ignore
        }

        // Force release camera resources
        releaseCamera();

        resolve();
      };

      doCleanup();
    });
  }, [releaseCamera]);

  // Stop scanner and then call callback
  const stopScannerAndCallback = useCallback(
    (callback?: () => void) => {
      cleanupScanner().then(() => {
        if (mountedRef.current && callback) {
          callback();
        }
      });
    },
    [cleanupScanner],
  );

  // Start the scanner
  const startScanner = useCallback(async () => {
    // Don't start if already have scanner, already scanned, or component unmounted
    if (scannerRef.current || hasScanned || !mountedRef.current) {
      return;
    }

    try {
      setIsStartingCamera(true);
      setError(null);

      // Dynamic import of html5-qrcode
      const { Html5Qrcode } = await import("html5-qrcode");

      // Check if component is still mounted after async import
      if (!mountedRef.current) {
        setIsStartingCamera(false);
        return;
      }

      // Check if container exists
      const container = document.getElementById("qr-reader");
      if (!container) {
        setIsStartingCamera(false);
        setError("Scanner container not found");
        return;
      }

      // Create scanner instance
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      // Start scanning
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          // On successful scan - only trigger once
          if (!hasScanned && mountedRef.current) {
            setHasScanned(true);
            // Stop scanner then call onScan
            stopScannerAndCallback(() => {
              if (mountedRef.current) {
                onScan(decodedText);
              }
            });
          }
        },
        () => {
          // On scan failure - ignore (this is called frequently while scanning)
        },
      );

      // Capture the stream for later cleanup
      const videoElement = document.querySelector(
        "#qr-reader video",
      ) as HTMLVideoElement;
      if (videoElement && videoElement.srcObject) {
        streamRef.current = videoElement.srcObject as MediaStream;
      }

      // Mark as scanning
      isScanningRef.current = true;

      if (mountedRef.current) {
        setIsStartingCamera(false);
      } else {
        // Component unmounted during startup, cleanup immediately
        cleanupScanner();
      }
    } catch (err: any) {
      console.error("Scanner start error:", err);
      if (mountedRef.current) {
        setError("Tidak dapat mengakses kamera. Gunakan input manual.");
        setMode("manual");
        setIsStartingCamera(false);
      }
      scannerRef.current = null;
      releaseCamera();
    }
  }, [hasScanned, onScan, stopScannerAndCallback, cleanupScanner, releaseCamera]);

  // Initialize and cleanup on mount/unmount
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      
      // Cleanup on unmount
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        isScanningRef.current = false;

        // Fire and forget cleanup
        try {
          scanner.stop().catch(() => {});
        } catch (e) {}
        try {
          scanner.clear().catch(() => {});
        } catch (e) {}
      }
      
      // Always release camera
      releaseCamera();
    };
  }, [releaseCamera]);

  // Start camera when mode is camera
  useEffect(() => {
    if (
      mode === "camera" &&
      !hasScanned &&
      !scannerRef.current &&
      mountedRef.current
    ) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        if (mountedRef.current) {
          startScanner();
        }
      }, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [mode, hasScanned, startScanner]);

  // Handle manual submit
  const handleManualSubmit = useCallback(() => {
    if (!manualCode.trim() || hasScanned) return;
    setHasScanned(true);
    onScan(manualCode.trim());
  }, [manualCode, hasScanned, onScan]);

  // Handle close button
  const handleClose = useCallback(() => {
    stopScannerAndCallback(onClose);
  }, [onClose, stopScannerAndCallback]);

  // Handle mode change
  const handleModeChange = useCallback(
    (newMode: "camera" | "manual") => {
      if (newMode === mode || hasScanned) return;

      if (newMode === "manual") {
        cleanupScanner();
      }
      setMode(newMode);
      setError(null);
    },
    [mode, hasScanned, cleanupScanner],
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Scan QR Code</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleModeChange("camera")}
            disabled={hasScanned}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mode === "camera"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500 hover:text-gray-700"
            } ${hasScanned ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Camera className="w-4 h-4 inline mr-1" />
            Kamera
          </button>
          <button
            onClick={() => handleModeChange("manual")}
            disabled={hasScanned}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mode === "manual"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500 hover:text-gray-700"
            } ${hasScanned ? "opacity-50 cursor-not-allowed" : ""}`}
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

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

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
                disabled={hasScanned}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !hasScanned) {
                    handleManualSubmit();
                  }
                }}
              />
              <button
                onClick={handleManualSubmit}
                disabled={!manualCode.trim() || isPending || hasScanned}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
              >
                {isPending || hasScanned ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                    {hasScanned ? " Memproses..." : " Mengirim..."}
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isStartingCamera && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl z-10">
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
