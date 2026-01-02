import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useUsersStore = create((set, get) => ({
    users: [],
    isLoading: false,
    getUsers: async (page = 1, limit = 20) => {
        set({ isLoading: true });
        try {
            const params = new URLSearchParams({ page, limit }).toString();
            const res = await axiosInstance.get(`/users?${params}`);
            set({ users: res.data });
            return res;
        } catch (error) {
            toast.error("Có lỗi xảy ra khi lấy danh sách người dùng");
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    getUserById: async (id) => {
        set({ isLoading: true });
        try {
            return await axiosInstance.get(`/users/${id}`);
        } catch (error) {
            toast.error("Có lỗi xảy ra khi lấy thông tin người dùng");
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    getUserByName: async (name) => {
        set({ isLoading: true });
        try {
            return await axiosInstance.get(`/users?name=${name}`);
        } catch (error) {
            toast.error("Có lỗi xảy ra khi tìm kiếm người dùng");
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    createUser: async (data) => {
        set({ isLoading: true });
        try {
            const user = await axiosInstance.post("/users", data);
            toast.success("Tạo người dùng mới thành công");
            return user;
        } catch (error) {
            toast.error("Có lỗi xảy ra khi tạo người dùng mới");
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    updateUser: async (id, data) => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.put(`/users/${id}`, data);
            // set((state) => ({
            //     users: state.users.map((user) => {
            //         user.UserID === id ? data : user;
            //     })
            // }))
            toast.success("Cập nhật người dùng thành công");
            return res;
        } catch (error) {
            toast.error("Có lỗi xảy ra khi cập nhật người dùng");
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    deleteUser: async (id) => {
        set({ isLoading: true });
        try {
            await axiosInstance.delete(`/users/${id}`);
            set((state) => ({
                users: state.users.filter((user) => user.UserID !== id),
            }))
            toast.success("Xóa người dùng thành công");
        } catch (error) {
            toast.error("Có lỗi xảy ra khi xóa người dùng");
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    }
}));