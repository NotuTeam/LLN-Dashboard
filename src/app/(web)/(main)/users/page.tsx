/** @format */

"use client";

import { useState } from "react";
import { useGlobalState } from "@/lib/middleware";
import { useRouter } from "next/navigation";

import { Search, Plus, Edit, Trash2 } from "lucide-react";
import InputForm from "@/components/Form";
import Notification from "@/components/Notification";
import { Form } from "antd";
import { useDebounce } from "@/hooks/useDebounce";

import dayjs from "dayjs";
import { useUser, useRegister, useDelete, useUpdate } from "./hook";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [show, setShow] = useState<"NONE" | "ADD" | "UPDATE">("NONE");
  const [formAction, setFormAction] = useState<any>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const debouncedSearchName = useDebounce(searchTerm, 500);

  const router = useRouter();
  const { state } = useGlobalState();
  const [form] = Form.useForm();

  // Use debounced search in the query
  const { data = [], isLoading, refetch } = useUser(debouncedSearchName);
  const { mutate: registerUser, isPending: registerPending } = useRegister();
  const { mutate: updateUser, isPending: updatePending } = useUpdate();
  const { mutate: deleteUser, isPending: deletePending } = useDelete();

  const handleAddUser = async () => {
    try {
      await form.validateFields();

      if (formAction.retype_password !== formAction.password)
        return Notification("error", "Password Not Match");

      registerUser(formAction, {
        onSuccess: () => {
          Notification("success", "Success to Register User");
          setShow("NONE");
          form.resetFields();
          refetch();
        },
        onError: () => {
          Notification("error", "Failed to Register User");
        },
      });
    } catch (e) {
      Notification("error", "Server Error");
    }
  };

  const handleUpdateUser = async () => {
    try {
      await form.validateFields();

      if (
        formAction.password &&
        formAction.retype_password !== formAction.password
      )
        return Notification("error", "Password Not Match");

      updateUser(formAction, {
        onSuccess: () => {
          Notification("success", "Success to Update User");
          setShow("NONE");
          form.resetFields();
          refetch();
        },
        onError: () => {
          Notification("error", "Failed to Update User");
        },
      });
    } catch (e) {
      Notification("error", "Server Error");
    }
  };

  const handleDeleteUser = async (id: string) => {
    deleteUser(id, {
      onSuccess: () => {
        Notification("success", "Success to Delete User");
        refetch();
        setShowDeleteModal(false);
        setSelectedUser(null);
      },
      onError: () => {
        Notification("error", "Failed to Delete User");
      },
    });
  };

  if (!state.user || state.user.role !== "SUPERADMIN") {
    if (typeof window !== "undefined") {
      router.push("/");
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">
            Manage your team members and their permissions
          </p>
        </div>
        <button
          onClick={() => setShow("ADD")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Search by username or name..."
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
        {debouncedSearchName && (
          <p className="text-sm text-gray-600 mt-2">
            Searching for:{" "}
            <span className="font-medium">{debouncedSearchName}</span>
          </p>
        )}
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="animate-pulse bg-gray-100 w-full min-h-[30dvh] rounded-xl"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">
                    User
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">
                    Role
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">
                    Created At
                  </th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-600">
                      {debouncedSearchName
                        ? "No users found matching your search"
                        : "No users found"}
                    </td>
                  </tr>
                ) : (
                  data.map((user: any) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-100 transition-colors !border-slate-200"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user?.display_name
                                ? user?.display_name[0]?.toUpperCase()
                                : "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {user.display_name}
                            </p>
                            <p className="text-sm text-gray-600 capitalize">
                              {user?.username?.toLowerCase() || "-"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === "Admin"
                              ? "bg-purple-900/50 text-purple-300"
                              : user.role === "SUPERADMIN"
                                ? "bg-primary-900/50 text-primary-300"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user?.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {dayjs(user.created_at).format("DD MMMM YYYY")}
                      </td>
                      {user?.role !== "SUPERADMIN" ? (
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setShow("UPDATE");
                                setFormAction(user);
                                form.setFieldsValue(user);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteModal(true);
                              }}
                              type="button"
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      ) : (
                        <td className="py-4 px-6" />
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {show === "ADD" && (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Add New User
            </h2>
            <Form form={form} layout="vertical" requiredMark={false}>
              <InputForm
                type="text"
                name="display_name"
                label="Full Name"
                placeholder="Enter full name"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="text"
                name="username"
                label="Username"
                placeholder="Enter username"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="password"
                name="password"
                label="Password"
                placeholder="Enter password"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="password"
                name="retype_password"
                label="Retype Password"
                placeholder="Retype password"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShow("NONE")}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAddUser()}
                  disabled={registerPending}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                >
                  {registerPending ? "Loading..." : "Add User"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {show === "UPDATE" && (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Update User
            </h2>
            <Form form={form} layout="vertical" requiredMark={false}>
              <InputForm
                type="text"
                name="display_name"
                label="Full Name"
                placeholder="Enter full name"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="text"
                name="username"
                label="Username"
                placeholder="Enter username"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="password"
                name="password"
                label="Password"
                placeholder="Enter password"
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              {formAction?.password && (
                <InputForm
                  type="password"
                  name="retype_password"
                  label="Retype Password"
                  placeholder="Retype password"
                  required
                  form={formAction}
                  setForm={(e: any) => setFormAction(e)}
                />
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShow("NONE")}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateUser()}
                  disabled={updatePending}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                >
                  {updatePending ? "Loading..." : "Update User"}
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Delete User
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "
              <span className="font-semibold">
                {selectedUser?.display_name}
              </span>
              "? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                disabled={deletePending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(selectedUser?.id)}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deletePending}
              >
                {deletePending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
