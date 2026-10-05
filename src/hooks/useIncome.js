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
  const limit = queryKey[2];
  const page = queryKey[3];
  const incomeDate = queryKey[4];
  const isRecurring = queryKey[5];
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  // No user id is sent: the route derives ownership from the access token.
  return axiosInstance.get(
    `/api/income?limit=${limit}&page=${page}&incomeDate=${incomeDate}&isRecurring=${isRecurring}`,
    config
  );
};

export const useShowIncome = (user, limit = "", page = "", incomeDate = "", isRecurring = "") => {
  return useQuery(["show-incomes", user, limit, page, incomeDate, isRecurring], incomes, {
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};

const updateIncome = (values) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  return axiosInstance.patch(
    `/api/income/${values.id}/update`,
    {
      title: values.title,
      amount: values.amount,
      incomeDate: values.incomeDate,
      companyName: values.companyName,
      isRecurring: values.isRecurring,
      recurringFrequency: values.recurringFrequency,
    },
    config
  );
};

export const useUpdateIncome = (onSuccess, onError) => {
  return useMutation(updateIncome, { onError, onSuccess });
};
