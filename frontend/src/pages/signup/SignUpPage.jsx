import { Link } from 'react-router';
import styles from './SignUpPage.module.css';
import { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';

import toast from "react-hot-toast";

export function SignUpPage() {
  const [formData, setFormData] = useState({
    FullName: "",
    Email: "",
    Password: "",
    BirthDate: "",
    StudentID:  "",
    ID: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const isValidDate = (date) => {
    const regex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return regex.test(date);
  };

  const validateForm = () => {
    if (!formData.FullName.trim()) return toast.error("Bạn chưa điền Họ và tên!");
    if (!formData.BirthDate.trim()) return toast.error("Bạn chưa điền Ngày sinh!");
    if (!isValidDate(formData.BirthDate)) return toast.error("Sai định dạng Ngày sinh: DD/MM/YYYY");
    if (!formData.StudentID.trim()) return toast.error("Bạn chưa điền Mã số sinh viên!");
    if (!formData.ID) return toast.error("Bạn chưa điền Số CCCD");
    if (!formData.Email.trim()) return toast.error("Bạn chưa điền Email!");
    if (!/\S+@\S+\.\S+/.test(formData.Email)) return toast.error("Sai định dạng Email"); // Kiểm tra định dạng email
    if (!formData.Password) return toast.error("Bạn chưa điền Mật khẩu!");
    if (formData.Password.length < 6) return toast.error("Mật khẩu phải ít nhất 6 kí tự")

    return true;
  };

  const submit = (event) => {
    event.preventDefault();

    if (validateForm() == true) {
      signup(formData);
    }
  }

  return (
    <>
      <title>Đăng ký</title>

      <div className={styles.signUpPage}>
        <div className={styles.signUpContainer}>
          <div className={styles.signUpLeft}>
            <img src="images/sign-up.jpg" alt="hust" />
          </div>
          <div className={styles.signUpRight}>
            <div>
              <h2>Đăng ký</h2>
            </div>
            <form onSubmit={submit}>
              <div className={styles.inputGroup}>
                <label>Họ và tên</label>
                <input 
                  type="text" 
                  placeholder="Chu Văn Sơn" 
                  value={formData.FullName}
                  onChange={(event) => setFormData({...formData, FullName: event.target.value})}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Ngày Sinh</label>
                <input 
                  type="text" 
                  placeholder="31/12/2005"
                  value={formData.BirthDate}
                  onChange={(event) => setFormData({...formData, BirthDate: event.target.value})}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Mã số sinh viên</label>
                <input 
                  type="text" 
                  placeholder="20230000" 
                  value={formData.StudentID}
                  onChange={(event) => setFormData({...formData, StudentID: event.target.value})}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Số CCCD</label>
                <input 
                  type="text" 
                  placeholder="001200000000" 
                  value={formData.ID}
                  onChange={(event) => setFormData({...formData, ID: event.target.value})}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <input 
                  type="text" 
                  placeholder="son@gmail.com" 
                  value={formData.Email}
                  onChange={(event) => setFormData({...formData, Email: event.target.value})}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Mật khẩu</label>
                <input 
                  type="password" 
                  placeholder="Mật khẩu" 
                  value={formData.Password}
                  onChange={(event) => setFormData({...formData, Password: event.target.value})}
                />
              </div>
              <div className={styles.signUpButtonContainer}>
                <button 
                  type="submit"
                  disabled={isSigningUp}
                >{isSigningUp ? ("Loading...") : ("Đăng kí")}
                </button>
              </div>
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