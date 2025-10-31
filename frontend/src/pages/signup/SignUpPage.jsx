import { Link } from 'react-router';
import styles from './SignUpPage.module.css';

export function SignUpPage() {
  return (
    <>
      <title>Đăng ký</title>

      <div class={styles.signUpPage}>
        <div class={styles.signUpContainer}>
          <div class={styles.signUpLeft}>
            <img src="images/sign-up.jpg" alt="hust" />
          </div>
          <div class={styles.signUpRight}>
            <div>
              <h2>Đăng ký</h2>
            </div>
            <form>
              <div className={styles.inputGroup}>
                <input type="text" placeholder="Họ và Tên" required />
              </div>
              <div className={styles.inputGroup}>
                <input type="date" placeholder="Ngày sinh" defaultValue="2005-01-01" required/>
              </div>
              <div className={styles.inputGroup}>
                <input type="text" placeholder="Mã số sinh viên" required />
              </div>
              <div className={styles.inputGroup}>
                <input type="text" placeholder="Số CCCD" required />
              </div>
              <div className={styles.inputGroup}>
                <input type="email" placeholder="Email" required />
              </div>
              <div className={styles.inputGroup}>
                <input type="password" placeholder="Password" required />
              </div>
              <button type="submit">Đăng ký</button>
            </form>

            <div>
              <Link className={styles.signInLink} to="/signin">
                Đã có tài khoản →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}