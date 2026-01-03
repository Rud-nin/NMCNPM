import { useState, useEffect } from "react";
import styles from './UserRoom.module.css';
import Table from "../Table/Table.jsx";
import Button from "../Button/Button.jsx";
import Overlay from "../Overlay/Overlay.jsx";
import { useRoomStore } from '../../stores/useRoomStore.js';
import { useFeedbackStore } from "../../stores/useFeedbackStore.js";
import { formatDate } from "../../lib/formatDate.js";

const InfoRow = ({ label, value, highlight }) => (
  <div className={styles.infoRow}>
    <span>{label}</span>
    <strong className={highlight ? styles.highlight : ""}>{value}</strong>
  </div>
);

function UserRoom() {
  const [feedback, setFeedback] = useState(null);

  const {
    userRoom,
    users,
    fetchUserRoom
  } = useRoomStore();

  const {
    sendFeedback
  } = useFeedbackStore();

  const handleSendFeedback = async () => {
    await sendFeedback(feedback.title, feedback.content);
    setFeedback(null);
  };

  const handleFetchRoom = async () => {
    await fetchUserRoom();
  }

  useEffect(() => {
    fetchUserRoom();
  }, []);

  return (
    <div className={styles.userRoom}>
      <header>
        <h2>Thông tin phòng</h2>

        <Button
          onClick={() => setFeedback({ title: '', content: '' })}
        >Tạo phản hồi</Button>

      </header>

      <section className={styles.infoCard}>
        <InfoRow label="Số phòng" value={userRoom.RoomNumber} />
        <InfoRow label="Tòa nhà" value={userRoom.Building} />
        <InfoRow label="Số thành viên tối đa" value={userRoom.Capacity} />
        <InfoRow label="Số thành viên hiện có" value={userRoom.Occupancy} />
      </section>

      {users &&
        <section className={styles.users}>
          <div className={styles.titleBar}>
            <h3>Danh sách thành viên</h3>

            <Button
              onClick={handleFetchRoom}
            >
              <i className="fa-solid fa-arrows-rotate"></i>{' '}
              Làm mới
            </Button>
          </div>

          <Table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Mã số sinh viên</th>
                <th>Ngày sinh</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, index) => (
                <tr key={index + 1}>
                  <td>{index + 1}</td>
                  <td>{user.FullName}</td>
                  <td>{user.Email}</td>
                  <td>{user.StudentID}</td>
                  <td>{formatDate(user.BirthDate)}</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </Table>
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

export default UserRoom;