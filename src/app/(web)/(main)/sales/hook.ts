/** @format */

import AxiosClient from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fetch sales list
export const useSales = (search?: string) => {
  return useQuery({
    queryKey: ["sales", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const response = await AxiosClient.get(`/sales?${params.toString()}`);
      return response.data;
    },
  });
};

// Fetch single sales
export const useSalesDetail = (id: string) => {
  return useQuery({
    queryKey: ["sales", id],
    queryFn: async () => {
      const response = await AxiosClient.get(`/sales/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create sales
export const useCreateSales = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await AxiosClient.post("/sales", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
};

// Update sales
export const useUpdateSales = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await AxiosClient.put(`/sales/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
};

// Delete sales
export const useDeleteSales = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await AxiosClient.delete(`/sales/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
};
