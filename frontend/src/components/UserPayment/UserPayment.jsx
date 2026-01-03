import { useState, useEffect } from "react";
import { usePaymentStore } from "../../stores/usePaymentStore.js";
import Pagination from "../Pagination/Pagination.jsx";
import styles from './UserPayment.module.css';
import Table from "../Table/Table.jsx";
import Button from "../Button/Button.jsx";
import Overlay from "../Overlay/Overlay.jsx";
import { formatDateTime } from "../../lib/formatDateTime.js";
import { useUserInformationStore } from '../../stores/useUserInformationStore.js';
import toast from "react-hot-toast";
import { useFeedbackStore } from "../../stores/useFeedbackStore.js";

function UserPayment() {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [feedback, setFeedback] = useState(null);

  const [billIds, setBillIds] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const {
    unpaidBills,
    paidBills,
    isLoading,
    isPaying,
    getUserPaidBills,
    getUserUnpaidBills,
    payBill
  } = usePaymentStore();

  const {
    user
  } = useUserInformationStore();

  const {
    sendFeedback
  } = useFeedbackStore();

  const handleSendFeedback = async () => {
    await sendFeedback(feedback.title, feedback.content);
    setFeedback(null);
  };

  const handleFetchUnpaidBills = async () => {
    if (isLoading) return;

    await getUserUnpaidBills;
  };

  const handeFetchPaidBills = async () => {
    if (isLoading) return;

    const res = await getUserPaidBills(page, limit);
    if (res) {
      const { pagination } = res;
      setLimit(pagination.limit);
      setPage(pagination.page);
      setTotal(pagination.totalPages);
    }
  };

  const handlePayBill = async () => {
    if (isPaying) return;

    if (!billIds || billIds.length === 0) {
      toast.error("Vui lòng chọn hóa đơn");
      return;
    }

    if (Number(user.Balance) < totalAmount) {
      toast.error(`Số dư hiện tại của bạn là: ${user.Balance}. Vui lòng nạp thêm tiền để thanh toán.`);
      return;
    }

    await payBill(billIds);
  };

  const handleToggleBill = async (bill) => {
    if (billIds.includes(bill.BillID)) {
      setBillIds(prev => 
        prev.filter(id => id !== bill.BillID)
      );
      setTotalAmount(totalAmount - Number(bill.Price));
    } else {
      setBillIds(prev => [...prev, bill.BillID]);
      setTotalAmount(totalAmount + Number(bill.Price));
    }
  }

  useEffect(() => {
    handeFetchPaidBills();
  }, [page, limit]);

  useEffect(() => {
    handleFetchUnpaidBills();
  }, []);

  return (
    <div className={styles.userPayment}>
      <header>
        <h2>Thanh toán</h2>

        <Button
          onClick={() => setFeedback({ title: '', content: '' })}
        >Tạo phản hồi</Button>

      </header>

      <section className={styles.unpaidBills}>

        <div className={styles.titleBar}>
          <h3>Danh sách hóa đơn chưa thanh toán</h3>

          <Button
            onClick={handleFetchUnpaidBills}
          >
            <i className="fa-solid fa-arrows-rotate"></i>{' '}
            Làm mới
          </Button>
        </div>

        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên dịch vụ</th>
              <th>Giai đoạn</th>
              <th>Số tiền</th>
              <th>Loại dịch vụ</th>
              <th>Thanh toán</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {unpaidBills && unpaidBills.map((bill, index) => (
              <tr key={index + 1}>
                <td>{index + 1}</td>
                <td>{bill.ServiceName}</td>
                <td>{bill.Period}</td>
                <td>{bill.Price + " VNĐ"}</td>
                <td>{bill.UserID ? "Cá nhân" : "Phòng"}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={billIds.includes(bill.BillID)}
                    onChange={() => handleToggleBill(bill)}
                  />
                </td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </Table>

        {unpaidBills.length ? (
          <div className={styles.totalPayment}>
            <h3>Tổng đóng: {totalAmount}</h3>
            <Button
              onClick={handlePayBill}
            >
              Thanh toán
            </Button>
          </div>
        ) : (
          <div className={styles.totalPayment}>
            <h3>Bạn đã thanh toán hết</h3>
          </div>
        )}
      </section>

      <section className={styles.paidBills}>

        <div className={styles.titleBar}>
          <h3>Danh sách hóa đơn đã thanh toán</h3>

          <Button
            onClick={handeFetchPaidBills}
          >
            <i className="fa-solid fa-arrows-rotate"></i>{' '}
            Làm mới
          </Button>
        </div>

        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên các dịch vụ</th>
              <th>Số tiền</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paidBills && paidBills.map((bill, index) => (
              <tr key={index + 1}>
                <td>{index + 1}</td>
                <td>{bill.ServiceNames}</td>
                <td>{bill.TotalAmount + "VNĐ"}</td>
                <td>{formatDateTime(bill.CreatedAt)}</td>
                <td>
                  <span className={`${styles.status}`}>
                    {bill.Status === "Paid" ? "Đã đóng" : "Chưa đóng"}
                  </span>
                </td>
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
      </section>

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


export default UserPayment;