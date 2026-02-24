/** @format */

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  User,
  Phone,
  Car,
  QrCode,
  Play,
  CheckCircle,
  FileText,
  Share2,
  X,
  Clock,
  AlertCircle,
} from "lucide-react";
import Notification from "@/components/Notification";
import QRScanner from "@/components/QRScanner";
import dayjs from "dayjs";
import AxiosClient from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: {
    label: "Menunggu Pembayaran",
    color: "bg-yellow-100 text-yellow-700",
  },
  paid: { label: "Menunggu Verifikasi", color: "bg-blue-100 text-blue-700" },
  confirmed: { label: "Terkonfirmasi", color: "bg-green-100 text-green-700" },
  queued: { label: "Dalam Antrian", color: "bg-purple-100 text-purple-700" },
  loading: { label: "Sedang Dimuat", color: "bg-orange-100 text-orange-700" },
  completed: { label: "Selesai", color: "bg-gray-100 text-gray-700" },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-700" },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const [showScanModal, setShowScanModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Fetch order detail
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await AxiosClient.get(`/orders/${id}`);
      return response.data;
    },
  });

  const order = data?.data;
  const status = order ? statusConfig[order.status] : null;

  // Verify payment mutation
  const verifyPayment = useMutation({
    mutationFn: async () => {
      const response = await AxiosClient.post(`/payments/${id}/verify`);
      return response.data;
    },
    onSuccess: () => {
      Notification("success", "Pembayaran diverifikasi");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  // Reject payment mutation
  const rejectPayment = useMutation({
    mutationFn: async (reason: string) => {
      const response = await AxiosClient.post(`/payments/${id}/reject`, {
        reason,
      });
      return response.data;
    },
    onSuccess: () => {
      Notification("success", "Pembayaran ditolak");
      setShowRejectModal(false);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  // Scan barcode mutation
  const scanBarcode = useMutation({
    mutationFn: async (barcode: string) => {
      const response = await AxiosClient.post("/queue/scan", { barcode });
      return response.data;
    },
    onSuccess: () => {
      Notification("success", "Barcode berhasil di-scan");
      // Delay closing modal to ensure camera is stopped
      setTimeout(() => {
        setShowScanModal(false);
      }, 100);
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      refetch();
    },
    onError: (err: any) => {
      Notification(
        "error",
        err?.response?.data?.message || "Gagal scan barcode",
      );
      // Don't close modal on error - let user retry
    },
  });

  // Call next mutation
  const callNext = useMutation({
    mutationFn: async () => {
      const response = await AxiosClient.post("/queue/call-next");
      return response.data;
    },
    onSuccess: () => {
      Notification("success", "Antrian dipanggil");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      refetch();
    },
    onError: (err: any) => {
      Notification(
        "error",
        err?.response?.data?.message || "Gagal memanggil antrian",
      );
    },
  });

  // Finish loading mutation
  const finishLoading = useMutation({
    mutationFn: async () => {
      const response = await AxiosClient.post(`/orders/${id}/finish-loading`);
      return response.data;
    },
    onSuccess: () => {
      Notification("success", "Pemuatan selesai");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      queryClient.invalidateQueries({ queryKey: ["delivery"] });
      refetch();
    },
  });

  // Create delivery note mutation
  const createDeliveryNote = useMutation({
    mutationFn: async () => {
      const response = await AxiosClient.post("/delivery", { order_id: id });
      return response.data;
    },
    onSuccess: (res: any) => {
      Notification("success", "Surat jalan berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["delivery"] });
      refetch();
    },
  });

  // Cancel order mutation
  const cancelOrder = useMutation({
    mutationFn: async () => {
      const response = await AxiosClient.delete(`/orders/${id}`);
      return response.data;
    },
    onSuccess: () => {
      Notification("success", "Order dibatalkan");
      router.push("/orders");
    },
  });

  // Share to WhatsApp
  const handleShareWhatsApp = () => {
    if (!order) return;
    const clientUrl =
      process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3001";
    const invoiceUrl = `${clientUrl}/order/${order.invoice_token}`;
    const phone = order.sales?.phone?.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Halo ${order.sales?.name},\n\nInvoice order Anda telah dibuat:\n\nNo. Order: ${order.order_number}\nProduk: ${order.product?.name}\nJumlah: ${order.quantity} ${order.product?.unit}\nTotal: Rp ${order.total_price?.toLocaleString()}\n\nSilakan akses link berikut:\n${invoiceUrl}\n\nTerima kasih.`,
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  // Get available actions based on status
  const getAvailableActions = () => {
    if (!order) return [];

    const actions = [];

    switch (order.status) {
      case "pending":
        actions.push({
          label: "Kirim Invoice",
          icon: Share2,
          action: handleShareWhatsApp,
          color: "bg-green-600",
        });
        actions.push({
          label: "Batalkan",
          icon: X,
          action: () => cancelOrder.mutate(),
          color: "bg-white border-red-600 border !text-red-600",
        });
        break;
      case "paid":
        actions.push({
          label: "Verifikasi",
          icon: CheckCircle,
          action: () => verifyPayment.mutate(),
          color: "bg-green-600",
        });
        actions.push({
          label: "Tolak",
          icon: X,
          action: () => setShowRejectModal(true),
          color: "bg-white border-red-600 border !text-red-600",
        });
        break;
      case "confirmed":
        if (!order.queue_number) {
          actions.push({
            label: "Scan Barcode",
            icon: QrCode,
            action: () => setShowScanModal(true),
            color: "bg-primary-600",
          });
        }
        actions.push({
          label: "Kirim Invoice",
          icon: Share2,
          action: handleShareWhatsApp,
          color: "bg-green-600",
        });
        break;
      case "queued":
        actions.push({
          label: "Panggil",
          icon: Play,
          action: () => callNext.mutate(),
          color: "bg-green-600",
        });
        break;
      case "loading":
        if (order.loading_finished_at) {
          actions.push({
            label: "Buat Surat Jalan",
            icon: FileText,
            action: () => createDeliveryNote.mutate(),
            color: "bg-primary-600",
          });
        } else {
          actions.push({
            label: "Selesaikan Pemuatan",
            icon: CheckCircle,
            action: () => finishLoading.mutate(),
            color: "bg-green-600",
          });
        }
        break;
      case "completed":
        actions.push({
          label: "Lihat Surat Jalan",
          icon: FileText,
          action: () => router.push("/delivery"),
          color: "bg-primary-600",
        });
        actions.push({
          label: "Kirim ke WhatsApp",
          icon: Share2,
          action: handleShareWhatsApp,
          color: "bg-green-600",
        });
        break;
    }

    return actions;
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

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Order tidak ditemukan</p>
      </div>
    );
  }

  const actions = getAvailableActions();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {order.order_number}
            </h1>
            <p className="text-gray-500">
              {dayjs(order.created_at).format("DD MMMM YYYY, HH:mm")}
            </p>
          </div>
        </div>
        {status && (
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${status.color}`}
          >
            {status.label}
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sales Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-primary-600 mb-4 font-semibold">
              Informasi Sales
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-medium">{order.sales?.name}</p>
                <p className="text-sm text-gray-500">{order.sales?.phone}</p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 gap-5 flex flex-col">
            <h2 className="font-semibold text-primary-600">Informasi Produk</h2>
            {order?.items?.map((item: any) => (
              <div
                key={item?.product?.product_id}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item?.product_name}</p>
                  <p className="text-sm text-gray-500">
                    x {item.quantity} {item.product?.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-500 text-sm">
                    Rp {item?.product?.price?.toLocaleString()}
                  </p>
                  <p className="font-medium text-primary-600">
                    Rp {item.subtotal?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex-1">
                <p className="font-bold text-primary-600">Total</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-600">
                  Rp {order.total_price?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Driver Info */}
          {order.driver_name && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-primary-600 mb-4">
                Informasi Driver
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nama</p>
                  <p className="font-medium">{order.driver_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telepon</p>
                  <p className="font-medium">{order.driver_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">No. Polisi</p>
                  <p className="font-medium">{order.vehicle_plate}</p>
                </div>
              </div>
              {order?.vehicle_photo?.url && (
                <div className="mt-5">
                  <img
                    src={order?.vehicle_photo?.url}
                    alt="Bukti Pembayaran"
                    className="max-w-md rounded-lg"
                  />
                </div>
              )}
            </div>
          )}

          {/* Payment Proof */}
          {order.payment_proof && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-primary-600 mb-4">
                Bukti Pembayaran
              </h2>
              <img
                src={order.payment_proof.url}
                alt="Bukti Pembayaran"
                className="max-w-md rounded-lg"
              />
              {order.payment_uploaded_at && (
                <p className="text-sm text-gray-500 mt-2">
                  Upload:{" "}
                  {dayjs(order.payment_uploaded_at).format(
                    "DD MMM YYYY, HH:mm",
                  )}
                </p>
              )}
            </div>
          )}

          {/* Queue Info */}
          {order.queue_number && (
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Nomor Antrian</p>
                  <p className="text-4xl font-bold text-green-700">
                    #{order.queue_number}
                  </p>
                </div>
                {order.estimated_time && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Clock className="w-5 h-5" />
                    <span>Est: {order.estimated_time}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery Note Info */}
          {order.delivery_note_number && (
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h2 className="font-semibold text-green-700 mb-4">Surat Jalan</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-green-600">No. Surat Jalan</span>
                  <span className="font-bold text-green-700 text-lg">
                    {order.delivery_note_number}
                  </span>
                </div>
                {order.delivery_note_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-green-600">Diterbitkan</span>
                    <span className="text-green-700">
                      {dayjs(order.delivery_note_at).format(
                        "DD MMM YYYY, HH:mm",
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-medium text-gray-900 mb-4">Aksi</h2>
            <div className="space-y-3">
              {actions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.action}
                  disabled={action.label === "Panggil" && callNext.isPending}
                  className={`w-full py-3 ${action.color} text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  <action.icon className="w-5 h-5" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-medium text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Order Dibuat</p>
                  <p className="text-xs text-gray-500">
                    {dayjs(order.created_at).format("DD MMM, HH:mm")}
                  </p>
                </div>
              </div>
              {order.payment_uploaded_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Bukti Bayar Diupload</p>
                    <p className="text-xs text-gray-500">
                      {dayjs(order.payment_uploaded_at).format("DD MMM, HH:mm")}
                    </p>
                  </div>
                </div>
              )}
              {order.payment_verified_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">
                      Pembayaran Diverifikasi
                    </p>
                    <p className="text-xs text-gray-500">
                      {dayjs(order.payment_verified_at).format("DD MMM, HH:mm")}
                    </p>
                  </div>
                </div>
              )}
              {order.driver_filled_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Data Driver Diisi</p>
                    <p className="text-xs text-gray-500">
                      {dayjs(order.driver_filled_at).format("DD MMM, HH:mm")}
                    </p>
                  </div>
                </div>
              )}
              {order.queue_entered_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">
                      Masuk Antrian #{order.queue_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      {dayjs(order.queue_entered_at).format("DD MMM, HH:mm")}
                    </p>
                  </div>
                </div>
              )}
              {order.loading_started_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Mulai Dimuat</p>
                    <p className="text-xs text-gray-500">
                      {dayjs(order.loading_started_at).format("DD MMM, HH:mm")}
                    </p>
                  </div>
                </div>
              )}
              {order.loading_finished_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Selesai Dimuat</p>
                    <p className="text-xs text-gray-500">
                      {dayjs(order.loading_finished_at).format("DD MMM, HH:mm")}
                    </p>
                  </div>
                </div>
              )}
              {order.completed_at && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Order Selesai</p>
                    <p className="text-xs text-gray-500">
                      {dayjs(order.completed_at).format("DD MMM, HH:mm")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scan Modal */}
      {showScanModal && (
        <QRScanner
          onScan={(code) => {
            scanBarcode.mutate(code);
          }}
          onClose={() => {
            setShowScanModal(false);
          }}
          isPending={scanBarcode.isPending}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Tolak Pembayaran</h2>
            <textarea
              placeholder="Alasan penolakan..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 h-24"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="flex-1 py-3 border border-gray-300 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => rejectPayment.mutate(rejectReason)}
                disabled={!rejectReason || rejectPayment.isPending}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl disabled:opacity-50"
              >
                {rejectPayment.isPending ? "Menolak..." : "Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
