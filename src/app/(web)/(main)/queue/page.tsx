/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Scan, Play, User, Package, Clock, Truck, CheckCircle, FileText } from "lucide-react";
import Notification from "@/components/Notification";

import dayjs from "dayjs";
import { useQueue, useCurrentLoading, useScanBarcode, useCallNext, useFinishLoading } from "./hook";

export default function QueuePage() {
  const router = useRouter();
  const [barcode, setBarcode] = useState("");
  const [scanResult, setScanResult] = useState<any>(null);

  const { data: queueData, isLoading, refetch } = useQueue();
  const { data: currentData } = useCurrentLoading();
  const { mutate: scanBarcode, isPending: scanPending } = useScanBarcode();
  const { mutate: callNext, isPending: callPending } = useCallNext();
  const { mutate: finishLoading, isPending: finishPending } = useFinishLoading();

  const queue = queueData?.data || [];
  const currentOrder = currentData?.data?.order;
  const isLoadingNow = currentData?.data?.loading;

  const handleScan = () => {
    if (!barcode.trim()) {
      Notification("error", "Masukkan barcode");
      return;
    }

    scanBarcode(barcode, {
      onSuccess: (res: any) => {
        Notification("success", `Antrian #${res.data?.queue_number} berhasil dibuat`);
        setScanResult(res.data);
        setBarcode("");
        refetch();
      },
      onError: (err: any) => {
        Notification("error", err?.response?.data?.message || "Barcode tidak valid");
      },
    });
  };

  const handleCallNext = () => {
    callNext(undefined, {
      onSuccess: (res: any) => {
        Notification("success", `Memanggil antrian #${res.data?.order?.queue_number}`);
        refetch();
      },
      onError: (err: any) => {
        Notification("error", err?.response?.data?.message || "Gagal memanggil antrian");
      },
    });
  };

  const handleFinishLoading = () => {
    if (!currentOrder) return;

    finishLoading(currentOrder.id, {
      onSuccess: () => {
        Notification("success", `Pemuatan antrian #${currentOrder.queue_number} selesai`);
        // Redirect to delivery page to create delivery note
        router.push("/delivery");
      },
      onError: (err: any) => {
        Notification("error", err?.response?.data?.message || "Gagal menyelesaikan pemuatan");
      },
    });
  };

  // Filter queued and loading
  const queuedOrders = queue.filter((o: any) => o.status === "queued");
  const loadingOrders = queue.filter((o: any) => o.status === "loading");

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Antrian</h1>
          <p className="text-gray-600 mt-1">Kelola antrian pengambilan barang</p>
        </div>
      </div>

      {/* Current Loading & Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Current Loading */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Sedang Dimuat</p>
              <p className="text-sm text-gray-500">
                {isLoadingNow ? "Ada order sedang diproses" : "Tidak ada order sedang dimuat"}
              </p>
            </div>
          </div>

          {currentOrder ? (
            <div className="p-4 bg-orange-50 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-orange-600">
                  #{currentOrder.queue_number}
                </span>
                <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded-lg text-xs font-medium">
                  SEDANG DIMUAT
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span>{currentOrder.sales?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-gray-400" />
                <span>
                  {currentOrder.product?.name} - {currentOrder.quantity} {currentOrder.product?.unit}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span>
                  Driver: {currentOrder.driver_name} ({currentOrder.vehicle_plate})
                </span>
              </div>

              {/* Finish Loading Button */}
              <div className="pt-3 border-t border-orange-200">
                <button
                  onClick={handleFinishLoading}
                  disabled={finishPending}
                  className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                >
                  {finishPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyelesaikan...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Selesaikan Pemuatan
                    </>
                  )}
                </button>
                <p className="text-xs text-orange-600 text-center mt-2">
                  Klik tombol di atas setelah barang selesai dimuat untuk membuat surat jalan
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500">
              Tidak ada order sedang dimuat
            </div>
          )}
        </div>

        {/* Barcode Scanner */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <Scan className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Scan Barcode</p>
              <p className="text-sm text-gray-500">Masukkan barcode untuk membuat antrian</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Masukkan barcode..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-100"
            />
            <button
              onClick={handleScan}
              disabled={scanPending}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              {scanPending ? "Scanning..." : "Scan"}
            </button>
          </div>

          {scanResult && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-green-600">Antrian berhasil dibuat!</p>
              <p className="text-2xl font-bold text-green-700">#{scanResult.queue_number}</p>
              <p className="text-sm text-green-600">
                Estimasi: {scanResult.estimated_time}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Call Next Button */}
      {queuedOrders.length > 0 && !isLoadingNow && (
        <button
          onClick={handleCallNext}
          disabled={callPending}
          className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-lg font-medium"
        >
          <Play className="w-6 h-6" />
          {callPending ? "Memanggil..." : `Panggil Antrian Berikutnya (${queuedOrders.length} menunggu)`}
        </button>
      )}

      {/* Info: if loading in progress */}
      {isLoadingNow && queuedOrders.length > 0 && (
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            Selesaikan pemuatan order saat ini terlebih dahulu sebelum memanggil antrian berikutnya.
          </p>
        </div>
      )}

      {/* Queue List */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-medium text-gray-900">Daftar Antrian Menunggu</h2>
        </div>

        {isLoading ? (
          <div className="animate-pulse bg-gray-100 w-full min-h-[20dvh]"></div>
        ) : queuedOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Tidak ada antrian menunggu</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {queuedOrders.map((order: any) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold text-purple-600">#{order.queue_number}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.sales?.name}</p>
                      <p className="text-sm text-gray-500">{order.product?.name}</p>
                      <p className="text-sm text-gray-500">
                        Driver: {order.driver_name} - {order.vehicle_plate}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Est: {order.estimated_time}</span>
                    </div>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs">
                      Menunggu
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Link to Delivery */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <div>
            <p className="font-medium text-blue-800">Buat Surat Jalan</p>
            <p className="text-sm text-blue-600">Untuk order yang sudah selesai dimuat</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/delivery")}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          Lihat Delivery
        </button>
      </div>
    </div>
  );
}
