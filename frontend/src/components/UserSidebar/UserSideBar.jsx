import styles from './UserSidebar.module.css';

function Sidebar({ onChange }) {
  return (
    <div className={styles.sidebar}>
      <h2>Người dùng</h2>
      <nav>
        <ul>
          <li key={1}
            onClick={() => onChange("PersonalInformation")}>
            Thông tin cá nhân
          </li>
          <li key={2}
            onClick={() => onChange("Notification")}>
            Thông báo
          </li>
          <li key={3}
            onClick={() => onChange("RoomInformation")}>
            Thông tin phòng
          </li>
          <li key={4}
            onClick={() => onChange("PaymentHistory")}>
            Lịch sử thanh toán
          </li>
          <li key={5}
            onClick={() => onChange("Payment")}>
            Thanh toán
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;