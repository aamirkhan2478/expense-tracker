import axiosInstance from "@/utils/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "react-query";

/**
 * Fetch daily budget summary for a specific month.
 */
const fetchDailyBudget = async ({ queryKey }) => {
  const month = queryKey[1] || "";
  const url = month ? `/api/budget?month=${encodeURIComponent(month)}` : "/api/budget";
  const response = await axiosInstance.get(url);
  return response.data;
};

export const useDailyBudget = (month, options = {}) => {
  return useQuery(["daily-budget", month], fetchDailyBudget, {
    staleTime: 30000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

/**
 * Mutate (create or update) the daily budget for a month.
 */
const saveDailyBudget = async (payload) => {
  const response = await axiosInstance.post("/api/budget", payload);
  return response.data;
};

export const useSetDailyBudget = (onSuccess, onError) => {
  const queryClient = useQueryClient();

  return useMutation(saveDailyBudget, {
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(["daily-budget"]);
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError: (error, variables, context) => {
      if (onError) onError(error, variables, context);
    },
  });
};
