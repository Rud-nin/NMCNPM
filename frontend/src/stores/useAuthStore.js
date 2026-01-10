import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { useUserInformationStore } from "./useUserInformationStore.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false, 
  isSigningIn: false,
  isCheckingAuth: true, 

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res });
    } catch (error) {
      console.error(error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({isSigningUp: true});
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      toast.success("Tạo tài khoản thành công!");
      return res;
    } catch (error) {
      toast.error('Có lỗi khi đăng ký');
      console.error(error);
    } finally {
      set({isSigningUp: false});
    }
  },

  signin: async (data) => {
    set({isSigningIn: true});
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res });
      useUserInformationStore.getState().fetchUserInformation();
      toast.success("Đăng nhập thành công!");
    } catch (error) {
      toast.error('Có lỗi khi đăng nhập');
      console.error(error);
    } finally {
      set({ isSigningIn: false});
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      useUserInformationStore.setState({ user: null });
      toast.success("Đăng xuất thành công");
    } catch (error) {
      toast.error('Có lỗi khi đăng xuất');
      console.error(error);
    }
  },
}));