import Notification from "../../components/Notification/Notification";
import PaymentHistory from "../../components/PaymentHistory/PaymentHistory";
import UserManagement from "../../components/UserManagement/UserManagement";
import RoomManagement from "../../components/RoomManagement/RoomManagement";
import { useState } from "react";
import styles from "./AdminDashboard.module.css";

function Sidebar({ onChange }) {
    
    return (
        <div className={styles.sidebar}>
            <h2>Admin</h2>
            <nav>
                <ul>
                    <li key={1}
                        onClick={() => onChange("Dashboard")}>
                        Bảng điều kiển
                    </li>
                    <li key={2}
                        onClick={() => onChange("User")}>
                        Người dùng
                    </li>
                    <li key={3}
                        onClick={() => onChange("Room")}>
                        Phòng
                    </li>
                    <li key={4}
                        onClick={() => onChange("Setting")}>
                        Cài đặt
                    </li>
                    <li key={5}
                        onClick={() => onChange("Dev")}>
                        Đội phát triển
                    </li>
                </ul>
            </nav>
        </div>
    );
}

function Dashboard() {
    return (
        <div>
            <Notification />
            <PaymentHistory />
        </div>
    );
}
function Setting() {}
function Dev() {}

export default function AdminDashboard() {
    const [state, changeState] = useState("Dashboard");

    return (
        <div className={styles.wrapper}>
            <Sidebar
                onChange={(nextState) => changeState(nextState)}
            />
            <section className={styles.section}>
                <div className={styles.header}>
                    <div>{state}</div>
                    <button>Làm mới</button>
                </div>
                { state === "Dashboard" && <Dashboard /> }
                { state === "User" && <UserManagement /> }
                { state === "Room" && <RoomManagement /> }
                { state === "Setting" && <Setting /> }
                { state === "Dev" && <Dev /> }
            </section>
        </div>
    );
}