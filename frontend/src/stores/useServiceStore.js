import { axiosInstance } from "../lib/axios";
import { create } from "zustand";
import toast from "react-hot-toast";

export const useServiceStore = create((set) => ({
    isLoading: false,
    services: [],
    getServices: async (limit = 100, page = 1) => {
        set({ isLoading: true });
        try {
            const params = new URLSearchParams({ limit, page }).toString();
            const res = await axiosInstance.get(`/services/all?${params}`);
            set({ services: res.data });
            return res;
        } catch (error) {
            toast.error('Có lỗi khi lấy thông tin dịch vụ');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    createService: async (data) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.post('/services', data);
            toast.success('Tạo dịch vụ mới thành công');
            return res;
        } catch (error) {
            toast.error('Có lỗi khi tạo dịch vụ');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    updateService: async (id, data) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.put(`/services/${id}`, data);
            // set((state) => ({
            //     services: state.services.map((service) => {
            //         service.ServiceID === id ? { ...service, ...data } : service;
            //     })
            // }));
            toast.success('Cập nhật dịch vụ thành công');
            return res;
        } catch (error) {
            toast.error('Có lỗi khi cập nhật dịch vụ');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    deleteService: async (id) => {
        set({ isLoading: true });
        try {
            await axiosInstance.delete(`/services/${id}`);
            set((state) => ({
                services: state.services.filter((service) => service.ServiceID !== id),
            }));
            toast.success('Xóa dịch vụ thành công');
        } catch (error) {
            toast.error('Có lỗi khi xóa dịch vụ');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    getUserServicesById: async (id) => {
        set({ isLoading: true });
        try {
            return await axiosInstance.get(`/services/users/${id}`);
        } catch (error) {
            toast.error('Có lỗi khi lấy thông tin dịch vụ');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    assignServiceToUser: async (ServiceID, UserID) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.post(`/services/users/assign`, {
                ServiceID,
                UserID,
            });
            toast.success('Phân phối dịch vụ thành công');
            return res;
        } catch (error) {
            toast.error('Có lỗi khi phân phối dịch vụ');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    removeServiceFromUser: async (ServiceID, UserID) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.delete(`/services/users/remove`, {
                data: {
                    ServiceID,
                    UserID,
                },
            });
            toast.success('Xóa dịch vụ khỏi người dùng thành công');
            return res;
        } catch (error) {
            toast.error('Có lỗi khi xóa dịch vụ khỏi người dùng');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    getRoomServicesById: async (id) => {
        set({ isLoading: true });
        try {
            return await axiosInstance.get(`/services/rooms/${id}`);
        } catch (error) {
            toast.error('Có lỗi khi lấy thông tin dịch vụ');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    assignServiceToRoom: async (ServiceID, RoomID) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.post(`/services/rooms/assign`, {
                ServiceID,
                RoomID,
            });
            toast.success('Phân phối dịch vụ thành công');
            return res;
        } catch (error) {
            toast.error('Có lỗi khi phân phối dịch vụ');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    removeServiceFromRoom: async (ServiceID, RoomID) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.delete(`/services/rooms/remove`, {
                data: {
                    ServiceID,
                    RoomID,
                }
            });
            toast.success('Xóa dịch vụ khỏi phòng thành công');
            return res;
        } catch (error) {
            toast.error('Có lỗi khi xóa dịch vụ khỏi phòng');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    newBill: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.post('/services/generate-bills');
            toast.success('Tạo hóa đơn thành công');
            return res;
        } catch (error) {
            toast.error('Có lỗi khi tạo hóa đơn');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },

    // user
    userServices: [],
    roomServices: [],
    isLoadingUserServices: false,
    isLoadingRoomServices: false,

    getUserServices: async () => {
        set({ isLoadingUserServices: true });
        
        try {
            const res = await axiosInstance.get(`/services/users`);
            set({ userServices: res.data });
            return res;
        } catch (error) {
            toast.error('Có lỗi khi lấy thông tin dịch vụ của người dùng');
            console.error(error);
        } finally {
            set({ isLoadingUserServices: false });
        }
    },

    getRoomServices: async () => {
        set({ isLoadingRoomServices: true });
        
        try {
            const res = await axiosInstance.get(`/services/rooms`);
            set({ roomServices: res.data });
            return res;
        } catch (error) {
            toast.error('Có lỗi khi lấy thông tin dịch vụ của phòng');
            console.error(error);
        } finally {
            set({ isLoadingRoomServices: false });
        }
    },
}));