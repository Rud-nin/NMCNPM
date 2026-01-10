import axios from "axios";

const BASE_URL = import.meta.env.VITE_SERVER_URL
export const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true, // dùng để cho phép axios gửi kèm cookie, session, token (nếu có trong cookie) mỗi khi gọi API
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);