import { useRoomSelectingStore } from '../../stores/useRoomSelectingStore.js';
// import { useFeedbackStore } from '../../stores/useFeedbackStore.js';
import Button from '../../components/Button/Button.jsx';
import Table from '../Table/Table.jsx';
import styles from './RoomRequests.module.css';
// import Overlay from '../Overlay/Overlay.jsx';
import { useState, useEffect } from 'react';
import { formatDateTime } from '../../lib/formatDateTime.js';

function RoomRequests() {
  // const [feedback, setFeedback] = useState(null);
  // const sendFeedback = useFeedbackStore((s) => s.sendFeedback);

  const {
    roomRequests,
    getRoomRequests,
    cancelRoomRequest,
    isLoadingRequest,
    isCanceling,
  } = useRoomSelectingStore();

  // async function handleSendFeedback() {
  //   await sendFeedback(feedback.title, feedback.content);
  //   setFeedback(null);
  // };

  async function handleFetchRoomRequests() {
    if (isLoadingRequest) return;

    await getRoomRequests();
  };

  async function handleCancelRoomRequest(requestId) {
    if (isCanceling) return;

    await cancelRoomRequest(requestId);
    await getRoomRequests();
  };

  useEffect(() => {
    handleFetchRoomRequests();
  }, []);

  return (
    <section className={styles.roomRequest}>
      <header>
        <h2>Yêu cầu vào phòng</h2>

        {/* <Button
          onClick={() => setFeedback({ title: '', content: '' })}
        >Tạo thắc mắc</Button> */}

      </header>

      <div className={styles.titleBar}>
        <h3>Danh sách yêu cầu</h3>

        <Button
          onClick={handleFetchRoomRequests}
        >
          <i className="fa-solid fa-arrows-rotate"></i>{' '}
          Làm mới
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Số phòng</th>
            <th>Tòa nhà</th>
            <th>Thời gian gửi</th>
            <th>Thời gian xử lý</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {roomRequests && roomRequests.map((roomRequest, index) => (
            <tr key={index + 1}>
              <td>{index + 1}</td>
              <td>{roomRequest.RoomNumber}</td>
              <td>{roomRequest.Building}</td>
              <td>{formatDateTime(roomRequest.CreatedAt)}</td>
              <td>{roomRequest.Proccessed ? formatDateTime(roomRequest.Proccessed) : "Chưa xử lý"}</td>
              <td>
                <span className={`${styles.status} ${styles[roomRequest.Status]}`}>
                  {
                    roomRequest.Status === "Rejected" ? "Từ chối" :
                    roomRequest.Status === "Pending" ? "Chờ duyệt" :
                    roomRequest.Status === "Cancelled" ? "Hủy bỏ" :
                      "Chấp nhận"
                  }
                </span>
              </td>
              <td>
                { roomRequest.Status === "Pending" ? (
                    <Button
                      onClick={() => handleCancelRoomRequest(roomRequest.RequestID)}
                    >
                      Hủy
                    </Button>
                  ) : ("")
                }
              </td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* {feedback && (
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
      )} */}
    </section>
  );
};

export default RoomRequests;
