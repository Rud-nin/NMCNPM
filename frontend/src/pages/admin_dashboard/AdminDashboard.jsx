import AdminNotification from "../../components/AdminNotification/AdminNotification";
import System from "../../components/PaymentHistory/PaymentHistory";
import UserManagement from "../../components/UserManagement/UserManagement";
import RoomManagement from "../../components/RoomManagement/RoomManagement";
import ServiceManagement from "../../components/ServiceManagement/ServiceManagement";
import { useAuthStore } from "../../stores/useAuthStore";
import { useState } from "react";
import styles from "./AdminDashboard.module.css";

const states = {
    "Notification": {
        translated: "Thông báo",
        component: <AdminNotification />
    },
    "User": {
        translated: "Quản lý người dùng",
        component: <UserManagement />
    },
    "Room": {
        translated: "Quản lý phòng",
        component: <RoomManagement />
    },
    "Service": {
        translated: "Quản lý dịch vụ",
        component: <ServiceManagement />
    },
    "Sys": {
        translated: "Hệ thống",
        component: <System />
    }
}

function Sidebar({ onChange }) {
    const logout = useAuthStore(s => s.logout);
    
    return (
        <div className={styles.sidebar}>
            <h2>Admin</h2>
            <nav>
                <ul>
                    {Object.entries(states).map(([key, value]) => (
                        <li key={key}
                            onClick={() => onChange(key)}>
                            {value.translated}
                        </li>
                    ))}
                    <li
                        onClick={() => logout()}
                    >
                        Đăng xuất
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default function AdminDashboard() {
    const [state, changeState] = useState(Object.keys(states)[0]);

    return (
        <div className={styles.wrapper}>
            <Sidebar
                onChange={(nextState) => changeState(nextState)}
            />
            <section className={styles.section}>
                <div className={styles.header}>
                    <div>{states[state].translated}</div>
                </div>
                {states[state].component}
            </section>
        </div>
    );
}