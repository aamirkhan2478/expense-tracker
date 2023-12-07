import axiosInstance from "@/utils/axiosInstance";
import { useMutation, useQuery } from "react-query";

const addCategory = (values) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axiosInstance.post("/api/category", values, config);
};

export const useAddCategory = (onSuccess, onError) => {
  return useMutation(addCategory, { onError, onSuccess });
};

const deleteCategory = (id) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axiosInstance.delete(`/api/category/${id}`, config);
};

export const useDeleteCategory = (onError, onSuccess) => {
  return useMutation((id) => deleteCategory(id), { onError, onSuccess });
};

const categories = ({ queryKey }) => {
  const user = queryKey[1];
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axiosInstance.get(
    `/api/category?user=${user}`,
    config
  );
};

export const useShowCategory = (
  user,
) => {
  return useQuery(["show-categories", user], categories, {
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};
