import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useUserInformationStore = create((set, get) => ({
  isLoading: true,
  user: null,

  fetchUserInformation: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/users/me`);
      set({ user: res.user });
      return res.user;
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false});
    }
  },

  decreaseBalance: async (totalAmount) => {
    set((state) => {
      if (!state.user) return state;

      return {
        user: {
          ...state.user,
          Balance: state.user.Balance - totalAmount,
        },
      };
    });
  },

}));