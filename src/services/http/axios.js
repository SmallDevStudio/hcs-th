import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api/v1",
  timeout: 30000,
  withCredentials: true,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response.data,

  (error) => {
    const response = error.response;

    const normalizedError = {
      message:
        response?.data?.message ||
        error.message ||
        "Unable to complete the request",

      code: response?.data?.error?.code || "REQUEST_FAILED",

      details: response?.data?.error?.details || null,

      status: response?.status || 500,

      originalError: error,
    };

    return Promise.reject(normalizedError);
  },
);
