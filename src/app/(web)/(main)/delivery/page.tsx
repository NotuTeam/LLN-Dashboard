/** @format */

"use client";

import { useState } from "react";

import { FileText, Truck, User, Package, Share2, Eye } from "lucide-react";
import Notification from "@/components/Notification";

import dayjs from "dayjs";
import { useDeliveryNotes, useReadyOrders, useCreateDeliveryNote } from "./hook";

export default function DeliveryPage() {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [whatsappLink, setWhatsappLink] = useState("");

  const { data: notesData, isLoading: notesLoading } = useDeliveryNotes();
  const { data: readyData, isLoading: readyLoading } = useReadyOrders();
  const { mutate: createNote, isPending: createPending } = useCreateDeliveryNote();

  const notes = notesData?.data || [];
  const readyOrders = readyData?.data || [];

  const handleCreateNote = (orderId: string) => {
    createNote(orderId, {
      onSuccess: (res: any) => {
        Notification("success", "Surat jalan berhasil dibuat");
        // Show WhatsApp link if available
        if (res?.data?.whatsapp_link) {
          setWhatsappLink(res.data.whatsapp_link);
          setSelectedNote(res.data.delivery_note);
          setShowWhatsAppModal(true);
        }
      },
      onError: () => {
        Notification("error", "Gagal membuat surat jalan");
      },
    });
  };

  const handleShareWhatsApp = (note: any) => {
    const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3001";
    const deliveryUrl = `${clientUrl}/delivery/${note.token}`;
    const phone = note.sales_phone?.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Halo ${note.sales_name},\n\nSurat jalan untuk order Anda telah dibuat:\n\nNo. Surat Jalan: ${note.note_number}\nProduk: ${note.product_name}\nJumlah: ${note.product_qty} ${note.product_unit}\nDriver: ${note.driver_name}\nNo. Polisi: ${note.vehicle_plate}\n\nSilakan akses link berikut untuk melihat surat jalan:\n${deliveryUrl}\n\nTerima kasih.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Surat Jalan</h1>
          <p className="text-gray-600 mt-1">Buat dan kelola surat jalan pengiriman</p>
        </div>
      </div>

      {/* Ready Orders Section */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-orange-50">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-600" />
            <h2 className="font-medium text-gray-900">Siap Buat Surat Jalan</h2>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs">
              {readyOrders.length} order
            </span>
          </div>
        </div>

        {readyLoading ? (
          <div className="animate-pulse bg-gray-100 w-full min-h-[10dvh]"></div>
        ) : readyOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Tidak ada order siap untuk surat jalan</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {readyOrders.map((order: any) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">
                        #{order.queue_number}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.order_number}</p>
                      <p className="text-sm text-gray-500">{order.sales?.name}</p>
                      <p className="text-sm text-gray-500">
                        {order.product?.name} - {order.quantity} {order.product?.unit}
                      </p>
                      <p className="text-sm text-gray-500">
                        Driver: {order.driver_name} - {order.vehicle_plate}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCreateNote(order.id)}
                    disabled={createPending}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <FileText className="w-4 h-4 inline mr-1" />
                    Buat Surat Jalan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivery Notes History */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-medium text-gray-900">Riwayat Surat Jalan</h2>
        </div>

        {notesLoading ? (
          <div className="animate-pulse bg-gray-100 w-full min-h-[20dvh]"></div>
        ) : notes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Belum ada surat jalan</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">No. Surat Jalan</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Sales</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Produk</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Driver</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Tanggal</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {notes.map((note: any) => (
                  <tr key={note.id} className="hover:bg-gray-100 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900">{note.note_number}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-gray-900">{note.sales_name}</p>
                        <p className="text-sm text-gray-500">{note.sales_phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-900">{note.product_name}</p>
                      <p className="text-sm text-gray-500">
                        {note.product_qty} {note.product_unit}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-900">{note.driver_name}</p>
                      <p className="text-sm text-gray-500">{note.vehicle_plate}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {dayjs(note.created_at).format("DD MMM YYYY")}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedNote(note);
                            setShowDetailModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(note)}
                          className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Share2 className="w-4 h-4 text-green-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedNote && (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Surat Jalan</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-sm text-gray-500">Nomor Surat Jalan</p>
                <p className="text-2xl font-bold text-gray-900">{selectedNote.note_number}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Sales</p>
                  <p className="font-medium">{selectedNote.sales_name}</p>
                  <p className="text-sm text-gray-600">{selectedNote.sales_phone}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Driver</p>
                  <p className="font-medium">{selectedNote.driver_name}</p>
                  <p className="text-sm text-gray-600">{selectedNote.vehicle_plate}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Produk</p>
                <p className="font-medium">{selectedNote.product_name}</p>
                <p className="text-gray-600">
                  {selectedNote.product_qty} {selectedNote.product_unit}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Tanggal</p>
                <p className="font-medium">
                  {dayjs(selectedNote.created_at).format("DD MMMM YYYY, HH:mm")}
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
                onClick={() => handleShareWhatsApp(selectedNote)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Share2 className="w-4 h-4 inline mr-1" />
                Kirim WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Link Modal */}
      {showWhatsAppModal && selectedNote && (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Surat Jalan Berhasil Dibuat!</h2>
            <p className="text-gray-600 mb-4">
              Surat Jalan <span className="font-semibold">{selectedNote.note_number}</span> telah dibuat.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
              <p className="text-sm text-gray-500 mb-2">Detail:</p>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Sales:</span> {selectedNote.sales_name}</p>
                <p><span className="text-gray-500">Driver:</span> {selectedNote.driver_name}</p>
                <p><span className="text-gray-500">Produk:</span> {selectedNote.product_name}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Klik tombol di bawah untuk membuka WhatsApp dan mengirim surat jalan ke sales.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowWhatsAppModal(false);
                  setSelectedNote(null);
                  setWhatsappLink("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Nanti Saja
              </button>
              <button
                type="button"
                onClick={() => {
                  window.open(whatsappLink, "_blank");
                  setShowWhatsAppModal(false);
                  setSelectedNote(null);
                  setWhatsappLink("");
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Share2 className="w-4 h-4 inline mr-2" />
                Buka WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
