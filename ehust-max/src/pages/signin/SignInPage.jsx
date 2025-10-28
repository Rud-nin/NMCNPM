import { Link } from 'react-router-dom'
import './SignInPage.css'


/* 
Chưa làm link phần Quên mật khẩu
*/
export function SignInPage() {
  return (
    <>
      <title>Đăng nhập</title>

      <div className="sign-in-page">
        <div className="sign-in-container">
          <div className="sign-in-left">
            <img src="images/sign-in.jpg" alt="hust-image" />
          </div>

          <div className="sign-in-right">
            <div>
              <h2>Đăng nhập</h2>
            </div>
            <form>
              <div className="input-group">
                <input type="email" placeholder="Email" required />
              </div>
              <div className="input-group">
                <input type="password" placeholder="Password" required />
              </div>
              <button type="submit">Đăng Nhập</button>
              <div class="forgot-container">
                <Link className="forgot">Quên mật khẩu?</Link>
              </div>
            </form>

            <div class="sign-up-link-container">
              <Link className="sign-up-link" to="/signup">
                Đăng ký tài khoản →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
