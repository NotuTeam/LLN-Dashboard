/** @format */

import AxiosClient from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fetch pending payments
export const usePendingPayments = () => {
  return useQuery({
    queryKey: ["payments", "pending"],
    queryFn: async () => {
      const response = await AxiosClient.get("/payments/pending");
      return response.data;
    },
  });
};

// Fetch payments by status
export const usePaymentsByStatus = (status: string) => {
  return useQuery({
    queryKey: ["payments", status],
    queryFn: async () => {
      const response = await AxiosClient.get(`/payments/status/${status}`);
      return response.data;
    },
    enabled: !!status,
  });
};

// Verify payment
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await AxiosClient.post(`/payments/${id}/verify`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// Reject payment
export const useRejectPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await AxiosClient.post(`/payments/${id}/reject`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
