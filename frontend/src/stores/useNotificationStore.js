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
  
  getAdminNotifications: async () => {
    set({ isLoading: true });
    try {
      return (await axiosInstance.get('/notifications')).data;
      // return await fetch('/notification.example.json').then(res => res.json());
    } catch (err) {
      toast.error('Có lỗi trong khi lấy thông báo!');
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  getUserNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get('/notifications');
      toast.success("Lấy dữ liệu thành công");
      return res.data;
      // const res = await fetch('/notifications.example.json');
      // toast.success("Lấy dữ liệu thành công");
      // return res.json();
    } catch (err) {
      toast.error('Có lỗi trong khi lấy thông báo!');
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },
}))
