import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";

export default function AdminProtectedRoute() {
    const { authUser, isCheckingAuth: isLoading } = useAuthStore();

    if (!isLoading) {
        if (authUser?.Role !== "Admin") {
            return <Navigate to="/" />
        }
    }

    return <Outlet/>
}