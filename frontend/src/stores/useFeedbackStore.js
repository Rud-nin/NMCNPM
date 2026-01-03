import { create } from 'zustand';
import { axiosInstance } from '../lib/axios.js';
import toast from 'react-hot-toast';

export const useFeedbackStore = create((set, get) => ({
  isSending: false,

  sendFeedback: async (title, content) => {
    set({ isSending: true })
    try {
      await axiosInstance.post('/feedbacks', {
        title,
        content,
      });
      toast.success('Tạo phản hồi mới thành công');
    } catch (err) {
      toast.error('Có lỗi trong khi tạo phản hồi !');
      console.error(err);
    } finally {
      set({ isSending: false });
    }
  },
  getFeedbacks: async (page, limit) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams({ page, limit }).toString();
      return await axiosInstance.get(`/feedbacks?${params}`);
    } catch (err) {
      toast.error('Có lỗi trong khi lấy thông tin phản hồi !');
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  }
}));