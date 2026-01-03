import { axiosInstance } from "../lib/axios";
import { create } from "zustand";
import toast from "react-hot-toast";

export const useRoomStore = create((set) => ({
    isLoading: false,
    rooms: [],
    getRooms: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get('/rooms');
            set({ rooms: res.data });
            return res;
        } catch (error) {
            toast.error('Có lỗi khi lấy thông tin phòng');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    getRoomById: async (id) => {
        set({ isLoading: true });
        try {
            return await axiosInstance.get(`/rooms/${id}`);
        } catch (error) {
            toast.error('Có lỗi khi lấy thông tin phòng');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    createRoom: async (data) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.post('/rooms', data);
            set((state) => ({
                rooms: [data, ...state.rooms],
            }));
            toast.success('Tạo phòng mới thành công');
            return res;
        } catch (error) {
            toast.error('Có lỗi khi tạo phòng');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    deleteRoom: async (id) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.delete(`/rooms/${id}`);
            set((state) => ({
                rooms: state.rooms.filter((room) => room.RoomID !== id),
            }));
            toast.success('Xóa phòng thành công');
            return res;
        } catch (error) {
            toast.error('Có lỗi khi xóa phòng');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    addUserToRoom: async (roomId, userId) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.put(`/rooms/assign`, {
                userId,
                roomId,
            });
            toast.success('Thêm người dùng vào phòng thành công');
            return res;
        } catch (error) {
            toast.error('Có lỗi khi thêm người dùng vào phòng');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    removeUserFromRoom: async (userId) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.put(`/rooms/remove/${userId}`);
            toast.success('Xóa người dùng khỏi phòng thành công');
            return res;
        } catch (error) {
            toast.error('Có lỗi khi xóa người dùng khỏi phòng');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    getRoomRequests: async (page, limit, status) => {
        set({ isLoading: true });
        try {
            const params = new URLSearchParams({ page, limit, status });
            return await axiosInstance.get(`/room-requests?${params}`);    
        } catch (error) {
            toast.error('Có lỗi khi lấy danh sách yêu cầu');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    approveRoomRequest: async (requestId) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.put(`/room-requests/${requestId}/approve`);
            toast.success('Phê duyệt yêu cầu thành công');
            return res;
        } catch (error) {
            toast.error('Có lỗi khi phê duyệt yêu cầu');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    rejectRoomRequest: async (requestId) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.put(`/room-requests/${requestId}/reject`);
            toast.success('Từ chối yêu cầu thành công');
            return res;
        } catch (error) {
            toast.error('Có lỗi khi từ chối yêu cầu');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
}));