/** @format */

import AxiosClient from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Fetch settings
export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await AxiosClient.get("/settings");
      return response.data;
    },
  });
};

// Update settings
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await AxiosClient.put("/settings", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
};
