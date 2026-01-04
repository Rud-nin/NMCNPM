import styles from './UserSidebar.module.css';
import { useAuthStore } from '../../stores/useAuthStore.js';

function Sidebar({ onChange, logout }) {
  return (
    <div className={styles.sidebar}>
      <h2>Người dùng</h2>
      <nav>
        <ul>
          <li key={1}
            onClick={() => onChange("Information")}>
            Thông tin cá nhân
          </li>
          <li key={2}
            onClick={() => onChange("Room")}>
            Thông tin phòng
          </li>
          <li key={3}
            onClick={() => onChange("Notification")}>
            Thông báo
          </li>
          <li key={4}
            onClick={() => onChange("Service")}>
            Dịch vụ
          </li>
          <li key={5}
            onClick={() => onChange("Payment")}>
            Thanh toán
          </li>
          <li key={6}
            onClick={() => onChange("TopUp")}>
            Nạp tiền
          </li>
          <li key={7}
            onClick={() => logout()}>
            Đăng xuất
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;