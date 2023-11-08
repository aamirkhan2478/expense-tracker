import axiosInstance from "@/utils/axiosInstence";
import { useMutation } from "react-query";

const signup = (values) => {
  return axiosInstance.post("/api/auth", values);
};

export const useSignUpUser = (onSuccess, onError) => {
  return useMutation(signup, { onError, onSuccess });
};