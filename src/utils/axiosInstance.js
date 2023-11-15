import axios from "axios";

const baseURL = process.env.NEXTAUTH_URL;

const axiosInstance = axios.create({
  baseURL,
});

axiosInstance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response.status === 504) {
      return Promise.reject({
        message: "Server is down, please try again later.",
      });
    }

    return Promise.reject(error);
  }
);
export default axiosInstance;
