import { SignUpPage } from './pages/signup/SignUpPage';
import { SignInPage } from './pages/signin/SignInPage';
import { ForgotPasswordPage } from './pages/forget_password/ForgotPassword';
import LoadingPage from './pages/loading/LoadingPage';
import NotFoundPage from './pages/notfound/NotFoundPage';
import Home from './pages/home/Home';
import AdminDashboard from './pages/admin_dashboard/AdminDashboard';
import UserDashboard from './pages/user_dashboard/UserDashboard';

import ThemeToggle from './components/themeToggle/ThemeToggle';

import './App.css';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/useAuthStore';
import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router';

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await checkAuth();
      if(authUser?.role === 'Admin') navigate('/admin');
      else if(authUser?.role === 'User') navigate('/user');
    })();
  }, []);

  if (isCheckingAuth && !authUser) {
    return <LoadingPage />
  }

  return (
    <div className="app-container">
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
