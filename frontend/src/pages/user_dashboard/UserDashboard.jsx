import UserSidebar from '../../components/UserSidebar/UserSideBar.jsx';
import UserNotification from '../../components/UserNotification/UserNotification.jsx';
import UserPayment from '../../components/UserPayment/UserPayment.jsx';
import UserInformation from '../../components/UserInformation/UserInformation.jsx';
import UserTopUp from '../../components/UserTopUp/UserTopUp.jsx';
import UserService from '../../components/UserService/UserService.jsx';
import UserRoom from '../../components/UserRoom/UserRoom.jsx';
import styles from './UserDashboard.module.css';
import { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore.js';

export default function UserDashboard() {
  const [state, changeState] = useState("Information");
  const logout = useAuthStore(s => s.logout);

  return (
    <div className={styles.wrapper}>
      <UserSidebar
        onChange={(nextState) => changeState(nextState)}
        logout={logout}
      />
      <section className={styles.section}>
        <div className={styles.header}>
        {state === "Information" && <div>Trang thông tin cá nhân</div>}
        {state === "Notification" && <div>Trang thông báo</div>}
        {state === "Room" && <div>Trang thông tin phòng</div>}
        {state === "Service" && <div>Trang dịch vụ</div>}
        {state === "Payment" && <div>Trang thanh toán</div>}
        {state === "TopUp" && <div>Trang nạp tiền</div>}
        </div>
        {state === "Information" && <UserInformation />}
        {state === "Notification" && <UserNotification />}
        {state === "Room" && <UserRoom />}
        {state === "Service" && <UserService />}
        {state === "Payment" && <UserPayment />}
        {state === "TopUp" && <UserTopUp />}
      </section>
    </div>
  );
}
