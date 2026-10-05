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

const categories = () => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  // No user id is sent: the route derives ownership from the access token.
  return axiosInstance.get(`/api/category`, config);
};

export const useShowCategory = (user) => {
  return useQuery(["show-categories", user], categories, {
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};

const updateCategory = (values) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axiosInstance.patch(
    `/api/category/${values.id}/update`,
    { name: values.name, icon: values.icon, budget: values.budget },
    config
  );
};

export const useUpdateCategory = (onSuccess, onError) => {
  return useMutation(updateCategory, { onError, onSuccess });
};
