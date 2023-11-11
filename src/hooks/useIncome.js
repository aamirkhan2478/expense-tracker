import axiosInstance from "@/utils/axiosInstance";
import { useMutation, useQuery } from "react-query";

const addIncome = (values) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axiosInstance.post("/api/income", values, config);
};

export const useAddIncome = (onSuccess, onError) => {
  return useMutation(addIncome, { onError, onSuccess });
};

const deleteIncome = (id) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axiosInstance.delete(`/api/income/${id}`, config);
};

export const useDeleteIncome = (onError, onSuccess) => {
  return useMutation((id) => deleteIncome(id), { onError, onSuccess });
};

const incomes = ({ queryKey }) => {
  const user = queryKey[1];
  const limit = queryKey[2];
  const page = queryKey[3];
  const incomeDate = queryKey[4];
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axiosInstance.get(
    `/api/income/?user=${user}&limit=${limit}&page=${page}&incomeDate=${incomeDate}`,
    config
  );
};

export const useShowIncome = (user, limit, page, incomeDate) => {
  return useQuery(["show-incomes", user, limit, page, incomeDate], incomes, {
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};
