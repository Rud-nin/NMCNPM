import UserSidebar from '../../components/UserSidebar/UserSideBar.jsx';
import UserNotification from '../../components/UserNotification/UserNotification.jsx';
import styles from './UserDashboard.module.css';
import { useState } from 'react';

export default function UserDashboard() {
  const [state, changeState] = useState("PersonalInformation");

  return (
    <div className={styles.wrapper}>
      <UserSidebar
        onChange={(nextState) => changeState(nextState)}
      />
      <section className={styles.section}>
        <div className={styles.header}>
        {state === "PersonalInformation" && <div>Thông tin cá nhân</div>}
        {state === "Notification" && <div>Thông báo</div>}
        {state === "RoomInformation" && <div>Thông tin phòng</div>}
        {state === "PaymentHistory" && <div>Lịch sử thanh toán</div>}
        {state === "Payment" && <div>Thanh toán</div>}
          <button>Làm mới</button>
        </div>
        {state === "PersonalInformation" && <PersonalInformation />}
        {state === "Notification" && <UserNotification />}
        {state === "RoomInformation" && <RoomInformation />}
        {state === "PaymentHistory" && <PaymentHistory />}
        {state === "Payment" && <Payment />}
      </section>
    </div>
  );
}

function PersonalInformation() {

}
function RoomInformation() { }
function PaymentHistory() { }
function Payment() {

}