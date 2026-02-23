/** @format */

"use client";

import AxiosClient from "@/lib/axios";

export async function UserListService(search?: string) {
  try {
    const params = search ? { search } : {};

    const { data: response } = await AxiosClient.get("/auth/list", { params });

    const { status, message, data } = response;

    if (status !== 200) throw new Error(message);

    return {
      status,
      message,
      data,
    };
  } catch (error: any) {
    console.log(error);
    return error.message;
  }
}

export async function RegisterService(payload: {
  username: string;
  password: string;
  display_name: string;
}) {
  try {
    const { data: response } = await AxiosClient.post(
      "/auth/register",
      payload
    );

    const { status, message, data } = response;
    console.log(response);

    if (status !== 201) throw new Error(message);

    return {
      status,
      message,
      data,
    };
  } catch (error: any) {
    console.log(error);
    return error?.response?.data;
  }
}

export async function UpdateService(payload: {
  _id: string;
  username: string;
  password: string;
  display_name: string;
}) {
  try {
    const { data: response } = await AxiosClient.put(
      `/auth/adjust/${payload._id}`,
      payload
    );

    const { status, message, data } = response;

    if (status !== 200) throw new Error(message);

    return {
      status,
      message,
      data,
    };
  } catch (error: any) {
    console.log(error);
    return error?.response?.data;
  }
}

export async function DeleteService(payload: string) {
  try {
    const { data: response } = await AxiosClient.delete(
      `/auth/takedown/${payload}`
    );

    const { status, message } = response;

    if (status !== 200) throw new Error(message);

    return {
      status,
      message,
    };
  } catch (error: any) {
    console.log(error);
    return error?.response?.data;
  }
}
