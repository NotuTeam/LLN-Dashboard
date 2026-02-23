/** @format */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Search,
  Plus,
  X,
  Package,
  User,
  Minus,
  Trash2,
  Share2,
} from "lucide-react";
import Notification from "@/components/Notification";
import { useDebounce } from "@/hooks/useDebounce";

import dayjs from "dayjs";
import {
  useOrders,
  useOrderStats,
  useCreateOrder,
  useCancelOrder,
  useWhatsAppStatus,
} from "./hook";
import { useSales } from "../sales/hook";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  confirmed: "bg-green-100 text-green-700",
  queued: "bg-purple-100 text-purple-700",
  loading: "bg-orange-100 text-orange-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Sudah Bayar",
  confirmed: "Terkonfirmasi",
  queued: "Dalam Antrian",
  loading: "Sedang Dimuat",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

// Interface for order item (manual input - no product master)
interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  unit: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [show, setShow] = useState<"NONE" | "ADD" | "WHATSAPP" | "DETAIL">(
    "NONE",
  );
  const [formAction, setFormAction] = useState<any>({ sales_id: "" });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { product_name: "", quantity: 1, unit_price: 0, unit: "pcs" },
  ]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [whatsappLink, setWhatsappLink] = useState("");
  const [whatsappAutoSent, setWhatsappAutoSent] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);

  const {
    data: ordersData,
    isLoading,
    refetch,
  } = useOrders({
    search: debouncedSearch,
    status: statusFilter,
  });
  const { data: statsData } = useOrderStats();
  const { data: salesData } = useSales("");
  const { data: waStatusData } = useWhatsAppStatus();

  const { mutate: createOrder, isPending: createPending } = useCreateOrder();
  const { mutate: cancelOrder, isPending: cancelPending } = useCancelOrder();

  const orders = ordersData?.data || [];
  const stats = statsData?.data || {};
  const salesList = salesData?.data || [];
  const waStatus = waStatusData?.data || {};
  const isWhatsAppConnected = waStatus.logged_in || false;

  // Calculate total from items
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      return total + item.unit_price * item.quantity;
    }, 0);
  };

  // Add new item
  const addOrderItem = () => {
    setOrderItems([
      ...orderItems,
      { product_name: "", quantity: 1, unit_price: 0, unit: "pcs" },
    ]);
  };

  // Remove item
  const removeOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      const newItems = orderItems.filter((_, i) => i !== index);
      setOrderItems(newItems);
    }
  };

  // Update item
  const updateOrderItem = (
    index: number,
    field: "product_name" | "quantity" | "unit_price" | "unit",
    value: any,
  ) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const handleCreateOrder = async () => {
    try {
      // Validate
      if (!formAction.sales_id) {
        Notification("error", "Pilih sales terlebih dahulu");
        return;
      }

      // Filter valid items
      const validItems = orderItems.filter(
        (item) => item.product_name && item.quantity > 0 && item.unit_price > 0,
      );
      if (validItems.length === 0) {
        Notification(
          "error",
          "Tambahkan minimal 1 produk dengan nama, jumlah, dan harga",
        );
        return;
      }

      // Prepare data with items array
      const orderData = {
        sales_id: formAction.sales_id,
        items: validItems.map((item) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          unit: item.unit || "pcs",
        })),
      };

      createOrder(orderData, {
        onSuccess: (res: any) => {
          Notification("success", "Order berhasil dibuat");
          // Show WhatsApp link if available
          if (res?.data?.whatsapp_link) {
            setWhatsappLink(res.data.whatsapp_link);
            setSelectedOrder(res.data.order);
            setWhatsappAutoSent(res.data.whatsapp_auto_sent || false);
            setShow("WHATSAPP");
          } else {
            setShow("NONE");
          }
          setFormAction({ sales_id: "" });
          setOrderItems([
            { product_name: "", quantity: 1, unit_price: 0, unit: "pcs" },
          ]);
          refetch();
        },
        onError: () => {
          Notification("error", "Gagal membuat order");
        },
      });
    } catch (e) {
      Notification("error", "Server Error");
    }
  };

  const handleShareWhatsApp = (order: any) => {
    const clientUrl =
      process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3001";
    const invoiceUrl = `${clientUrl}/order/${order.invoice_token}`;
    const phone = order.sales?.phone?.replace(/\D/g, "");

    // Build product list
    let productList = "";
    if (order.items && order.items.length > 0) {
      productList = order.items
        .map(
          (item: any) =>
            `- ${item.product?.name}: ${item.quantity} ${item.product?.unit}`,
        )
        .join("\n");
    } else {
      productList = `- ${order.product?.name}: ${order.quantity} ${order.product?.unit}`;
    }

    const message = encodeURIComponent(
      `Halo ${order.sales?.name},\n\nInvoice order Anda telah dibuat:\n\nNo. Order: ${order.order_number}\nProduk:\n${productList}\nTotal: Rp ${order.total_price?.toLocaleString()}\n\nSilakan akses link berikut untuk melakukan pembayaran:\n${invoiceUrl}\n\nTerima kasih.`,
    );
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleCancelOrder = (id: string) => {
    if (confirm("Yakin ingin membatalkan order ini?")) {
      cancelOrder(id, {
        onSuccess: () => {
          Notification("success", "Order berhasil dibatalkan");
          refetch();
        },
        onError: () => {
          Notification("error", "Gagal membatalkan order");
        },
      });
    }
  };

  // Reset form when closing modal
  const handleCloseModal = () => {
    setShow("NONE");
    setFormAction({ sales_id: "" });
    setOrderItems([
      { product_name: "", quantity: 1, unit_price: 0, unit: "pcs" },
    ]);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            {/* WhatsApp Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                isWhatsAppConnected
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isWhatsAppConnected
                    ? "bg-green-500 animate-pulse"
                    : "bg-gray-400"
                }`}
              />
              {isWhatsAppConnected ? "WhatsApp Aktif" : "WhatsApp Tidak Aktif"}
            </div>
          </div>
          <p className="text-gray-600 mt-1">Kelola order pelanggan</p>
        </div>
        <button
          onClick={() => setShow("ADD")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Buat Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Menunggu Bayar</p>
          <p className="text-2xl font-bold text-yellow-600">
            {stats.pending || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Sudah Bayar</p>
          <p className="text-2xl font-bold text-blue-600">{stats.paid || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Terkonfirmasi</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.confirmed || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Dalam Antrian</p>
          <p className="text-2xl font-bold text-purple-600">
            {stats.queued || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Sedang Dimuat</p>
          <p className="text-2xl font-bold text-orange-600">
            {stats.loading || 0}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600">Selesai</p>
          <p className="text-2xl font-bold text-gray-600">
            {stats.completed || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Cari nomor order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-100 text-gray-900"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 text-gray-900"
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu Bayar</option>
            <option value="paid">Sudah Bayar</option>
            <option value="confirmed">Terkonfirmasi</option>
            <option value="queued">Dalam Antrian</option>
            <option value="loading">Sedang Dimuat</option>
            <option value="completed">Selesai</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="animate-pulse bg-gray-100 w-full min-h-[30dvh] rounded-xl"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">
                    Order
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">
                    Sales
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">
                    Produk
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">
                    Total
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-600">
                      Tidak ada data order
                    </td>
                  </tr>
                ) : (
                  orders.map((order: any) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-100 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-800">
                            {order.order_number}
                          </p>
                          <p className="text-sm text-gray-500">
                            {dayjs(order.created_at).format(
                              "DD MMM YYYY, HH:mm",
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-gray-800">
                              {order.sales?.name || "-"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.sales?.phone || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <div>
                            {order.items && order.items.length > 0 ? (
                              <>
                                <p className="text-gray-800">
                                  {order.items[0].product?.name || "-"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {order.items.length > 1 ? (
                                    <span className="text-primary-600">
                                      +{order.items.length - 1} produk lainnya
                                    </span>
                                  ) : (
                                    <span>
                                      {order.items[0].quantity}{" "}
                                      {order.items[0].product?.unit || "unit"}
                                    </span>
                                  )}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-gray-800">
                                  {order.product?.name || "-"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {order.quantity}{" "}
                                  {order.product?.unit || "unit"}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-800">
                          Rp {order.total_price?.toLocaleString()}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[order.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/orders/${order.id}`)}
                            className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Order Modal */}
      {show === "ADD" && (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Buat Order Baru
            </h2>

            {/* Sales Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formAction.sales_id || ""}
                onChange={(e) =>
                  setFormAction({ ...formAction, sales_id: e.target.value })
                }
              >
                <option value="">Pilih Sales</option>
                {salesList.map((sales: any) => (
                  <option key={sales.id} value={sales.id}>
                    {sales.name} - {sales.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Products Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Produk <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={addOrderItem}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Produk
                </button>
              </div>

              <div className="space-y-3">
                {orderItems.map((item, index) => {
                  const itemTotal = item.unit_price * item.quantity;

                  return (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-3 border border-gray-200"
                    >
                      <div className="space-y-3">
                        {/* Product Name */}
                        <input
                          type="text"
                          placeholder="Nama Produk"
                          value={item.product_name}
                          onChange={(e) =>
                            updateOrderItem(
                              index,
                              "product_name",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />

                        {/* Price and Unit */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">
                              Harga Satuan
                            </label>
                            <input
                              type="number"
                              placeholder="Harga"
                              value={item.unit_price || ""}
                              onChange={(e) =>
                                updateOrderItem(
                                  index,
                                  "unit_price",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">
                              Satuan
                            </label>
                            <select
                              value={item.unit}
                              onChange={(e) =>
                                updateOrderItem(index, "unit", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                            >
                              <option value="pcs">Pcs</option>
                              <option value="kg">Kg</option>
                              <option value="ton">Ton</option>
                              <option value="m3">M³</option>
                              <option value="liter">Liter</option>
                              <option value="meter">Meter</option>
                            </select>
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Jumlah:</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateOrderItem(
                                  index,
                                  "quantity",
                                  item.quantity - 1,
                                );
                              }
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateOrderItem(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1,
                              )
                            }
                            className="w-16 text-center py-1 border border-gray-300 rounded-lg text-sm"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateOrderItem(
                                index,
                                "quantity",
                                item.quantity + 1,
                              )
                            }
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300"
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          {/* Subtotal */}
                          <span className="text-sm font-medium text-gray-700 ml-auto">
                            Rp {itemTotal.toLocaleString()}
                          </span>

                          {/* Remove Button */}
                          {orderItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeOrderItem(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <div className="bg-primary-50 rounded-xl p-4 mb-6 border border-primary-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-primary-800">Total</span>
                <span className="text-xl font-bold text-primary-600">
                  Rp {calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateOrder}
                disabled={createPending}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {createPending ? "Menyimpan..." : "Buat Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Order Modal */}
      {show === "DETAIL" && selectedOrder && (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Detail Order</h2>
              <button
                onClick={() => setShow("NONE")}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Nomor Order</p>
                <p className="font-medium">{selectedOrder.order_number}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Sales</p>
                  <p className="font-medium">{selectedOrder.sales?.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.sales?.phone}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                      statusColors[selectedOrder.status]
                    }`}
                  >
                    {statusLabels[selectedOrder.status]}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Produk</p>
                <p className="font-medium">{selectedOrder.product?.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.quantity} {selectedOrder.product?.unit} x Rp{" "}
                  {selectedOrder.unit_price?.toLocaleString()}
                </p>
                <p className="text-lg font-bold mt-2">
                  Total: Rp {selectedOrder.total_price?.toLocaleString()}
                </p>
              </div>

              {selectedOrder.payment_proof && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">Bukti Pembayaran</p>
                  <img
                    src={selectedOrder.payment_proof.url}
                    alt="Bukti Pembayaran"
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              {selectedOrder.driver_name && (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">Data Driver</p>
                  <div className="space-y-1">
                    <p>
                      <span className="text-gray-600">Nama:</span>{" "}
                      {selectedOrder.driver_name}
                    </p>
                    <p>
                      <span className="text-gray-600">Telepon:</span>{" "}
                      {selectedOrder.driver_phone}
                    </p>
                    <p>
                      <span className="text-gray-600">No. Polisi:</span>{" "}
                      {selectedOrder.vehicle_plate}
                    </p>
                  </div>
                </div>
              )}

              {selectedOrder.queue_number && (
                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm text-purple-600">Nomor Antrian</p>
                  <p className="text-3xl font-bold text-purple-700">
                    {selectedOrder.queue_number}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShow("NONE")}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Tutup
              </button>
              {selectedOrder.status === "pending" && (
                <button
                  type="button"
                  onClick={() => {
                    handleShareWhatsApp(selectedOrder);
                    setShow("NONE");
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <Share2 className="w-4 h-4 inline mr-2" />
                  Kirim WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Link Modal */}
      {show === "WHATSAPP" && selectedOrder && (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
            {whatsappAutoSent ? (
              <>
                {/* Auto-sent via WhatsApp */}
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Invoice Terkirim!
                </h2>
                <p className="text-gray-600 mb-4">
                  Invoice untuk order{" "}
                  <span className="font-semibold">
                    {selectedOrder.order_number}
                  </span>{" "}
                  telah dikirim otomatis via WhatsApp ke{" "}
                  <span className="font-semibold">
                    {selectedOrder.sales?.name}
                  </span>
                </p>
              </>
            ) : (
              <>
                {/* Manual wa.me link */}
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Order Berhasil Dibuat!
                </h2>
                <p className="text-gray-600 mb-4">
                  Order{" "}
                  <span className="font-semibold">
                    {selectedOrder.order_number}
                  </span>{" "}
                  telah dibuat.
                </p>
              </>
            )}

            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
              <p className="text-sm text-gray-500 mb-2">Detail Order:</p>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Sales:</span>{" "}
                  {selectedOrder.sales?.name}
                </p>

                {/* Products List */}
                <div>
                  <p className="text-gray-500 mb-1">Produk:</p>
                  <div className="pl-2 space-y-1">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item: any, idx: number) => (
                        <p key={idx}>
                          • {item.product?.name} x {item.quantity}{" "}
                          {item.product?.unit}
                        </p>
                      ))
                    ) : (
                      <p>
                        • {selectedOrder.product?.name} x{" "}
                        {selectedOrder.quantity} {selectedOrder.product?.unit}
                      </p>
                    )}
                  </div>
                </div>

                <p className="pt-2 border-t border-gray-200">
                  <span className="text-gray-500">Total:</span>{" "}
                  <span className="font-bold text-primary-600">
                    Rp {selectedOrder.total_price?.toLocaleString()}
                  </span>
                </p>
              </div>
            </div>

            {whatsappAutoSent ? (
              // Already sent - just close button
              <button
                type="button"
                onClick={() => {
                  setShow("NONE");
                  setSelectedOrder(null);
                  setWhatsappLink("");
                  setWhatsappAutoSent(false);
                  setOrderItems([
                    {
                      product_name: "",
                      quantity: 1,
                      unit_price: 0,
                      unit: "pcs",
                    },
                  ]);
                  setFormAction({ sales_id: "" });
                }}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
              >
                Tutup
              </button>
            ) : (
              // Manual send - show wa.me link
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Klik tombol di bawah untuk membuka WhatsApp dan mengirim
                  invoice ke sales.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShow("NONE");
                      setSelectedOrder(null);
                      setWhatsappLink("");
                      setWhatsappAutoSent(false);
                      setOrderItems([
                        {
                          product_name: "",
                          quantity: 1,
                          unit_price: 0,
                          unit: "pcs",
                        },
                      ]);
                      setFormAction({ sales_id: "" });
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Nanti Saja
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.open(whatsappLink, "_blank");
                      setShow("NONE");
                      setSelectedOrder(null);
                      setWhatsappLink("");
                      setWhatsappAutoSent(false);
                      setOrderItems([
                        {
                          product_name: "",
                          quantity: 1,
                          unit_price: 0,
                          unit: "pcs",
                        },
                      ]);
                      setFormAction({ sales_id: "" });
                    }}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <Share2 className="w-4 h-4 inline mr-2" />
                    Buka WhatsApp
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
