/** @format */

import AxiosClient from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fetch WhatsApp status
export const useWhatsAppStatus = () => {
  return useQuery({
    queryKey: ["whatsapp", "status"],
    queryFn: async () => {
      const response = await AxiosClient.get("/whatsapp/status");
      return response.data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};

// Connect WhatsApp
export const useWhatsAppConnect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await AxiosClient.post("/whatsapp/connect");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "status"] });
    },
  });
};

// Disconnect WhatsApp
export const useWhatsAppDisconnect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await AxiosClient.post("/whatsapp/disconnect");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "status"] });
    },
  });
};

// Logout WhatsApp
export const useWhatsAppLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await AxiosClient.post("/whatsapp/logout");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "status"] });
    },
  });
};

// Restart WhatsApp
export const useWhatsAppRestart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await AxiosClient.post("/whatsapp/restart");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "status"] });
    },
  });
};

// Send test message
export const useWhatsAppTest = () => {
  return useMutation({
    mutationFn: async (phone: string) => {
      const response = await AxiosClient.post(`/whatsapp/test?phone=${phone}`);
      return response.data;
    },
  });
};
