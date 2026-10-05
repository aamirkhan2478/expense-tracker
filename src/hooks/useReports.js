import axiosInstance from "@/utils/axiosInstance";
import { useQuery } from "react-query";

const reportSummary = ({ queryKey }) => {
  const year = queryKey[2];
  const month = queryKey[3];
  const config = {
    headers: { "Content-Type": "application/json" },
  };
  // No user id is sent: the route derives ownership from the access token.
  let url = `/api/reports?year=${year}`;
  if (month !== null && month !== undefined && month !== "") {
    url += `&month=${month}`;
  }
  return axiosInstance.get(url, config);
};

export const useReportSummary = (user, year, month) => {
  return useQuery(["report-summary", user, year, month], reportSummary, {
    staleTime: 60000,
    refetchOnWindowFocus: false,
    enabled: !!user,
  });
};

const reportTrend = ({ queryKey }) => {
  const year = queryKey[2];
  const config = {
    headers: { "Content-Type": "application/json" },
  };
  // No user id is sent: the route derives ownership from the access token.
  return axiosInstance.get(`/api/reports/trend?year=${year}`, config);
};

export const useReportTrend = (user, year) => {
  return useQuery(["report-trend", user, year], reportTrend, {
    staleTime: 60000,
    refetchOnWindowFocus: false,
    enabled: !!user,
  });
};
