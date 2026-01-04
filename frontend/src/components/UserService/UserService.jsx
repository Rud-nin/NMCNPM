import { useServiceStore } from '../../stores/useServiceStore.js';
import { useFeedbackStore } from '../../stores/useFeedbackStore.js';
import Button from '../../components/Button/Button.jsx';
import Table from '../Table/Table.jsx';
import styles from './UserService.module.css';
import Overlay from '../Overlay/Overlay.jsx';
import { useState, useEffect } from 'react';
import Pagination from '../Pagination/Pagination.jsx';
import { formatMoney } from '../../lib/formatMoney.js';

function UserService() {
  const [feedback, setFeedback] = useState(null);
  const sendFeedback = useFeedbackStore((s) => s.sendFeedback);
  const {
    userServices,
    getUserServices
  } = useServiceStore();

  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);


  async function handleSendFeedback() {
    await sendFeedback(feedback.title, feedback.content);
    setFeedback(null);
  };

  async function handleFetchServices() {
    const res = await getUserServices(page, limit);
    if (res) {
      const { pagination } = res;
      setTotal(pagination.totalPages);
    }
  };

  useEffect(() => {
    handleFetchServices();
  }, [limit, page]);

  return (
    <section className={styles.userService}>
      <header>
        <h2>Dịch vụ</h2>

        <Button
          onClick={() => setFeedback({ title: '', content: '' })}
        >Tạo phản hồi</Button>

      </header>

      <div className={styles.titleBar}>
        <h3>Danh sách dịch vụ</h3>

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
            <th>Loại dịch vụ</th>
            <th>Mô tả</th>
            <th>Giá dịch vụ</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {userServices && userServices.map((service, index) => (
            <tr key={index + 1}>
              <td>{index + 1}</td>
              <td>{service.ServiceName}</td>
              <td>{(service.Type === "Personal") ? "Phòng" : "Cá nhân"}</td>
              <td>{service.Descriptions}</td>
              <td>{formatMoney(service.Price)}</td>
              <td></td>
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

export default UserService;
