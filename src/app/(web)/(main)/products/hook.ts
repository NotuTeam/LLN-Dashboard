/** @format */

import AxiosClient from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fetch products list
export const useProducts = (search?: string) => {
  return useQuery({
    queryKey: ["products", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const response = await AxiosClient.get(`/products?${params.toString()}`);
      return response.data;
    },
  });
};

// Fetch single product
export const useProductDetail = (id: string) => {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const response = await AxiosClient.get(`/products/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await AxiosClient.post("/products", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await AxiosClient.put(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// Delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await AxiosClient.delete(`/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// Upload product image
export const useUploadProductImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const response = await AxiosClient.api.post(`/products/${id}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
