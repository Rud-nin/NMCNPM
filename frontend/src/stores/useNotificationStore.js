import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

export const useNotificationStore = create((set) => ({
  isLoading: false,
  userNotifications: [],

  createNotification: async (title, content, receiverId) => {
    set({ isLoading: true })
    try {
      await axiosInstance.post('/notifications', {
        title,
        content,
        receiverId,
      });
      toast.success('Tạo thông báo mới thành công');
    } catch (err) {
      toast.error('Có lỗi trong khi tạo thông báo!');
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },
  
  getAdminNotifications: async (page = 1, limit = 100) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams({ page, limit }).toString();
      return await axiosInstance.get(`/notifications?${params}`);
    } catch (err) {
      toast.error('Có lỗi trong khi lấy thông báo!');
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  getUserNotifications: async (page, limit) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/notifications?page=${page}&limit=${limit}`);
      set({ userNotifications: res.data });
      return res;
    } catch (err) {
      toast.error('Có lỗi trong khi lấy thông báo!');
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },
}))
