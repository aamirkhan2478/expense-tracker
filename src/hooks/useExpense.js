import axiosInstance from "@/utils/axiosInstance";
import { useMutation, useQuery } from "react-query";

const addExpense = (values) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axiosInstance.post("/api/expense", values, config);
};

export const useAddExpense = (onSuccess, onError) => {
  return useMutation(addExpense, { onError, onSuccess });
};

const deleteExpense = (id) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axiosInstance.delete(`/api/expense/${id}`, config);
};

export const useDeleteExpense = (onError, onSuccess) => {
  return useMutation((id) => deleteExpense(id), { onError, onSuccess });
};

const expenses = ({ queryKey }) => {
  const user = queryKey[1];
  const limit = queryKey[2];
  const page = queryKey[3];
  const expenseDate = queryKey[4];
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axiosInstance.get(
    `/api/expense?user=${user}&limit=${limit}&page=${page}&expenseDate=${expenseDate}`,
    config
  );
};

export const useShowExpense = (
  user,
  limit = "",
  page = "",
  expenseDate = ""
) => {
  return useQuery(["show-expenses", user, limit, page, expenseDate], expenses, {
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};
