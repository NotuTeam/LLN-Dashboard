/** @format */

"use client";

import { useState } from "react";

import { Search, Plus, Edit, Trash2, Phone, Mail } from "lucide-react";
import InputForm from "@/components/Form";
import Notification from "@/components/Notification";
import { Form } from "antd";
import { useDebounce } from "@/hooks/useDebounce";

import dayjs from "dayjs";
import { useSales, useCreateSales, useDeleteSales, useUpdateSales } from "./hook";

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [show, setShow] = useState<"NONE" | "ADD" | "UPDATE">("NONE");
  const [formAction, setFormAction] = useState<any>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSales, setSelectedSales] = useState<any>(null);

  const debouncedSearchName = useDebounce(searchTerm, 500);

  const [form] = Form.useForm();

  const { data = [], isLoading, refetch } = useSales(debouncedSearchName);
  const { mutate: createSales, isPending: createPending } = useCreateSales();
  const { mutate: updateSales, isPending: updatePending } = useUpdateSales();
  const { mutate: deleteSales, isPending: deletePending } = useDeleteSales();

  const handleAddSales = async () => {
    try {
      await form.validateFields();
      createSales(formAction, {
        onSuccess: () => {
          Notification("success", "Sales berhasil ditambahkan");
          setShow("NONE");
          form.resetFields();
          refetch();
        },
        onError: () => {
          Notification("error", "Gagal menambahkan sales");
        },
      });
    } catch (e) {
      Notification("error", "Server Error");
    }
  };

  const handleUpdateSales = async () => {
    try {
      await form.validateFields();
      updateSales(
        { id: formAction.id, data: formAction },
        {
          onSuccess: () => {
            Notification("success", "Sales berhasil diupdate");
            setShow("NONE");
            form.resetFields();
            refetch();
          },
          onError: () => {
            Notification("error", "Gagal mengupdate sales");
          },
        }
      );
    } catch (e) {
      Notification("error", "Server Error");
    }
  };

  const handleDeleteSales = async (id: string) => {
    deleteSales(id, {
      onSuccess: () => {
        Notification("success", "Sales berhasil dihapus");
        refetch();
        setShowDeleteModal(false);
        setSelectedSales(null);
      },
      onError: () => {
        Notification("error", "Gagal menghapus sales");
      },
    });
  };

  const salesList = data?.data || [];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales</h1>
          <p className="text-gray-600 mt-1">Kelola data sales representative</p>
        </div>
        <button
          onClick={() => setShow("ADD")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Sales
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Cari nama atau telepon sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-100 text-gray-900 placeholder:text-gray-600"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sales Table */}
      {isLoading ? (
        <div className="animate-pulse bg-gray-100 w-full min-h-[30dvh] rounded-xl"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Nama</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Kontak</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Alamat</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salesList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-600">
                      Tidak ada data sales
                    </td>
                  </tr>
                ) : (
                  salesList.map((sales: any) => (
                    <tr key={sales.id} className="hover:bg-gray-100 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {sales?.name?.[0]?.toUpperCase() || "S"}
                            </span>
                          </div>
                          <p className="font-medium text-gray-800">{sales.name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {sales.phone}
                          </div>
                          {sales.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4" />
                              {sales.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{sales.address || "-"}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            sales.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {sales.is_active ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setShow("UPDATE");
                              setFormAction(sales);
                              form.setFieldsValue(sales);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSales(sales);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
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

      {/* Add Sales Modal */}
      {show === "ADD" && (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Tambah Sales Baru</h2>
            <Form form={form} layout="vertical" requiredMark={false}>
              <InputForm
                type="text"
                name="name"
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="text"
                name="phone"
                label="Nomor Telepon"
                placeholder="Masukkan nomor telepon"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="text"
                name="email"
                label="Email"
                placeholder="Masukkan email (opsional)"
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="text"
                name="address"
                label="Alamat"
                placeholder="Masukkan alamat (opsional)"
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShow("NONE")}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSales()}
                  disabled={createPending}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                >
                  {createPending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* Update Sales Modal */}
      {show === "UPDATE" && (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Sales</h2>
            <Form form={form} layout="vertical" requiredMark={false}>
              <InputForm
                type="text"
                name="name"
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="text"
                name="phone"
                label="Nomor Telepon"
                placeholder="Masukkan nomor telepon"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="text"
                name="email"
                label="Email"
                placeholder="Masukkan email (opsional)"
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="text"
                name="address"
                label="Alamat"
                placeholder="Masukkan alamat (opsional)"
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShow("NONE")}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateSales()}
                  disabled={updatePending}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                >
                  {updatePending ? "Menyimpan..." : "Update"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Hapus Sales</h2>
            <p className="text-gray-600 mb-6">
              Yakin ingin menghapus sales "<span className="font-semibold">{selectedSales?.name}</span>"?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSales(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSales(selectedSales?.id)}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                {deletePending ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
