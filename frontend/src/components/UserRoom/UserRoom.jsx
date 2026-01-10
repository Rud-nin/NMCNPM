import { useState, useEffect } from "react";
import styles from './UserRoom.module.css';
import Table from "../Table/Table.jsx";
import Button from "../Button/Button.jsx";
import Overlay from "../Overlay/Overlay.jsx";
import { useRoomStore } from '../../stores/useRoomStore.js';
import { useFeedbackStore } from "../../stores/useFeedbackStore.js";
import { formatDate } from "../../lib/formatDate.js";
import { formatMoney } from '../../lib/formatMoney.js';
import { useServiceStore } from "../../stores/useServiceStore.js";

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
    fetchUserRoom
  } = useRoomStore();

  const {
    sendFeedback
  } = useFeedbackStore();

  const {
    roomServices,
    getRoomServices
  } = useServiceStore();

  const handleSendFeedback = async () => {
    await sendFeedback(feedback.title, feedback.content);
    setFeedback(null);
  };

  const handleFetchRoom = async () => {
    await fetchUserRoom();
  };

  const handleFetchServices = async () => {
    await getRoomServices();
  };

  useEffect(() => {
    const handleFetch = async () => {
      await fetchUserRoom();
      await handleFetchServices();
    };
    
    handleFetch();
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
        <InfoRow label="Số phòng" value={userRoom?.room.RoomNumber} />
        <InfoRow label="Tòa nhà" value={userRoom?.room.Building} />
        <InfoRow label="Số thành viên tối đa" value={userRoom?.room.Capacity} />
        <InfoRow label="Số thành viên hiện có" value={userRoom?.room.Occupancy} />
      </section>

      {userRoom?.users &&
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
                <th>Ngày sinh</th>
                <th>Quê quán</th>
                <th>Chủ hộ</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {userRoom?.users.map((user, index) => (
                <tr key={index + 1}>
                  <td>{index + 1}</td>
                  <td>{user.FullName}</td>
                  <td>{user.Email}</td>
                  <td>{formatDate(user.BirthDate)}</td>
                  <td>{user.HomeTown}</td>
                  <td>
                    {user.UserID === userRoom.room.OwnerID ? (
                      <span className={styles.yes}>Có</span>
                    ) : (
                      <span className={styles.no}>Không</span>
                    )}
                  </td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      }

      <div className={styles.titleBar}>
        <h3>Danh sách dịch vụ của phòng</h3>

        <Button
          onClick={handleFetchServices}
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
            <th>Mô tả</th>
            <th>Giá dịch vụ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {roomServices && roomServices.map((service, index) => (
            <tr key={index + 1}>
              <td>{index + 1}</td>
              <td>{service.ServiceName}</td>
              <td>{service.Descriptions}</td>
              <td>{formatMoney(service.Price)}</td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </Table>

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