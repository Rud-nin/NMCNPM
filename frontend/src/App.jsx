import { SignUpPage } from './pages/signup/SignUpPage';
import { SignInPage } from './pages/signin/SignInPage';
import LoadingPage from './pages/loading/LoadingPage';
import NotFoundPage from './pages/notfound/NotFoundPage';
import Home from './pages/home/Home';
import AdminDashboard from './pages/admin_dashboard/AdminDashboard';
import UserDashboard from './pages/user_dashboard/UserDashboard';
import RoomSelecting from './pages/room_selecting/RoomSelecting';

import UserProtectedRoute from './components/UserProtectedRoute/UserProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute/AdminProtectedRoute';

import ThemeToggle from './components/themeToggle/ThemeToggle';

import './App.css';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/useAuthStore';
import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router';
import { useUserInformationStore } from './stores/useUserInformationStore';

function App() {
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();
  const { fetchUserInformation } = useUserInformationStore();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => await Promise.all([
        checkAuth(),
        fetchUserInformation(),
      ])
    )();
  }, []);
  
  if (window.location.pathname === '/') {
    if (authUser?.Role === 'Admin') navigate('/admin');
    else if (authUser?.Role === 'User') navigate('/user');
  }

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
        <Route element={<AdminProtectedRoute />} >
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route element={<UserProtectedRoute/>} >
          <Route path="/rooms" element={<RoomSelecting />} />
          <Route path="user" element={<UserDashboard />} />
        </Route>
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
