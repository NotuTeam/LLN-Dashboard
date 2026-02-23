/** @format */

"use client";

import { useState } from "react";

import { Check, X, Eye, User, Package } from "lucide-react";
import Notification from "@/components/Notification";

import dayjs from "dayjs";
import { usePendingPayments, useVerifyPayment, useRejectPayment } from "./hook";

export default function PaymentsPage() {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: paymentsData, isLoading, refetch } = usePendingPayments();
  const { mutate: verifyPayment, isPending: verifyPending } = useVerifyPayment();
  const { mutate: rejectPayment, isPending: rejectPending } = useRejectPayment();

  const payments = paymentsData?.data || [];

  const handleVerify = (id: string) => {
    verifyPayment(id, {
      onSuccess: () => {
        Notification("success", "Pembayaran berhasil diverifikasi");
        refetch();
      },
      onError: () => {
        Notification("error", "Gagal verifikasi pembayaran");
      },
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      Notification("error", "Harap isi alasan penolakan");
      return;
    }
    rejectPayment(
      { id: selectedOrder.id, reason: rejectReason },
      {
        onSuccess: () => {
          Notification("success", "Pembayaran ditolak");
          setShowRejectModal(false);
          setSelectedOrder(null);
          setRejectReason("");
          refetch();
        },
        onError: () => {
          Notification("error", "Gagal menolak pembayaran");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Verifikasi Pembayaran</h1>
          <p className="text-gray-600 mt-1">Verifikasi bukti pembayaran dari pelanggan</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            <p className="text-gray-600">Menunggu Verifikasi</p>
          </div>
        </div>
      </div>

      {/* Payments Grid */}
      {isLoading ? (
        <div className="animate-pulse bg-gray-100 w-full min-h-[30dvh] rounded-xl"></div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Tidak ada pembayaran yang menunggu verifikasi</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payments.map((order: any) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Payment Proof Image */}
              <div className="relative h-48 bg-gray-100">
                {order.payment_proof?.url ? (
                  <img
                    src={order.payment_proof.url}
                    alt="Bukti Pembayaran"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailModal(true);
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">
                    Menunggu Verifikasi
                  </span>
                </div>
              </div>

              {/* Order Info */}
              <div className="p-4 space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{order.order_number}</p>
                  <p className="text-sm text-gray-500">
                    Diupload: {dayjs(order.payment_uploaded_at).format("DD MMM YYYY, HH:mm")}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-900">{order.sales?.name}</p>
                    <p className="text-gray-500">{order.sales?.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-900">{order.product?.name}</p>
                    <p className="text-gray-500">
                      {order.quantity} {order.product?.unit}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-lg font-bold text-gray-900">
                    Rp {order.total_price?.toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailModal(true);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Eye className="w-4 h-4 inline mr-1" />
                    Detail
                  </button>
                  <button
                    onClick={() => handleVerify(order.id)}
                    disabled={verifyPending}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-4 h-4 inline mr-1" />
                    Verify
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Detail Pembayaran</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedOrder.payment_proof?.url && (
              <img
                src={selectedOrder.payment_proof.url}
                alt="Bukti Pembayaran"
                className="w-full rounded-xl mb-6"
              />
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Nomor Order</p>
                  <p className="font-medium">{selectedOrder.order_number}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-bold text-lg">
                    Rp {selectedOrder.total_price?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Sales</p>
                <p className="font-medium">{selectedOrder.sales?.name}</p>
                <p className="text-gray-600">{selectedOrder.sales?.phone}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Produk</p>
                <p className="font-medium">{selectedOrder.product?.name}</p>
                <p className="text-gray-600">
                  {selectedOrder.quantity} {selectedOrder.product?.unit}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  handleVerify(selectedOrder.id);
                  setShowDetailModal(false);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Check className="w-4 h-4 inline mr-1" />
                Verifikasi
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setShowRejectModal(true);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedOrder && (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Tolak Pembayaran
            </h2>
            <p className="text-gray-600 text-center mb-4">
              Order: {selectedOrder.order_number}
            </p>
            <textarea
              placeholder="Masukkan alasan penolakan..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-100"
              rows={3}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedOrder(null);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={rejectPending || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {rejectPending ? "Menolak..." : "Tolak Pembayaran"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
