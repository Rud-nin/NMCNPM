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
            const res = await axiosInstance.get(`/services?${params}`);
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
            set((state) => ({
                services: [...state.services, data],
            }));
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


    // user
    userServices: [],

    getUserServices: async (page, limit) => {
        set({ isLoading: true });
        
        try {
            const res = await axiosInstance.get(`/services?page=${page}&limit=${limit}`);
            set({ userServices: res });
            return res;
        } catch (error) {
            toast.error('Có lỗi khi lấy thông tin dịch vụ');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
}));