/** @format */

import AxiosClient from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fetch delivery notes list
export const useDeliveryNotes = () => {
  return useQuery({
    queryKey: ["delivery"],
    queryFn: async () => {
      const response = await AxiosClient.get("/delivery");
      return response.data;
    },
  });
};

// Fetch orders ready for delivery note
export const useReadyOrders = () => {
  return useQuery({
    queryKey: ["delivery", "ready"],
    queryFn: async () => {
      const response = await AxiosClient.get("/delivery/ready");
      return response.data;
    },
  });
};

// Fetch single delivery note
export const useDeliveryNoteDetail = (id: string) => {
  return useQuery({
    queryKey: ["delivery", id],
    queryFn: async () => {
      const response = await AxiosClient.get(`/delivery/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create delivery note
export const useCreateDeliveryNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await AxiosClient.post("/delivery", { order_id: orderId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });
};
