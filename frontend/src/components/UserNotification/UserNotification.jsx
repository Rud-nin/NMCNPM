import { useNotificationStore } from '../../stores/useNotificationStore.js';
import { useFeedbackStore } from '../../stores/useFeedbackStore.js';
import Button from '../../components/Button/Button.jsx';
import Table from '../Table/Table.jsx';
import styles from './UserNotification.module.css';
import Overlay from '../Overlay/Overlay.jsx';
import { useState, useEffect } from 'react';
import { formatDateTime } from '../../lib/formatDateTime.js';
import Pagination from '../Pagination/Pagination.jsx';

function UserNotification() {
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState(null);
  const getUserNotifications = useNotificationStore((s) => s.getUserNotifications);
  const sendFeedback = useFeedbackStore((s) => s.sendFeedback);
  const notifications = useNotificationStore(s => s.userNotifications);

  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);

  async function handleSearchNotifications() {
    console.log("TODO: search services");
  };

  async function handleSendFeedback() {
    await sendFeedback(feedback.title, feedback.content);
    setFeedback(null);
  };

  async function handleFetchNotifications() {
    const res = await getUserNotifications(page, limit);
    if (res) {
      const { pagination } = res;
      setLimit(pagination.limit);
      setPage(pagination.page);
      setTotal(pagination.totalPages);
    }
  };

  useEffect(() => {
    handleFetchNotifications();
  }, [limit, page]);

  return (
    <section className={styles.notification}>
      <header>
        <h2>Danh sách thông báo</h2>

        <Button
          onClick={() => setFeedback({ title: '', content: '' })}
        >Tạo phản hồi</Button>

      </header>

      <div className={styles.search}>
        <input
          type="text"
          placeholder="Tìm kiếm tên thông báo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.buttonContainer}>
          <Button
            onClick={handleSearchNotifications}
          >
            <i className="fa-solid fa-magnifying-glass"></i>{' '}
            Tìm kiếm
          </Button>
          <Button
            onClick={handleFetchNotifications}
          >
            <i className="fa-solid fa-arrows-rotate"></i>{' '}
            Làm mới
          </Button>
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
          {notifications && notifications.map((noti, index) => (
            <tr key={index + 1}>
              <td>{index + 1}</td>
              <td>{noti.Title}</td>
              <td>{noti.Content}</td>
              <td>{formatDateTime(noti.CreatedAt)}</td>
              <td>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className={styles.pagination}>
        <Pagination
          limit={limit}
          setLimit={setLimit}
          page={page}
          setPage={setPage}
          total={total} />
      </div>

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
    </section>
  );
};

export default UserNotification;
