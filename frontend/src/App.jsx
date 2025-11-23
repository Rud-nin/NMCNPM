import { Routes, Route, Navigate } from 'react-router';
import { SignUpPage } from './pages/signup/SignUpPage';
import { SignInPage } from './pages/signin/SignInPage';
import LoadingPage from './pages/loading/LoadingPage';
import NotFoundPage from './pages/notfound/NotFoundPage';
import { TestPage } from './pages/TestPage';
import Home from './pages/home/Home';
import AdminDashboard from './pages/admin_dashboard/AdminDashboard';

import ThemeToggle from './components/themeToggle/ThemeToggle';

import './App.css'
import { Toaster } from 'react-hot-toast';
import { ForgotPasswordPage } from './pages/forget_password/ForgotPassword';
import { useAuthStore } from './stores/useAuthStore';
import { useEffect } from 'react';

function App() {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return <LoadingPage />
  }

  return (
    <div className="app-container">
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={!authUser ? <SignInPage /> : <Navigate to="/test" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : < Navigate to="/test" />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />
        <Route path="/test" element={!authUser ? < SignInPage /> : < TestPage />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
