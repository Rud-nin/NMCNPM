import UserSidebar from '../../components/UserSidebar/UserSideBar.jsx';
import UserNotification from '../../components/UserNotification/UserNotification.jsx';
import UserTopUp from '../../components/UserTopUp/UserTopUp.jsx';
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
        {state === "Room" && <div>Thông tin phòng</div>}
        {state === "Payment" && <div>Thanh toán</div>}
        {state === "TopUp" && <div>Nạp tiền</div>}
          <button>Làm mới</button>
        </div>
        {state === "PersonalInformation" && <PersonalInformation />}
        {state === "Notification" && <UserNotification />}
        {state === "Room" && <Room />}
        {state === "Payment" && <Payment />}
        {state === "TopUp" && <UserTopUp />}
      </section>
    </div>
  );
}

function PersonalInformation() {

}
function Room() { }
function Payment() {

}