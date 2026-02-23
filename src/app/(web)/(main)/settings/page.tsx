/** @format */

"use client";

import { useState, useEffect } from "react";
import { Building2, CreditCard, Phone, Mail, MapPin, MessageCircle, Save, Loader2 } from "lucide-react";
import Notification from "@/components/Notification";
import { useSettings, useUpdateSettings } from "./hook";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    bank_name: "",
    bank_account: "",
    bank_holder: "",
    bank_name_2: "",
    bank_account_2: "",
    bank_holder_2: "",
    whatsapp_number: "",
  });

  const { data, isLoading } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const settings = data?.data;

  // Populate form when data loads
  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        bank_name: settings.bank_name || "",
        bank_account: settings.bank_account || "",
        bank_holder: settings.bank_holder || "",
        bank_name_2: settings.bank_name_2 || "",
        bank_account_2: settings.bank_account_2 || "",
        bank_holder_2: settings.bank_holder_2 || "",
        whatsapp_number: settings.whatsapp_number || "",
      });
    }
  }, [settings]);

  const handleSubmit = () => {
    updateSettings(formData, {
      onSuccess: () => {
        Notification("success", "Pengaturan berhasil disimpan");
      },
      onError: () => {
        Notification("error", "Gagal menyimpan pengaturan");
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-600 mt-1">Kelola informasi perusahaan dan rekening bank</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-medium text-gray-900">Informasi Perusahaan</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Perusahaan</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              Alamat
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                Telepon
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MessageCircle className="w-4 h-4" />
              Nomor WhatsApp (untuk notifikasi)
            </label>
            <input
              type="text"
              placeholder="628123456789"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
            />
          </div>
        </div>

        {/* Bank Accounts */}
        <div className="space-y-6">
          {/* Primary Bank */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-medium text-gray-900">Rekening Utama</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Bank</label>
              <input
                type="text"
                placeholder="Contoh: BCA, Mandiri, BNI"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Rekening</label>
              <input
                type="text"
                placeholder="1234567890"
                value={formData.bank_account}
                onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Atas Nama</label>
              <input
                type="text"
                placeholder="PT LabaLaba Nusantara"
                value={formData.bank_holder}
                onChange={(e) => setFormData({ ...formData, bank_holder: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
              />
            </div>
          </div>

          {/* Secondary Bank */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-medium text-gray-700">Rekening Cadangan (Opsional)</h2>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Bank</label>
              <input
                type="text"
                placeholder="Contoh: BCA, Mandiri, BNI"
                value={formData.bank_name_2}
                onChange={(e) => setFormData({ ...formData, bank_name_2: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Rekening</label>
              <input
                type="text"
                placeholder="1234567890"
                value={formData.bank_account_2}
                onChange={(e) => setFormData({ ...formData, bank_account_2: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Atas Nama</label>
              <input
                type="text"
                placeholder="PT LabaLaba Nusantara"
                value={formData.bank_holder_2}
                onChange={(e) => setFormData({ ...formData, bank_holder_2: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-medium text-blue-800 mb-4">Preview Tampilan di Client</h3>
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          {formData.bank_name && formData.bank_account ? (
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-800">{formData.bank_name}</p>
                <p className="text-xl font-bold">{formData.bank_account || "-"}</p>
                <p className="text-gray-600">a.n. {formData.bank_holder || "-"}</p>
              </div>
              {formData.bank_name_2 && formData.bank_account_2 && (
                <>
                  <hr />
                  <div>
                    <p className="font-medium text-gray-800">{formData.bank_name_2}</p>
                    <p className="text-xl font-bold">{formData.bank_account_2 || "-"}</p>
                    <p className="text-gray-600">a.n. {formData.bank_holder_2 || "-"}</p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Isi data rekening untuk melihat preview</p>
          )}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full py-4 bg-primary-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Simpan Pengaturan
          </>
        )}
      </button>
    </div>
  );
}
