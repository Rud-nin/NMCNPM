import { useTopUpStore } from '../../stores/useTopUpStore.js';
import Button from '../../components/Button/Button.jsx';
import Table from '../Table/Table.jsx';
import styles from './UserTopUp.module.css';
import Overlay from '../Overlay/Overlay.jsx';
import { useState, useEffect } from 'react';
import { formatDateTime } from '../../lib/formatDateTime.js';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../stores/useAuthStore.js';
import Pagination from '../Pagination/Pagination.jsx';

function UserTopUp() {
  const authUser = useAuthStore(s => s.authUser);
  const [amount, setAmount] = useState(null);
  const [open, setOpen] = useState(false);
  const getUserTopUps = useTopUpStore(s => s.getUserTopUps);
  const createTopUp = useTopUpStore(s => s.createTopUp);
  const topUps = useTopUpStore(s => s.userTopUps);

  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);

  // chuyển tiền
  const bankCode = "MB";
  const account = "678911042005";
  const content = encodeURIComponent(`Nạp tiền cho người dùng ${authUser?.FullName || ""} ID: ${authUser?.UserID || ""}`)

  async function handleCreateTopUp() {
    if (typeof amount === "number") {
      await createTopUp(amount);
      setAmount(null);
      setOpen(false);
    } else {
      toast.error("Hãy nhập số tiền");
    }
  }

  async function handleFetchTopUps() {
    const res = await getUserTopUps(page, limit);
    if (res) {
      const { pagination } = res;
      setTotal(pagination.totalPages);
    }
  }

  useEffect(() => {
    handleFetchTopUps();
  }, []);


  return (
    <section className={styles.topup}>
      <header>
        <h2>Nạp tiền</h2>

        <Button
          onClick={() => setOpen(true)}
        >Tạo yêu cầu nạp tiền</Button>

      </header>

      <div className={styles.titleBar}>
        <h3>Lịch sử nạp tiền</h3>

        <Button
          onClick={handleFetchTopUps}
        >
          <i className="fa-solid fa-arrows-rotate"></i>{' '}
          Làm mới
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Số tiền</th>
            <th>Trạng thái</th>
            <th>Thời gian</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {topUps && topUps.map((topUp, index) => (
            <tr key={index + 1}>
              <td>{index + 1}</td>
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

      <div className={styles.pagination}>
        <Pagination
          limit={limit}
          setLimit={setLimit}
          page={page}
          setPage={setPage}
          total={total} />
      </div>


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
            {amount > 0 && (
              <div className={styles.qrWrap}>
                <img
                  src={`https://img.vietqr.io/image/${bankCode}-${account}-compact.png?amount=${amount}&addInfo=${content}`}
                  alt="QR chuyển khoản"
                  className={styles.qrImage}
                />
              </div>
            )}

            <div className={styles.buttonContainer}>
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


export default UserTopUp;
