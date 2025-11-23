import { Link } from 'react-router';
import styles from "./SignInPage.module.css";
import { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Loader2, EyeOff, Eye } from "lucide-react";
import toast from 'react-hot-toast';

/* 
Chưa làm link phần Quên mật khẩu
*/
export function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    Email: "",
    Password: "",
  });

  // Ghi nhớ mật khẩu => chưa xử lý
  const [rememberMe, setRememberMe] = useState(false);

  const { signin, isSigningIn } = useAuthStore();

  const validateForm = () => {
    if (!formData.Email.trim()) return toast.error("Bạn chưa điền Email!");
    if (!formData.Password) return toast.error("Bạn chưa điền Mật khẩu!");

    return false;
  }

  const submit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      signin(formData);
    }
  }

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
            <form onSubmit={submit}>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <div class={styles.inputWrapper}>
                  <input 
                    type="email" 
                    placeholder="example@gmail.com" 
                    value={formData.Email}
                    onChange={(event) => setFormData({...formData, Email: event.target.value})}
                  />
                </div>
              </div>
              <div className={styles.passwordGroup}>
                <label>Mật khẩu</label>
                <div className={styles.passwordWrapper}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"  
                    value={formData.Password}
                    onChange={(event) => setFormData({...formData, Password: event.target.value})}
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff />
                    ) : (
                      <Eye />
                    )}
                  </button>           
                </div>     
              </div>
              <button type="submit" disabled={isSigningIn} className={styles.signInButton}>
                {isSigningIn ? (
                  <>
                    <Loader2 className={styles.loader} />
                    Loading...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </button>
              <div className={styles.loginOptions}>
                <div className={styles.rememberSection}>
                  <input type="checkbox" value="remember-me"/>
                  <label>Ghi nhớ đăng nhập</label>
                </div>
                <div>
                  <Link className={styles.forgotLink} to="/forgot">Quên mật khẩu</Link>
                </div>
              </div>
            </form>

            <div className={styles.signUpLinkContainer}>
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
