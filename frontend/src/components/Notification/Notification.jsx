import Button from "../../components/Button/Button";
import { useState, useEffect } from "react";
import { useNotificationStore } from "../../stores/useNotificationStore";
import styles from './Notification.module.css';

function Notification() {
    const [ newNotification, setNewNotification ] = useState(null);
    const [ notifications, setNotifications ] = useState([]);
    const createNotification = useNotificationStore((s) => s.createNotification);
    const getNotifications = useNotificationStore((s) => s.getNotifications);

    async function fetchNoti() {
        const data = await getNotifications();
        if(data) setNotifications(data);
    }

    useEffect(() => {
        fetchNoti();
    }, []);

    return (
        <section className={styles.notification}>
            <header>
                <h2>Quản lý thông báo</h2>
                <div className={styles.btnContainer}>
                    <Button
                        onClick={() => setNewNotification({ title:'', content:'' })}
                    >Tạo thông báo mới</Button>
                    <Button
                        onClick={fetchNoti}
                    >Làm mới</Button>
                </div>
            </header>

            <h3>Lịch sử thông báo đã tạo</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Tiêu đề</th>
                        <th>Nội dung</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {notifications && notifications.map((noti) => (
                        <tr>
                            <td>{noti.NotificationID}</td>
                            <td>{noti.Title}</td>
                            <td>{noti.Content}</td>
                            <td>
                                <div>
                                    <Button><i className="fa-solid fa-pen"></i></Button>
                                    <Button><i className="fa-solid fa-trash"></i></Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {newNotification && (
                <div className={styles.overlay}>
                    <div>
                        <h2>Nhập thông báo mới</h2>
                        <div className={styles.input}>
                            <span>Tiêu đề</span>
                            <input
                                type="text"
                                value={newNotification.title}
                                placeholder="Nhập tiêu đề thông báo"
                                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value})}/>
                        </div>
                        <div  className={styles.input}>
                            <span>Nội dung</span>
                            <textarea
                                type="text"
                                value={newNotification.content}
                                placeholder="Nhập nội dung thông báo"
                                onChange={(e) => setNewNotification({ ...newNotification, content: e.target.value})}/>
                        </div>
                        <div className={styles.btnContainer}>
                            <Button onClick={async () => {
                                await createNotification(newNotification.title, newNotification.content);
                                setNewNotification(null);
                                await fetchNoti();
                            }}>Thêm</Button>
                            <Button onClick={() => setNewNotification(null)}>Hủy</Button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Notification;