import { useEffect, useState } from "react";
import styles from "./RoomList.module.css";
import { useRoomSelectingStore } from "../../stores/useRoomSelectingStore.js";
import { useFeedbackStore } from '../../stores/useFeedbackStore.js';
import Button from "../Button/Button.jsx";
import Pagination from "../Pagination/Pagination.jsx";
import Overlay from "../Overlay/Overlay.jsx";
import Table from "../Table/Table.jsx";
import toast from "react-hot-toast";

export default function RoomList() {
  const [feedback, setFeedback] = useState(null);
  const [limit, setLimit] = useState(9);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);

  const sendFeedback = useFeedbackStore((s) => s.sendFeedback);

  const {
    rooms,
    getRooms,
    isLoadingRoom,
    isSending,
    hasPendingRequest,
    sendRoomRequest,
    getRoomRequests,
  } = useRoomSelectingStore();

  async function handleSendFeedback() {
    await sendFeedback(feedback.title, feedback.content);
    setFeedback(null);
  };  

  async function handleFetchRooms() {
    if (isLoadingRoom) return;

    const res = await getRooms(page, limit);
    if (res) {
      const { pagination } = res;
      setTotal(pagination.totalPages);
    }

  };

  async function handleSelectRoom(room) {
    if (isSending) return;

    const isPending = await hasPendingRequest();

    if (isPending) {
      toast.error("Bạn đã gửi yêu cầu vào một phòng. Vui lòng chờ duyệt nhé.");
    } else {
      await sendRoomRequest(room.RoomID);
      await getRoomRequests();
    }
  };

  useEffect(() => {
    handleFetchRooms();
  }, [page, limit]);

  return (
    <section className={styles.rooms}>
      <header>
        <h2>Chọn một phòng</h2>

        <Button
          onClick={() => setFeedback({ title: '', content: '' })}
        >Tạo phản hồi</Button>

      </header>

      <div className={styles.titleBar}>
        <h3>Danh sách phòng trống</h3>

        <Button
          onClick={handleFetchRooms}
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
            <th>Thành viên</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rooms && rooms.map((room, index) => {
            const isAvailable = room.Capacity > room.Occupancy;
          
            return (
              <tr key={index + 1}>
                <td>{index + 1}</td>
                <td>{room.RoomNumber}</td>
                <td>{room.Building}</td>
                <td>{room.Occupancy}/{room.Capacity}</td>
                <td>
                  <span className={isAvailable ? styles.empty : styles.full}>
                    { isAvailable ? "Còn trống" : "Đã đầy" }
                  </span>
                </td>
                <td>
                  <Button 
                    onClick={() => handleSelectRoom(room)}>
                    Chọn phòng
                  </Button>
                </td>
                <td></td>
              </tr>
            )
          })}
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
}

