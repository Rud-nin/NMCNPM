import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { useUserInformationStore } from "../../stores/useUserInformationStore";

export default function UserProtectedRoute() {
    const { authUser, isCheckingAuth } = useAuthStore();
    const { isLoading, user } = useUserInformationStore();

    if (!isLoading && !isCheckingAuth) {
        if (authUser?.Role !== "User") {
            return <Navigate to="/" />
        }

        if (window.location.pathname === "/user" && user?.RoomID === null) {
            return <Navigate to="/rooms" />
        }
    }

    return <Outlet />
}