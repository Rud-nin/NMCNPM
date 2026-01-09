import Button from '../Button/Button';
import Table from '../Table/Table';
import Pagination from '../Pagination/Pagination';
import { usePaymentStore } from '../../stores/usePaymentStore';
import { useTopUpStore } from '../../stores/useTopUpStore';
import { formatDateTime } from '../../lib/formatDateTime';
import { useEffect, useState } from 'react';
import styles from './PaymentHistory.module.css';
import { useServiceStore } from '../../stores/useServiceStore';

function TopUp() {
    const [topUps, setTopUps] = useState([]);
    const { getAllTopUps, acceptTopUp, rejectTopUp } = useTopUpStore();
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const translated = {
        "Pending": "Chờ xử lý",
        "Success": "Thành công",
        "Fail": "Thất bại"
    }

    const handleFetchTopUps = async () => {
        const data = await getAllTopUps();
        if(data) {
            setTopUps(data.data);
            setTotalPages(data.pagination.totalPages);
        }
    }

    const handleAcceptTopUp = async (id) => {
        const data = await acceptTopUp(id);
        if(data) {
            handleFetchTopUps();
        }
    }

    const handleRejectTopUp = async (id) => {
        const data = await rejectTopUp(id);
        if(data) {
            handleFetchTopUps();
        }
    }

    useEffect(() => {
        handleFetchTopUps();
    }, []);

    return (
        <section className={styles.paymentHistory}>
            <header>
                <h2>Lịch sử nạp tiền</h2>
                <Button
                    onClick={handleFetchTopUps}
                >
                    Làm mới
                </Button>
            </header>

            <Table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Người dùng</th>
                        <th>Số tiền</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {topUps.map(topUp => (
                        <tr key={topUp.TopUpID}>
                            <td>{topUp.TopUpID}</td>
                            <td>{topUp.FullName}</td>
                            <td>{topUp.Amount.toLocaleString()}</td>
                            <td>{translated[topUp.Status]}</td>
                            <td>
                                {topUp.Status === "Pending" && (
                                    <div className={styles.buttonContainer}>
                                        <Button
                                            onClick={() => handleAcceptTopUp(topUp.TopUpID)}
                                        >
                                            <i className="fa-solid fa-check"></i>
                                        </Button>
                                        <Button
                                            onClick={() => handleRejectTopUp(topUp.TopUpID)}   
                                        >
                                            <i className="fa-solid fa-xmark"></i>
                                        </Button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <div className={styles.pagination}>
                <Pagination
                    limit={limit}
                    page={page}
                    totalPages={totalPages}
                    setPage={setPage}
                    setLimit={setLimit}
                />
            </div>
        </section>
    );
}

function PaymentHistory() {

    const [ payments, setPayments ] = useState([]);
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const getPayments = usePaymentStore((state) => state.getPayments);
    const newBill = useServiceStore((state) => state.newBill);

    const handleFetchPayments = async () => {
        const data = await getPayments();
        if(data) {
            setPayments(data.data);
            setTotalPages(data.pagination.totalPages);
        }
    }

    useEffect(() => {
        handleFetchPayments();
    }, []);

    return (
        <section className={styles.paymentHistory}>
            <header>
                <h2>Lịch sử giao dịch</h2>
                <div className={styles.buttonContainer}>
                    <Button
                        onClick={newBill}
                    >
                        Tạo hóa đơn tháng mới
                    </Button>
                    <Button
                        onClick={handleFetchPayments}
                    >
                        Làm mới
                    </Button>
                </div>
            </header>

            <Table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Người giao dịch</th>
                        <th>Số tiền</th>
                        <th>Thời gian</th>
                        <th>Mục đích</th>
                    </tr>
                </thead>

                <tbody>
                    {payments && payments.map((payment, index) => (
                        <tr key={index}>
                            <td>{payment.PaymentID}</td>
                            <td>{payment.FullName}</td>
                            <td>{payment.TotalAmount.toLocaleString()}</td>
                            <td>{formatDateTime(payment.CreatedAt)}</td>
                            <td>{payment.ServiceName}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <div className={styles.pagination}>
                <Pagination
                    limit={limit}
                    page={page}
                    totalPages={totalPages}
                    setPage={setPage}
                    setLimit={setLimit}
                />
            </div>
        </section>
    );
}

export default function System() {
    return (
        <>
            <TopUp />
            <PaymentHistory />
        </>
    )
}