/** @format */
import { useMutation, useQuery, UseQueryResult } from "@tanstack/react-query";

import {
  DeleteService,
  RegisterService,
  UserListService,
  UpdateService,
} from "./handler";

export const useUser = (search: string): UseQueryResult<any> => {
  const queryResult = useQuery({
    queryKey: ["user_list", search],
    queryFn: async () => {
      try {
        const response = await UserListService(search);

        if (response.status !== 200) throw new Error();

        // Return the data array from the response
        return response.data || [];
      } catch (e) {
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });

  return queryResult;
};

export const useRegister = () => {
  return useMutation({
    mutationKey: ["register_user"],
    mutationFn: async (payload: {
      username: string;
      password: string;
      display_name: string;
    }) => {
      const response = await RegisterService(payload);

      if (response.status !== 201) throw new Error(response.message || "Failed to register user");

      return response;
    },
  });
};

export const useUpdate = () => {
  return useMutation({
    mutationKey: ["update_user"],
    mutationFn: async (payload: {
      id?: string;
      _id?: string;
      username: string;
      password: string;
      display_name: string;
    }) => {
      // Support both id and _id for compatibility
      const userId = payload.id || payload._id;
      if (!userId) throw new Error("User ID is required");

      const response = await UpdateService({ ...payload, _id: userId });

      if (response.status !== 200) throw new Error(response.message || "Failed to update user");

      return response;
    },
  });
};

export const useDelete = () => {
  return useMutation({
    mutationKey: ["delete_user"],
    mutationFn: async (payload: string) => {
      const response = await DeleteService(payload);

      if (response.status !== 200) throw new Error(response.message || "Failed to delete user");

      return response;
    },
  });
};
