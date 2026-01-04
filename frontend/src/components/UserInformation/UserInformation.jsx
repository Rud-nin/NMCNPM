import { useState, useEffect } from "react";
import styles from './UserInformation.module.css';
import Table from "../Table/Table.jsx";
import Button from "../Button/Button.jsx";
import Overlay from "../Overlay/Overlay.jsx";
import { useUserInformationStore } from '../../stores/useUserInformationStore.js';
import { useFeedbackStore } from "../../stores/useFeedbackStore.js";
import { formatDate } from "../../lib/formatDate.js";
import { formatMoney } from "../../lib/formatMoney.js";

const InfoRow = ({ label, value, highlight }) => (
  <div className={styles.infoRow}>
    <span>{label}</span>
    <strong className={highlight ? styles.highlight : ""}>{value}</strong>
  </div>
);

function UserInformation() {
  const [feedback, setFeedback] = useState(null);

  const {
    user,
    fetchUserInformation
  } = useUserInformationStore();

  const {
    sendFeedback
  } = useFeedbackStore();

  const handleSendFeedback = async () => {
    await sendFeedback(feedback.title, feedback.content);
    setFeedback(null);
  };

  const handleFetchUserInformation = async () => {
    await fetchUserInformation();
  }

  useEffect(() => {
    handleFetchUserInformation();
  }, []);

  return (
    <div className={styles.userInformation}>
      <header>
        <h2>Thông tin cá nhân</h2>

        <Button
          onClick={() => setFeedback({ title: '', content: '' })}
        >Tạo phản hồi</Button>

      </header>

      <section className={styles.infoCard}>
        <InfoRow label="Họ và tên" value={user.FullName} />
        <InfoRow label="Email" value={user.Email} />
        <InfoRow label="Ngày sinh" value={formatDate(user.BirthDate)} />
        <InfoRow label="Mã số sinh viên" value={user.StudentID} />
        <InfoRow label="Số CCCD" value={user.ID} />
        <InfoRow label="Vai trò" value={user.Role === "User" ? "Người dùng" : "Admin"} />
        <InfoRow label="Số phòng" value={user.RoomNumber} />
        <InfoRow label="Tòa nhà" value={user.Building} />
        <InfoRow
          label="Số dư"
          value={formatMoney(user.Balance)}
          highlight
        />
        <InfoRow
          label="Số nợ"
          value={formatMoney(user.TotalDebt)}
          highlight
        />
      </section>

      {user?.UnpaidBills &&
        <section className={styles.unpaidBills}>
          <div className={styles.titleBar}>
            <h3>Danh sách hóa đơn chưa thanh toán</h3>

            <Button
              onClick={handleFetchUserInformation}
            >
              <i className="fa-solid fa-arrows-rotate"></i>{' '}
              Làm mới
            </Button>
          </div>

          <Table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên dịch vụ</th>
                <th>Loại dịch vụ</th>
                <th>Kỳ thu</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {user?.UnpaidBills && user?.UnpaidBills.map((bill, index) => (
                <tr key={index + 1}>
                  <td>{index + 1}</td>
                  <td>{bill.ServiceName}</td>
                  <td>{bill.UserID ? "Cá nhân" : "Phòng"}</td>
                  <td>{bill.Period}</td>
                  <td>{formatMoney(bill.Price)}</td>
                  <td>
                    <span className={styles.status}>{"Chưa thanh toán"}</span>
                  </td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className={styles.totalPayment}>
            <h3>Tổng nợ: {formatMoney(user.TotalDebt)}</h3>
          </div>
        </section>
      }

      {feedback && (
        <Overlay>
          <div className={styles.modal}>
            <h2>Nhập phản hồi mới</h2>
            <div className={styles.input}>
              <span>Tiêu đề</span>
              <input
                type="text"
                value={feedback.title}
                placeholder="Nhập tiêu đề phản hồi"
                onChange={(e) => setFeedback({ ...feedback, title: e.target.value })} />
            </div>
            <div className={styles.input}>
              <span>Nội dung</span>
              <textarea
                type="text"
                value={feedback.content}
                placeholder="Nhập nội dung phản hồi"
                onChange={(e) => setFeedback({ ...feedback, content: e.target.value })} />
            </div>
            <div className={styles.buttonContainer}>
              <Button onClick={handleSendFeedback}>Gửi</Button>
              <Button onClick={() => setFeedback(null)}>Hủy</Button>
            </div>
          </div>
        </Overlay>
      )}


    </div>
  );
}

export default UserInformation;