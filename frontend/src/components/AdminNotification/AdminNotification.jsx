import Button from "../Button/Button";
import Table from "../Table/Table";
import Overlay from "../Overlay/Overlay";
import Pagination from "../Pagination/Pagination";
import { useState, useEffect } from "react";
import { useNotificationStore } from "../../stores/useNotificationStore";
import { useFeedbackStore } from "../../stores/useFeedbackStore";
import styles from './AdminNotification.module.css';

function Feedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [selectingFeedback, setSelectingFeedback] = useState(null);
    const [deletingFeedback, setDeletingFeedback] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const { getFeedbacks, updateFeedBackStatus, deleteFeedBack } = useFeedbackStore();

    const status = {
        "Pending": {
            translated: "Chờ xử lý",
            className: styles.green
        },
        "In Progress": {
            translated: "Đang xử lý",
            className: styles.yellow
        },
        "Done": {
            translated: "Hoàn thành",
            className: styles.purple
        }
    }

    const handleFetchFeedbacks = async () => {
        const res = await getFeedbacks(page, limit);
        if (res) {
            const { data, pagination } = res;
            setFeedbacks(data);
            setTotal(pagination.totalPages);
        }
    }

    const handleUpdateFeedback = async () => {
        if (selectingFeedback) {
            await updateFeedBackStatus(
                selectingFeedback.FeedbackID,
                selectingFeedback.Status
            );
            setSelectingFeedback(null);
            await handleFetchFeedbacks();
        }
    }

    const handleDeleteFeedback = async () => {
        if (deletingFeedback) {
            await deleteFeedBack(deletingFeedback.FeedbackID);
            setDeletingFeedback(null);
            await handleFetchFeedbacks();
        }
    }

    useEffect(() => {
        handleFetchFeedbacks();
    }, [limit, page]);

    return (
        <section className={styles.feedback}>
            <header>
                <h2>Quản lý phản hồi</h2>
                <div className={styles.buttonContainer}>
                    <Button
                        onClick={handleFetchFeedbacks}
                    >
                        Làm mới
                    </Button>
                </div>
            </header>

            <h3>Danh sách phản hồi</h3>

            <Table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tiêu đề</th>
                        <th>Nội dung</th>
                        <th>Trạng thái</th>
                        <th>Người dùng</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {feedbacks.map((feedback) => (
                        <tr key={feedback.FeedbackID}>
                            <td>{feedback.FeedbackID}</td>
                            <td>{feedback.Title}</td>
                            <td>{feedback.Content}</td>
                            <td>
                                <span className={status[feedback.Status].className}>
                                    {status[feedback.Status].translated ?? feedback.Status}
                                </span>
                            </td>
                            <td>
                                <div>
                                    {feedback.FullName}<br/>
                                    {feedback.StudentID}
                                </div>
                            </td>
                            <td>
                                <div className={styles.buttonContainer}>
                                    <Button
                                        onClick={() => setSelectingFeedback(feedback)}
                                    >
                                        <i className="fa-solid fa-pen"></i>
                                    </Button>
                                    <Button
                                        onClick={() => setDeletingFeedback(feedback)}
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {(!feedbacks || feedbacks.length === 0) && (
                <div className={styles.noResult}>Không có kết quả</div>
            )}

            <div className={styles.pagination}>
                <Pagination
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                    total={total}
                />
            </div>

            {selectingFeedback && (
                <Overlay>
                    <div className={styles.modal}>
                        <h2>
                            {`Phản hồi của ${selectingFeedback.FullName}?`}
                        </h2>
                        <div>{selectingFeedback.Title}</div>
                        <div>{selectingFeedback.Content}</div>
                        <select
                            value={selectingFeedback.Status}
                            onChange={(e) => setSelectingFeedback({ ...selectingFeedback, Status: e.target.value})}
                        >
                            <option value="Pending">Chờ xử lý</option>
                            <option value="In Progress">Đang xử lý</option>
                            <option value="Done">Hoàn thành</option>
                        </select>
                        <Button
                            onClick={handleUpdateFeedback}
                        >
                            Cập nhật
                        </Button>
                        <Button
                            onClick={() => setSelectingFeedback(null)}
                        >
                            Hủy
                        </Button>
                    </div>
                </Overlay>
            )}

            {deletingFeedback && (
                <Overlay>
                    <div className={styles.modal}>
                        <h2>
                            {`Bạn có chắc chắn muốn xóa phản hồi của ${deletingFeedback.FullName}?`}
                        </h2>
                        <Button
                            onClick={handleDeleteFeedback}
                        >
                            Xóa
                        </Button>
                        <Button
                            onClick={() => setDeletingFeedback(null)}
                        >
                            Hủy
                        </Button>
                    </div>
                </Overlay>
            )}
        </section>
    )
}

function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [newNotification, setNewNotification] = useState(null);
    const [deletingNotification, setDeletingNotification] = useState(null);
    const { createNotification, getAdminNotifications } = useNotificationStore();

    const [ page, setPage ] = useState(1);
    const [ limit, setLimit ] = useState(10);
    const [ total, setTotal ] = useState(0);

    const handleFetchNotification = async () => {
        const res = await getAdminNotifications(page, limit);
        if (res) {
            const { data, pagination } = res;
            setNotifications(data);
            setTotal(pagination.totalPages);
        }
    }

    const handleCreateNotification = async () => {
        if (newNotification) {
            await createNotification(
                newNotification.title,
                newNotification.content,
                newNotification.receiverId
            );
            setNewNotification(null);
            await handleFetchNotification();
        }
    }

    const handleDeleteNotification = async () => {
        console.log("TODO: handle delete notification");
    }

    useEffect(() => {
        handleFetchNotification();
    }, [limit, page]);

    return (
        <section className={styles.notification}>
            <header>
                <h2>Quản lý thông báo</h2>
                <div className={styles.buttonContainer}>
                    <Button
                        onClick={() => setNewNotification({ title:'', content:'' })}
                    >
                        Tạo thông báo mới
                    </Button>
                    <Button
                        onClick={handleFetchNotification}
                    >
                        Làm mới
                    </Button>
                </div>
            </header>

            <h3>Thông báo chung đã tạo</h3>
            <Table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tiêu đề</th>
                        <th>Nội dung</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {notifications.map((noti) => (
                        <tr key={noti.NotificationID}>
                            <td>{noti.NotificationID}</td>
                            <td>{noti.Title}</td>
                            <td>{noti.Content}</td>
                            <td>
                                <div className={styles.buttonContainer}>
                                    <Button
                                        onClick={() => setDeletingNotification(noti)}
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {(!notifications || notifications.length === 0) && (
                <div className={styles.noResult}>Không có kết quả</div>
            )}

            <div className={styles.pagination}>
                <Pagination
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                    total={total}
                />
            </div>

            {newNotification && (
                <Overlay>
                    <div className={styles.modal}>
                        <h2>Nhập thông báo mới</h2>
                        <input
                            type="text"
                            value={newNotification.title ?? ""}
                            placeholder="Tiêu đề thông báo"
                            onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value})}/>
                        <textarea
                            type="text"
                            value={newNotification.content ?? ""}
                            placeholder="Nội dung thông báo"
                            onChange={(e) => setNewNotification({ ...newNotification, content: e.target.value})}/>
                        <input
                            type="text"
                            placeholder="ID người nhận thông báo, để trống để thông báo cho tất cả người dùng"
                            value={newNotification.receiverId ?? ""}
                            onChange={(e) => setNewNotification({ ...newNotification, receiverId: e.target.value})}/>
                        <Button
                            onClick={handleCreateNotification}
                        >
                            Thêm
                        </Button>
                        <Button
                            onClick={() => setNewNotification(null)}
                        >
                            Hủy
                        </Button>
                    </div>
                </Overlay>
            )}

            {deletingNotification && (
                <Overlay>
                    <div className={styles.modal}>
                        <h2>Bạn có chắc chắn muốn xóa thông báo này?</h2>
                        <Button
                            onClick={handleDeleteNotification}
                        >
                            Xóa
                        </Button>
                        <Button
                            onClick={() => setDeletingNotification(null)}
                        >
                            Hủy
                        </Button>
                    </div>
                </Overlay>
            )}
        </section>
    );
}

export default function AdminNotification() {
    return (
        <div className={styles.container}>
            <Notification />
            <Feedback />
        </div>
    )
};