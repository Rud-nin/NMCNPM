import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false, 
  isSigningIn: false,
  isCheckingAuth: true, 

  checkAuth: async () => {
    
  },

  signup: async (data) => {
    set({isSigningUp: true});
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({authUser: res.data});
      toast.success("Tạo tài khoản thành công!");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({isSigningUp: false});
    }
  },

  signin: async (data) => {
    
  },

  logout: async () => {

  },
}));