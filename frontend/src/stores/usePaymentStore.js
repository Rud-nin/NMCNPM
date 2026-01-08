import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const usePaymentStore = create((set) => ({
    isLoading: false,
    isPaying: false,
    unpaidBills: [],
    paidBills: [],

    getPayments: async () => {
        set({ isLoading: true });
        try {
            const res = await axiosInstance.get('/payments/admin/history');
            return res;
        } catch (error) {
            toast.error('Có lỗi khi lấy thông tin các giao dịch');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },

    getUserPaidBills: async (page, limit) => {
        set({ isLoading: true });

        try {
            const res = await axiosInstance.get(`/payments/history?page=${page}&limit=${limit}`);
            set({ paidBills: res.data });
            return res;
        } catch (error) {
            toast.error('Có lỗi khi lấy thông tin các hóa đơn đã thanh toán');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },

    getUserUnpaidBills: async () => {
        set({ isLoading: true });

        try {
            const res = await axiosInstance.get('/payments/unpaid-bills');
            set({ unpaidBills: res.data });
            return res;
        } catch (error) {
            toast.error('Có lỗi khi lấy thông tin các hóa đơn chưa thanh toán');
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },

    payBill: async (billIds) => {
        set({ isPaying: true });

        try {
            const res = await axiosInstance.post('/payments/pay-bills', {
                billIds: billIds,
            });

            set((state) => ({
                unpaidBills: state.unpaidBills.filter(bill => !billIds.includes(bill.BillID)),
            }));

            toast.success("Thanh toán thành công");
            return res;
        } catch (error) {
            toast.error('Có lỗi khi thanh toán hóa đơn');
            console.error(error);     
        } finally {
            set({ isPaying: false });
        }
    }
}))