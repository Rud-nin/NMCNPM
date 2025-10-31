import { Link } from 'react-router';
import styles from "./SignInPage.module.css";

/* 
Chưa làm link phần Quên mật khẩu
*/
export function SignInPage() {
  return (
    <>
      <title>Đăng nhập</title>

      <div className={styles.signInPage}>
        <div className={styles.signInContainer}>
          <div className={styles.signInLeft}>
            <img src="images/sign-in.jpg" alt="hust-image" />
          </div>

          <div className={styles.signInRight}>
            <div>
              <h2>Đăng nhập</h2>
            </div>
            <form>
              <div className={styles.inputGroup}>
                <input type="email" placeholder="Email" required />
              </div>
              <div className={styles.inputGroup}>
                <input type="password" placeholder="Password" required />
              </div>
              <button type="submit">Đăng Nhập</button>
              <div className={styles.loginOptions}>
                <div className={styles.rememberSection}>
                  <input type="checkbox" value="remember-me"/>
                  <label>Ghi nhớ đăng nhập</label>
                </div>
                <div>
                  <Link className={styles.forgotLink}>Quên mật khẩu</Link>
                </div>
              </div>
            </form>

            <div>
              <Link className={styles.signUpLink} to="/signup">
                Đăng ký tài khoản →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
