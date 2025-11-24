import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

export const useNotificationStore = create((set) => ({
  isLoading: false,
  createNotification: async (title, content) => {
    set({ isLoading: true })
    try {
      await axiosInstance.post('/notifications', {
        title,
        content,
      });
      toast.success('Tạo thông báo mới thành công');
    } catch (err) {
      toast.error('Có lỗi trong khi tạo thông báo!');
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },
  getNotifications: async () => {
    set({ isLoading: true });
    try {
      return await axiosInstance.get('/notifications');
      // return await fetch('/notification.example.json').then(res => res.json());
    } catch (err) {
      toast.error('Có lỗi trong khi lấy thông báo!');
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },
}))
