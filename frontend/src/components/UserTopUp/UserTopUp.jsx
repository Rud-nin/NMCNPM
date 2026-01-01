import { useTopUpStore } from '../../stores/useTopUpStore.js';
import Button from '../../components/Button/Button.jsx';
import Table from '../Table/Table.jsx';
import styles from './UserTopUp.module.css';
import Overlay from '../Overlay/Overlay.jsx';
import { useState, useEffect } from 'react';
import { formatDateTime } from '../../lib/formatDateTime.js';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/useAuthStore.js';

function UserNotification() {
  const authUser = useAuthStore(s => s.authUser);
  const [topUpsHistory, setTopUpsHistory] = useState([]);
  const [amount, setAmount] = useState(null);
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState("new-to-old");
  const getUserTopUpsHistory = useTopUpStore(s => s.getUserTopUpsHistory);
  const createTopUp = useTopUpStore(s => s.createTopUp);

  // chuyển tiền
  const bankCode = "MB";
  const account = "678911042005";
  const content = encodeURIComponent(`Nạp tiền cho người dùng ${authUser?.FullName || ""} ID: ${authUser?.UserID || ""}`)

  async function fetchTopUps() {
    const data = await getUserTopUpsHistory();
    if (data) setTopUpsHistory(data);
  }

  async function handleCreateTopUp() {
    if (typeof amount === "number") {
      await createTopUp();
      setAmount(null);
      setOpen(false);
    } else {
      toast.error("Hãy nhập số tiền");
    }
  }

  useEffect(() => {
    fetchTopUps();
  }, []);

  const sortedTopUps = topUpsHistory.sort((a, b) => {
    if (sort === "new-to-old") {
      return new Date(b.CreatedAt) - new Date(a.CreatedAt);
    }
    return new Date(a.CreatedAt) - new Date(b.CreatedAt);
  });

  return (
    <section className={styles.notification}>
      <header>
        <h2>Nạp tiền</h2>
        <div className={styles.btnContainer}>
          <Button
            onClick={() => setOpen(true)}
          >Tạo yêu cầu nạp tiền</Button>
          <Button
            onClick={fetchTopUps}
          >Làm mới</Button>
        </div>
      </header>

      <div className={styles.titleBar}>
        <h3>Lịch sử nạp tiền</h3>

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
            <th>Số tiền</th>
            <th>Trạng thái</th>
            <th>Thời gian</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedTopUps && sortedTopUps.map((topUp) => (
            <tr>
              <td>{topUp.TopUpID}</td>
              <td>{topUp.Amount + " VNĐ"}</td>
              <td>
                <span className={`${styles.status} ${styles[topUp.Status]}`}>
                  { 
                    topUp.Status === "Completed" ? "Thành công" :
                    topUp.Status === "Pending" ? "Chờ duyệt" : 
                    "Thất bại"
                  }
                </span>
              </td>
              <td>{formatDateTime(topUp.CreatedAt)}</td>
              <td>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {open && (
        <Overlay>
          <div className={styles.modal}>
            <h2>Nhập số tiền và chuyển khoản</h2>
            <div className={styles.input}>
              <span>Số tiền (VNĐ)</span>
              <input
                type="number" min="1" max="1000000000" step="1"
                value={amount}
                placeholder="Nhập số tiền"
                onChange={(e) => {
                  if (Number(e.target.value) === 0) {
                    setAmount(null);
                  } else {
                    setAmount(Number(e.target.value));
                  }
                }} />
            </div>
            { amount > 0 && (
              <div className={styles.qrWrap}>
                <img
                  src={`https://img.vietqr.io/image/${bankCode}-${account}-compact.png?amount=${amount}&addInfo=${content}`}
                  alt="QR chuyển khoản"
                  className={styles.qrImage}
                />
              </div>
            )}

            <div className={styles.btnContainer}>
              <Button onClick={handleCreateTopUp}>Gửi</Button>
              <Button onClick={() => {
                setAmount(null),
                setOpen(false)
              }}>Hủy</Button>
            </div>
          </div>
        </Overlay>
      )}
    </section>
  );
}


export default UserNotification;
