/** @format */

"use client";

import AxiosClient from "@/lib/axios";

export async function UserListService(search?: string) {
  try {
    const params = search ? { search } : {};

    const response = await AxiosClient.get("/auth/list", { params });

    // API returns: { status, message, data: [...users], pagination }
    return response.data;
  } catch (error: any) {
    console.log(error);
    return { status: 500, message: error.message, data: [] };
  }
}

export async function RegisterService(payload: {
  username: string;
  password: string;
  display_name: string;
}) {
  try {
    const response = await AxiosClient.post("/auth/register", payload);

    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data || { status: 500, message: error.message };
  }
}

export async function UpdateService(payload: {
  _id: string;
  username: string;
  password: string;
  display_name: string;
}) {
  try {
    const response = await AxiosClient.put(
      `/auth/adjust/${payload._id}`,
      payload
    );

    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data || { status: 500, message: error.message };
  }
}

export async function DeleteService(payload: string) {
  try {
    const response = await AxiosClient.delete(`/auth/takedown/${payload}`);

    return response.data;
  } catch (error: any) {
    console.log(error);
    return error?.response?.data || { status: 500, message: error.message };
  }
}
