/** @format */

"use client";

import { useState } from "react";
import Image from "next/image";

import { Search, Plus, Edit, Trash2, Package, DollarSign, Archive } from "lucide-react";
import InputForm from "@/components/Form";
import Notification from "@/components/Notification";
import { Form } from "antd";
import { useDebounce } from "@/hooks/useDebounce";

import dayjs from "dayjs";
import { useProducts, useCreateProduct, useDeleteProduct, useUpdateProduct } from "./hook";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [show, setShow] = useState<"NONE" | "ADD" | "UPDATE">("NONE");
  const [formAction, setFormAction] = useState<any>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const debouncedSearchName = useDebounce(searchTerm, 500);

  const [form] = Form.useForm();

  const { data = [], isLoading, refetch } = useProducts(debouncedSearchName);
  const { mutate: createProduct, isPending: createPending } = useCreateProduct();
  const { mutate: updateProduct, isPending: updatePending } = useUpdateProduct();
  const { mutate: deleteProduct, isPending: deletePending } = useDeleteProduct();

  const products = data?.data || [];

  const handleAddProduct = async () => {
    try {
      await form.validateFields();
      createProduct(formAction, {
        onSuccess: () => {
          Notification("success", "Produk berhasil ditambahkan");
          setShow("NONE");
          form.resetFields();
          refetch();
        },
        onError: () => {
          Notification("error", "Gagal menambahkan produk");
        },
      });
    } catch (e) {
      Notification("error", "Server Error");
    }
  };

  const handleUpdateProduct = async () => {
    try {
      await form.validateFields();
      updateProduct(
        { id: formAction.id, data: formAction },
        {
          onSuccess: () => {
            Notification("success", "Produk berhasil diupdate");
            setShow("NONE");
            form.resetFields();
            refetch();
          },
          onError: () => {
            Notification("error", "Gagal mengupdate produk");
          },
        }
      );
    } catch (e) {
      Notification("error", "Server Error");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    deleteProduct(id, {
      onSuccess: () => {
        Notification("success", "Produk berhasil dihapus");
        refetch();
        setShowDeleteModal(false);
        setSelectedProduct(null);
      },
      onError: () => {
        Notification("error", "Gagal menghapus produk");
      },
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produk</h1>
          <p className="text-gray-600 mt-1">Kelola data produk</p>
        </div>
        <button
          onClick={() => setShow("ADD")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tambah Produk
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Cari nama produk..."
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

      {/* Products Table */}
      {isLoading ? (
        <div className="animate-pulse bg-gray-100 w-full min-h-[30dvh] rounded-xl"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Produk</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Harga</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Stok</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-600">
                      Tidak ada data produk
                    </td>
                  </tr>
                ) : (
                  products.map((product: any) => (
                    <tr key={product.id} className="hover:bg-gray-100 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.image?.url ? (
                              <Image
                                src={product.image.url}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.description?.substring(0, 50)}{product.description?.length > 50 ? '...' : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-800">
                            Rp {product.price?.toLocaleString()}
                          </span>
                          <span className="text-gray-500 text-sm">/{product.unit}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <Archive className="w-4 h-4 text-gray-400" />
                          <span className={`${product.stock > 0 ? 'text-gray-800' : 'text-red-600'}`}>
                            {product.stock} {product.unit}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            product.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.is_active ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setShow("UPDATE");
                              setFormAction(product);
                              form.setFieldsValue(product);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
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

      {/* Add Product Modal */}
      {show === "ADD" && (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Tambah Produk Baru</h2>
            <Form form={form} layout="vertical" requiredMark={false}>
              <InputForm
                type="text"
                name="name"
                label="Nama Produk"
                placeholder="Masukkan nama produk"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="text"
                name="description"
                label="Deskripsi"
                placeholder="Masukkan deskripsi (opsional)"
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="number"
                name="price"
                label="Harga"
                placeholder="Masukkan harga"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="text"
                name="unit"
                label="Satuan"
                placeholder="Contoh: kg, ton, pcs"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="number"
                name="stock"
                label="Stok"
                placeholder="Masukkan jumlah stok"
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
                  onClick={() => handleAddProduct()}
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

      {/* Update Product Modal */}
      {show === "UPDATE" && (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Produk</h2>
            <Form form={form} layout="vertical" requiredMark={false}>
              <InputForm
                type="text"
                name="name"
                label="Nama Produk"
                placeholder="Masukkan nama produk"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="text"
                name="description"
                label="Deskripsi"
                placeholder="Masukkan deskripsi (opsional)"
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="number"
                name="price"
                label="Harga"
                placeholder="Masukkan harga"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="text"
                name="unit"
                label="Satuan"
                placeholder="Contoh: kg, ton, pcs"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="number"
                name="stock"
                label="Stok"
                placeholder="Masukkan jumlah stok"
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formAction.is_active ?? true}
                  onChange={(e) => setFormAction({ ...formAction, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Produk aktif
                </label>
              </div>
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
                  onClick={() => handleUpdateProduct()}
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Hapus Produk</h2>
            <p className="text-gray-600 mb-6">
              Yakin ingin menghapus produk "<span className="font-semibold">{selectedProduct?.name}</span>"?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProduct(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProduct(selectedProduct?.id)}
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
