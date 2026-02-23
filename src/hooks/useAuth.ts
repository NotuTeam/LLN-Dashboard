/** @format */
"use client";

import { useMutation } from "@tanstack/react-query";
import { Login } from "./serviceAuth";
import { useGlobalState } from "@/lib/middleware";
import { useRouter } from "next/navigation";

export const useLogin = () => {
  const { actions } = useGlobalState();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (payload: { username: string; password: string }) => {
      try {
        const response: any = await Login(payload);
        console.log("response >>> ", response)
        if (response.status !== 200) throw new Error(response.message);

        return {
          user: response.user,
          token: response.user.access_token,
        };
      } catch (error: any) {
        throw new Error(error.message || "Failed to Login");
      }
    },
    onSuccess: (data) => {
      actions.setAuth(data.user, data.token);
    },
  });
};

export const useProfile = () => {
  const { actions } = useGlobalState();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (payload: { username: string; password: string }) => {
      try {
        const response: any = await Login(payload);

        if (response.status !== 200) throw new Error(response.message);

        return {
          user: response.user,
          token: response.user.access_token,
        };
      } catch (error: any) {
        throw new Error(error.message || "Failed to Login");
      }
    },
    onSuccess: (data) => {
      actions.setAuth(data.user, data.token);
    },
  });
};

export const useLogout = () => {
  const { actions } = useGlobalState();
  const router = useRouter();

  return useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
      try {
        // Optional: Call logout endpoint
        // await AxiosClient.post("/auth/logout");
        router.refresh();
        return true;
      } catch (error) {
        // Even if logout fails on server, clear local state
        return true;
      }
    },
    onSettled: () => {
      actions.logout();
    },
  });
};
