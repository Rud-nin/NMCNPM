import { create } from "zustand";
import { axiosInstance } from '../lib/axios.js';
import toast from "react-hot-toast";

export const useRoomSelectingStore = create((set, get) => ({
  isLoadingRoom: false,
  isLoadingRequest: false,
  isSending: false,
  isCanceling: false,
  roomRequests: [],
  rooms: [],

  getRooms: async (page = 1, limit = 10) => {
    set({ isLoadingRoom: true });

    try {
      const res = await axiosInstance.get(`/rooms/available?page=${page}&limit=${limit}`);
      set({ rooms: res.data });
      return res;
    } catch (error) {
      toast.error('Có lỗi trong khi lấy danh sách phòng trống!');
      console.error(error);
    } finally {
      set({ isLoadingRoom: false });
    }
  },

  getRoomRequests: async () => {
    set({ isLoadingRequest: true });

    try {
      const res = await axiosInstance.get('/room-requests/me');
      set({ roomRequests: res.data });
      return res;
    } catch (error) {
      toast.error('Có lỗi trong khi lấy danh sách phòng trống!');
      console.error(error);
    } finally {
      set({ isLoadingRequest: false });
    }
  },

  sendRoomRequest: async (roomId) => {
    set({ isSending: true });

    try {
      const res = await axiosInstance.post('/room-requests', {
        RoomID: roomId,
      });
      toast.success("Gửi yêu cầu vào phòng thành công");
      return res;
    } catch (error) {
      toast.error('Có lỗi khi gửi yêu cầu vào phòng!');
      console.error(error);
    } finally {
      set({ isSending: false });
    }
  },

  cancelRoomRequest: async (requestId) => {
    set({ isCanceling: true });

    try {
      const res = await axiosInstance.delete(`/room-requests/${requestId}`);
      toast.success("Hủy yêu cầu vào phòng thành công");
      return res;
    } catch (error) {
      toast.error('Có lỗi khi hủy yêu cầu vào phòng!');
      console.error(error);
    } finally {
      set({ isCanceling: false });
    }
  },

  hasPendingRequest: async () => {
    const roomRequests = get().roomRequests;
    const pendingRequest = roomRequests.filter((request) => request.Status === "Pending");

    if (pendingRequest.length) {
      return true;
    }
    return false;
  },

}));