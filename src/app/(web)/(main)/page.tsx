/** @format */

"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  BarChart3,
} from "lucide-react";
import AxiosClient from "@/lib/axios";
import dayjs from "dayjs";

// Dashboard stats interface
interface DashboardStats {
  orders: {
    total: number;
    pending: number;
    paid: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    today: number;
    revenue: number;
    todayRevenue: number;
  };
  sales: {
    total: number;
    active: number;
  };
  topSales: Array<{
    id: string;
    name: string;
    phone: string;
    order_count: number;
    total_revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    order_number: string;
    status: string;
    total_price: number;
    created_at: string;
    sales_name: string;
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await AxiosClient.get("/dashboard/stats");
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      paid: "bg-blue-100 text-blue-700",
      confirmed: "bg-green-100 text-green-700",
      queued: "bg-purple-100 text-purple-700",
      loading: "bg-orange-100 text-orange-700",
      completed: "bg-gray-100 text-gray-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Menunggu",
      paid: "Dibayar",
      confirmed: "Terkonfirmasi",
      queued: "Antrian",
      loading: "Dimuat",
      completed: "Selesai",
      cancelled: "Batal",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Ringkasan aktivitas bisnis hari ini
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Order</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.orders.total || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.orders.today || 0} order hari ini
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pendapatan</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.orders.revenue || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(stats?.orders.todayRevenue || 0)} hari ini
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Active Sales */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sales Aktif</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.sales.active || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                dari {stats?.sales.total || 0} total
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tingkat Selesai</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.orders.total
                  ? Math.round(
                      ((stats.orders.completed + stats.orders.cancelled) /
                        stats.orders.total) *
                        100
                    )
                  : 0}
                %
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.orders.completed || 0} selesai
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Cards */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Status Order
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Pending */}
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Menunggu</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats?.orders.pending || 0}
                </p>
              </div>
            </div>

            {/* Paid */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Dibayar</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats?.orders.paid || 0}
                </p>
              </div>
            </div>

            {/* Confirmed */}
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Terkonfirmasi</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats?.orders.confirmed || 0}
                </p>
              </div>
            </div>

            {/* Cancelled */}
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Dibatalkan</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats?.orders.cancelled || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Sales */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Sales
          </h2>
          {stats?.topSales && stats.topSales.length > 0 ? (
            <div className="space-y-3">
              {stats.topSales.slice(0, 5).map((sale, index) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{sale.name}</p>
                      <p className="text-xs text-gray-500">{sale.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {sale.order_count} order
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(sale.total_revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Belum ada data sales
            </p>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Order Terbaru
        </h2>
        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    No. Order
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Sales
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Total
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentOrders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">
                        {order.order_number}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-700">{order.sales_name}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(order.total_price)}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-500">
                        {dayjs(order.created_at).format("DD MMM HH:mm")}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            Belum ada order
          </p>
        )}
      </div>
    </div>
  );
}
