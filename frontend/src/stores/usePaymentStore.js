import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const usePaymentStore = create((set) => ({
    isLoading: false,
    getPayments: async () => {
        set({ isLoading: true });
        try {
            return (await axiosInstance.get('/payments')).data;
            // return await fetch('/paymentsData.example.json').then(res => res.json());
        } catch (error) {
            toast.error('Có lỗi khi lấy thông tin các giao dịch');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    }
}))