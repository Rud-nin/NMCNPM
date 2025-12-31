import { useNotificationStore } from '../../stores/useNotificationStore.js';
import { useFeedbackStore } from '../../stores/useFeedbackStore.js';
import Button from '../../components/Button/Button.jsx';
import Table from '../Table/Table.jsx';
import styles from './UserNotification.module.css';
import Overlay from '../Overlay/Overlay.jsx';
import { useState, useEffect } from 'react';

function UserNotification() {
  const [notifications, setNotifications] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [sort, setSort] = useState("new-to-old");
  const getUserNotifications = useNotificationStore((s) => s.getUserNotifications);
  const sendFeedback = useFeedbackStore((s) => s.sendFeedback);

  async function fetchNoti() {
    const data = await getUserNotifications();
    if (data) setNotifications(data);
  }

  async function handleSendFeedback() {
    await sendFeedback(feedback.title, feedback.content);
    setFeedback(null);
  }

  useEffect(() => {
    fetchNoti();
  }, []);

  const sortedNotifications = notifications.sort((a, b) => {
    if (sort === "new-to-old") {
      return new Date(b.CreatedAt) - new Date(a.CreatedAt);
    }
    return new Date(a.CreatedAt) - new Date(b.CreatedAt);
  });

  return (
    <section className={styles.notification}>
      <header>
        <h2>Thông báo</h2>
        <div className={styles.btnContainer}>
          <Button
            onClick={() => setFeedback({ title: '', content: '' })}
          >Tạo phản hồi</Button>
          <Button
            onClick={fetchNoti}
          >Làm mới</Button>
        </div>
      </header>

      <div className={styles.titleBar}>
        <h3>Danh sách thông báo đã nhận</h3>

        <div className={styles.selectWrap}>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={styles.select}
          >
            <option value="new-to-old">Từ mới đến cũ</option>
            <option value="old-to-new">Từ cũ đến mới</option>
          </select>
        </div>
      </div>

      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tiêu đề</th>
            <th>Nội dung</th>
            <th>Thời gian</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedNotifications && sortedNotifications.map((noti) => (
            <tr>
              <td>{noti.NotificationID}</td>
              <td>{noti.Title}</td>
              <td>{noti.Content}</td>
              <td>{formatDateTime(noti.CreatedAt)}</td>
              <td>
              </td>
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
            <div className={styles.btnContainer}>
              <Button onClick={handleSendFeedback}>Gửi</Button>
              <Button onClick={() => setFeedback(null)}>Hủy</Button>
            </div>
          </div>
        </Overlay>
      )}
    </section>
  );
}

function formatDateTime(dateTimeString) {
  const dateTime = new Date(dateTimeString);

  const hh = String(dateTime.getHours()).padStart(2, "0");
  const mm = String(dateTime.getMinutes()).padStart(2, "0");
  const ss = String(dateTime.getSeconds()).padStart(2, "0");

  const day = String(dateTime.getDate()).padStart(2, "0");
  const month = String((dateTime.getMonth() + 1)).padStart(2, "0");
  const year = String(dateTime.getFullYear());

  return `${hh}:${mm}:${ss} ${day}:${month}:${year}`;
}

export default UserNotification;
