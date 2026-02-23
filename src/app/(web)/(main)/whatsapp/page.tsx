/** @format */

"use client";

import { useState } from "react";
import {
  MessageCircle,
  QrCode,
  CheckCircle,
  XCircle,
  RefreshCw,
  LogOut,
  Play,
  Power,
  Send,
  Smartphone,
} from "lucide-react";
import Notification from "@/components/Notification";
import {
  useWhatsAppStatus,
  useWhatsAppConnect,
  useWhatsAppDisconnect,
  useWhatsAppLogout,
  useWhatsAppRestart,
  useWhatsAppTest,
} from "./hook";

export default function WhatsAppPage() {
  const [testPhone, setTestPhone] = useState("");

  const { data, isLoading, isFetching } = useWhatsAppStatus();
  const connectMutation = useWhatsAppConnect();
  const disconnectMutation = useWhatsAppDisconnect();
  const logoutMutation = useWhatsAppLogout();
  const restartMutation = useWhatsAppRestart();
  const testMutation = useWhatsAppTest();

  const status = data?.data || {};
  const isConnected = status.connected || status.logged_in;
  const isLoggedIn = status.logged_in;

  const handleConnect = () => {
    connectMutation.mutate(undefined, {
      onSuccess: () => {
        Notification("success", "Menghubungkan ke WhatsApp...");
      },
      onError: () => {
        Notification("error", "Gagal menghubungkan");
      },
    });
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate(undefined, {
      onSuccess: () => {
        Notification("success", "Terputus dari WhatsApp");
      },
    });
  };

  const handleLogout = () => {
    if (confirm("Yakin ingin logout? Session akan dihapus.")) {
      logoutMutation.mutate(undefined, {
        onSuccess: () => {
          Notification("success", "Berhasil logout");
        },
      });
    }
  };

  const handleRestart = () => {
    restartMutation.mutate(undefined, {
      onSuccess: () => {
        Notification("success", "Memulai ulang...");
      },
    });
  };

  const handleTest = () => {
    if (!testPhone) {
      Notification("error", "Masukkan nomor telepon");
      return;
    }
    testMutation.mutate(testPhone, {
      onSuccess: () => {
        Notification("success", "Pesan test terkirim!");
        setTestPhone("");
      },
      onError: (err: any) => {
        Notification("error", err?.response?.data?.message || "Gagal mengirim pesan");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Gateway</h1>
          <p className="text-gray-600 mt-1">Kelola koneksi WhatsApp untuk notifikasi otomatis</p>
        </div>
        {isFetching && (
          <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Status */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-medium text-gray-900">Status Koneksi</h2>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className={`w-4 h-4 rounded-full ${
                isLoggedIn
                  ? "bg-green-500"
                  : isConnected
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            />
            <div>
              <p className="font-medium text-gray-900">
                {isLoggedIn
                  ? "Terhubung"
                  : isConnected
                  ? "Menghubungkan..."
                  : "Tidak Terhubung"}
              </p>
              <p className="text-sm text-gray-500">
                {isLoggedIn
                  ? "WhatsApp siap mengirim pesan"
                  : "Hubungkan untuk mengaktifkan notifikasi otomatis"}
              </p>
            </div>
          </div>

          {/* QR Code */}
          {!isLoggedIn && status.qr_code_image && (
            <div className="mb-6 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Scan QR Code dengan WhatsApp Anda:
              </p>
              <div className="inline-block p-4 bg-white border border-gray-200 rounded-xl">
                <img
                  src={status.qr_code_image}
                  alt="WhatsApp QR Code"
                  className="w-48 h-48"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Buka WhatsApp → Menu → Perangkat tertaut → Tautkan perangkat
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={connectMutation.isPending}
                className="flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                {connectMutation.isPending ? "Menghubungkan..." : "Hubungkan"}
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                disabled={disconnectMutation.isPending}
                className="flex items-center justify-center gap-2 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 disabled:opacity-50"
              >
                <Power className="w-4 h-4" />
                Putuskan
              </button>
            )}

            <button
              onClick={handleRestart}
              disabled={restartMutation.isPending}
              className="flex items-center justify-center gap-2 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${restartMutation.isPending ? "animate-spin" : ""}`} />
              Restart
            </button>
          </div>

          {/* Logout Button */}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="w-full mt-3 flex items-center justify-center gap-2 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {logoutMutation.isPending ? "Logging out..." : "Logout WhatsApp"}
            </button>
          )}
        </div>

        {/* Test Message */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <Send className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-medium text-gray-900">Kirim Pesan Test</h2>
          </div>

          {!isLoggedIn ? (
            <div className="text-center py-8 text-gray-500">
              <Smartphone className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>Hubungkan WhatsApp terlebih dahulu</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  placeholder="6281234567890"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: kode negara + nomor (tanpa + atau spasi)
                </p>
              </div>

              <button
                onClick={handleTest}
                disabled={!testPhone || testMutation.isPending}
                className="w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {testMutation.isPending ? "Mengirim..." : "Kirim Pesan Test"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Info */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-medium text-gray-900 mb-2">Status Detail</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Connected</p>
            <p className="font-medium">{status.connected ? "Ya" : "Tidak"}</p>
          </div>
          <div>
            <p className="text-gray-500">Logged In</p>
            <p className="font-medium">{status.logged_in ? "Ya" : "Tidak"}</p>
          </div>
          <div>
            <p className="text-gray-500">QR Code</p>
            <p className="font-medium">{status.qr_code ? "Tersedia" : "-"}</p>
          </div>
          <div>
            <p className="text-gray-500">Message</p>
            <p className="font-medium">{status.message || status.last_error || "-"}</p>
          </div>
        </div>
        
        {/* Show error if exists */}
        {status.last_error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <strong>Error:</strong> {status.last_error}
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <h3 className="font-medium text-blue-800 mb-2">Cara Penggunaan</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Klik tombol "Hubungkan" untuk memulai koneksi</li>
          <li>QR Code akan muncul - scan dengan WhatsApp Anda</li>
          <li>Buka WhatsApp → Menu → Perangkat tertaut → Tautkan perangkat</li>
          <li>Setelah terhubung, notifikasi akan otomatis terkirim via WhatsApp</li>
          <li>Jika wa.me link yang digunakan, klik link akan membuka WhatsApp dengan pesan template</li>
        </ol>
      </div>
    </div>
  );
}
