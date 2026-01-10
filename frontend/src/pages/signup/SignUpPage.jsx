import { Link, Navigate, useNavigate } from 'react-router';
import styles from './SignUpPage.module.css';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';

import toast from "react-hot-toast";
import { Loader2, Eye, EyeOff, Home } from "lucide-react";

export function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    FullName: "",
    Email: "",
    Password: "",
    BirthDate: "",
    HomeTown:  "",
    ID: "",
  });

  const { authUser, signup, isSigningUp } = useAuthStore();

  const navigate = useNavigate();

  const isValidDate = (date) => {
    const regex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return regex.test(date);
  };


  function formatDate(dateStr) {
    // dateStr: "DD/MM/YYYY"
    const [dd, mm, yyyy] = dateStr.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }


  const validateForm = () => {
    if (!formData.FullName.trim()){
      toast.error("Bạn chưa điền Họ và tên!");
      return false;
    }
    if (!formData.BirthDate.trim()) {
      toast.error("Bạn chưa điền Ngày sinh!");
      return false;
    }
    if (!isValidDate(formData.BirthDate)){
      toast.error("Sai định dạng Ngày sinh: DD/MM/YYYY");
      return false;
    } 
    if (!formData.HomeTown.trim()) {
      toast.error("Bạn chưa điền Mã số sinh viên!");
      return false;
    } 
    if (!formData.ID) {
      toast.error("Bạn chưa điền Số CCCD");
      return false;
    } 
    if (!formData.Email.trim()) {
      toast.error("Bạn chưa điền Email!");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.Email)) {
      toast.error("Sai định dạng Email"); // Kiểm tra định dạng email
      return false;
    } 
    if (!formData.Password) {
      toast.error("Bạn chưa điền Mật khẩu!");
      return false;
    } 
    if (formData.Password.length < 6) {
      toast.error("Mật khẩu phải ít nhất 6 kí tự");
      return false;
    } 

    return true;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      await signup({
        FullName: formData.FullName,
        Email: formData.Email,
        Password: formData.Password,
        BirthDate: formatDate(formData.BirthDate),
        HomeTown:  formData.HomeTown,
        ID: formData.ID,
      });
      navigate("/signin");
    }
  }

  return (
    <>
      <title>Đăng ký</title>

      <div className={styles.signUpPage}>
        <div className={styles.signUpContainer}>
          <div className={styles.signUpLeft}>
            <img src="images/BlueMoon.png" alt="blue moon" />
          </div>
          <div className={styles.signUpRight}>
            <div>
              <h2>Đăng ký</h2>
            </div>
            <form onSubmit={submit}>
              <div className={styles.inputGroup}>
                <label>Họ và tên</label>
                <div class={styles.inputWrapper}>
                  <input 
                    type="text" 
                    placeholder="Chu Văn A" 
                    value={formData.FullName}
                    onChange={(event) => setFormData({...formData, FullName: event.target.value})}
                  />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Ngày Sinh</label>
                <div class={styles.inputWrapper}>
                  <input 
                    type="text" 
                    placeholder="31/12/2005"
                    value={formData.BirthDate}
                    onChange={(event) => setFormData({...formData, BirthDate: event.target.value})}
                  />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Quê quán</label>
                <div class={styles.inputWrapper}>
                  <input 
                    type="text" 
                    placeholder="Hà Nội" 
                    value={formData.HomeTown}
                    onChange={(event) => setFormData({...formData, HomeTown: event.target.value})}
                  />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Số CCCD</label>
                <div class={styles.inputWrapper}>
                  <input 
                    type="text" 
                    placeholder="001200000000" 
                    value={formData.ID}
                    onChange={(event) => setFormData({...formData, ID: event.target.value})}
                  />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <div class={styles.inputWrapper}>
                  <input 
                    type="text" 
                    placeholder="abc@gmail.com" 
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
              <button 
                type="submit"
                disabled={isSigningUp}
                className={styles.signUpButton}
              >{isSigningUp ? (
                <>
                  < Loader2 className={styles.loader} />
                  Loading...
                </>
              ) : ("Đăng kí")}
              </button>
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