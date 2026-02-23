/** @format */

import AxiosClient from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fetch orders list
export const useOrders = (params?: { status?: string; search?: string }) => {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.search) queryParams.append("search", params.search);
      const response = await AxiosClient.get(`/orders?${queryParams.toString()}`);
      return response.data;
    },
  });
};

// Fetch order stats
export const useOrderStats = () => {
  return useQuery({
    queryKey: ["orders", "stats"],
    queryFn: async () => {
      const response = await AxiosClient.get("/orders/stats");
      return response.data;
    },
  });
};

// Fetch WhatsApp status
export const useWhatsAppStatus = () => {
  return useQuery({
    queryKey: ["whatsapp", "status"],
    queryFn: async () => {
      const response = await AxiosClient.get("/whatsapp/status");
      return response.data;
    },
    refetchInterval: 30000, // Check every 30 seconds
  });
};

// Fetch single order
export const useOrderDetail = (id: string) => {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const response = await AxiosClient.get(`/orders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await AxiosClient.post("/orders", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// Update order
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await AxiosClient.put(`/orders/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// Cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await AxiosClient.delete(`/orders/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// Call order from queue
export const useCallOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await AxiosClient.post(`/orders/${id}/call`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });
};

// Finish loading order
export const useFinishLoading = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await AxiosClient.post(`/orders/${id}/finish-loading`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });
};
