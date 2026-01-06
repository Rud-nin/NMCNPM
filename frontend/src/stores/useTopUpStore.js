import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

export const useTopUpStore = create((set, get) => ({
  isLoading: false,
  isCreating: false,
  userTopUps: [],

  createTopUp: async (amount) => {
    set({ isCreating: true });
    
    try {
      await axiosInstance.post('/topups', {
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

  getUserTopUps: async (page, limit) => {
    set({ isLoading: true });

    try {
      const res = await axiosInstance.get(`/topups/me?page=${page}&limit=${limit}`);
      set({ userTopUps: res.data })
      return res;
    } catch (err) {
      toast.error('Có lỗi trong khi lấy lịch sử nạp tiền!');
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  }
}));