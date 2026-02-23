/** @format */

import AxiosClient from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fetch queue list
export const useQueue = (status?: string) => {
  return useQuery({
    queryKey: ["queue", status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      const response = await AxiosClient.get(`/queue?${params.toString()}`);
      return response.data;
    },
  });
};

// Fetch queue estimate
export const useQueueEstimate = () => {
  return useQuery({
    queryKey: ["queue", "estimate"],
    queryFn: async () => {
      const response = await AxiosClient.get("/queue/estimate");
      return response.data;
    },
  });
};

// Fetch current loading
export const useCurrentLoading = () => {
  return useQuery({
    queryKey: ["queue", "current"],
    queryFn: async () => {
      const response = await AxiosClient.get("/queue/current");
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Scan barcode
export const useScanBarcode = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (barcode: string) => {
      const response = await AxiosClient.post("/queue/scan", { barcode });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// Call next in queue
export const useCallNext = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await AxiosClient.post("/queue/call-next");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
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
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["delivery"] });
    },
  });
};
