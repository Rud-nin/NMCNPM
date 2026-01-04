import { create } from "zustand";
import { useAuthStore } from "./useAuthStore.js";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useUserInformationStore = create((set, get) => ({
  isLoading: false,
  user: [],

  fetchUserInformation: async () => {
    const authUser = useAuthStore.getState().authUser;
    const id = authUser?.UserID; 
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/users/${id}`);
      set({ user: res });
      return res;
      // const res = await fetch('/user.example.json');
      // const data = await res.json();
      // toast.success("Lấy thông tin thành công");
      // set({ user: data });
      // return res;
    } catch (error) {
      console.log("Có lỗi trong fetchUserInformation", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isLoading: false});
    }
  },
  
}));