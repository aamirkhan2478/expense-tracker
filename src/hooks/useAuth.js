import axiosInstance from "@/utils/axiosInstance";
import { useMutation } from "react-query";

const signup = (values) => {
  return axiosInstance.post("/api/auth", values);
};

const signin = (values) => {
  return axiosInstance.post("/api/auth/login", values);
};

export const useSignUpUser = (onSuccess, onError) => {
  return useMutation(signup, { onError, onSuccess });
};

export const useSignInUser = (onSuccess, onError) => {
  return useMutation(signin, { onError, onSuccess });
};
