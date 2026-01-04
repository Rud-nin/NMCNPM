import RoomList from '../../components/RoomList/RoomList.jsx';
import RoomRequests from '../../components/RoomRequests/RoomRequests.jsx';
import { useAuthStore } from '../../stores/useAuthStore.js';
import styles from './RoomSelecting.module.css';
import { useState } from 'react';

export default function RoomSelecting() {
  const [state, changeState] = useState("RoomList");
  const { logout } = useAuthStore();

  return (
    <div className={styles.wrapper}>
      <Sidebar
        onChange={(nextState) => changeState(nextState)}
        logout={logout}
      />
      <section className={styles.section}>
        <div className={styles.header}>
        {state === "RoomList" && <div>Trang chọn phòng</div>}
        {state === "RoomRequests" && <div>Trang danh sách yêu cầu</div>}
        </div>

        {state === "RoomList" && <RoomList />}
        {state === "RoomRequests" && <RoomRequests />}
      </section>
    </div>
  );
};

function Sidebar({ onChange, logout }) {
  return (
    <div className={styles.sidebar}>
      <h2>Người dùng</h2>
      <nav>
        <ul>
          <li key={1}
            onClick={() => onChange("RoomList")}>
            Danh sách phòng
          </li>
          <li key={2}
            onClick={() => onChange("RoomRequests")}>
            Danh sách yêu cầu
          </li>
          <li key={3}
            onClick={() => logout()}>
            Đăng xuất
          </li>
        </ul>
      </nav>
    </div>
  );
}



