import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api", // base url => đỡ phải viết dài dòng trong mỗi lần gọi request 
  withCredentials: true, // dùng để cho phép axios gửi kèm cookie, session, token (nếu có trong cookie) mỗi khi gọi API
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);