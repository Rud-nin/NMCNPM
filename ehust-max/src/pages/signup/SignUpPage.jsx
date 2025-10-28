import {Link} from 'react-router-dom'
import './SignUpPage.css'

export function SignUpPage() {
  return (
    <>
      <title>Đăng ký</title>

      <div class="sign-up-page">
        <div class="sign-up-container">
          <div class="sign-up-left">
            <img src="images/sign-up.jpg" alt="hust" />
          </div>
          <div class="sign-up-right">
            <div>
              <h2>Đăng ký</h2>
            </div>
            <form>
              <div className="input-group">
                <input type="text" placeholder="Họ và Tên" required />
              </div>
              <div className="input-group">
                <input type="date" placeholder="Ngày sinh" defaultValue="2005-01-01" required/>
              </div>
              <div className="input-group">
                <input type="text" placeholder="Mã số sinh viên" required />
              </div>
              <div className="input-group">
                <input type="text" placeholder="Số CCCD" required />
              </div>
              <div className="input-group">
                <input type="email" placeholder="Email" required />
              </div>
              <div className="input-group">
                <input type="password" placeholder="Password" required />
              </div>
              <button type="submit">Đăng ký</button>
            </form>

            <div class="sign-in-link-container">
              <Link className="sign-in-link" to="/signin">
                Đã có tài khoản →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}