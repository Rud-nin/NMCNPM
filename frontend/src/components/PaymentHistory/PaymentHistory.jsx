import Button from '../Button/Button';
import { usePaymentStore } from '../../stores/usePaymentStore';
import { useEffect, useState } from 'react';
import styles from './PaymentHistory.module.css';

export default function PaymentHistory() {

    const [ payments, setPayments ] = useState([]);
    const getPayments = usePaymentStore((state) => state.getPayments);

    async function fetchPayments() {
        const data = await getPayments();
        if(data) setPayments(data);
    }

    useEffect(() => {
        fetchPayments();
    }, []);

    return (
        <section className={styles.paymentHistory}>
            <header>
                <h2>Lịch sử giao dịch</h2>
                <Button
                    onClick={fetchPayments}
                >Làm mới</Button>
            </header>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Người giao dịch</th>
                        <th>Số tiền</th>
                        <th>Thời gian</th>
                        <th>Mục đích</th>
                        <th>Lời nhắn</th>
                    </tr>
                </thead>

                <tbody>
                    {payments && payments.map((payment) => (
                        <tr>
                            <td>{payment.PaymentID}</td>
                            <td>{payment.User}</td>
                            <td>{payment.Amount}</td>
                            <td>{payment.Date}</td>
                            <td>{payment.Purpose}</td>
                            <td>{payment.Message}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}