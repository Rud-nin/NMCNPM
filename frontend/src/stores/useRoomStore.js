import { axiosInstance } from "../lib/axios.js";
import { create } from "zustand";
import toast from "react-hot-toast";

export const useRoomStore = create((set, get) => ({
  isLoading: false,
  userRoom: [],
  users: [],

  fetchUserRoom: async () => {
    set({ isLoading: true });

    try {
      const res = await axiosInstance.get(`/rooms/me`);
      set({ 
        userRoom: res.room,
        users: res.users,  
      });
      return res;
      // const res = await fetch('/userRoom.example.json');
      // const data = await res.json();
      // toast.success("Lấy thông tin thành công");
      // set({ 
      //   userRoom: data.room,
      //   users: data.users,  
      // });
      // return res;
    } catch (error) {
      toast.error('Có lỗi khi lấy thông tin phòng');
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },
}));