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
  },

  getAllTopUps: async (page, limit) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/topups?page=${page}&limit=${limit}`);
      return res;
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  acceptTopUp: async (id) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.patch(`/topups/${id}/accept`);
      toast.success('Phê duyệt yêu cầu thành công');
      return res;
    } catch (err) {
      toast.error('Có lỗi trong khi phê duyệt yêu cầu!');
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  rejectTopUp: async (id) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.patch(`/topups/${id}/reject`);
      toast.success('Từ chối yêu cầu thành công');
      return res;
    } catch (err) {
      toast.error('Có lỗi trong khi từ chối yêu cầu!');
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

}));