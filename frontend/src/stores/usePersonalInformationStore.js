import { create } from "zustand";
import { useAuthStore } from "./useAuthStore.js";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const usePersonalInformationStore = create((set, get) => ({
  isLoading: false,
  user: [],

  fetchPersonalInformation: async () => {
    const authUser = useAuthStore.getState().authUser;
    const id = authUser?.UserID; 
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/users/${id}`);
      set({ user: res });
      toast.success("Lấy thông tin người dùng thành công");
      return res;
    } catch (error) {
      console.log("Có lỗi trong fetchPersonalInformation", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isLoading: false});
    }
  },
  
}));