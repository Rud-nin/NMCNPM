import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';
import { useAuthStore } from './useAuthStore.js';

export const useTopUpStore = create((set, get) => ({
  isLoading: false,
  isCreating: false,
  userTopUps: [],

  createTopUp: async (amount) => {
    const authUser = useAuthStore.getState().authUser;
    set({ isCreating: true });
    
    try {
      await axiosInstance.post('/topups', {
        UserID: authUser?.UserID,
        Amount: amount,
      });
      toast.success("Tạo yêu cầu chuyển tiền thành công");
    } catch (err) {
      toast.error('Có lỗi trong khi tạo yêu cầu nạp tiền!');
      console.error(err);
    } finally {
      set({ isCreating: false });
    }
  },

  getUserTopUps: async () => {
    const authUser = useAuthStore.getState().authUser;
    set({ isLoading: true });

    try {
      const res = await axiosInstance.get(`/topups/user/${authUser?.UserID}`);
      set({ userTopUps: res.data })
      return res;
      // const res = await fetch('/topups.example.json');
      // toast.success("Lấy lịch sử nạp tiền thành công");
      // return res.json();
    } catch (err) {
      toast.error('Có lỗi trong khi lấy lịch sử nạp tiền!');
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  }
}));