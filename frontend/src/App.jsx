import { Routes, Route } from 'react-router'
import { SignUpPage } from './pages/signup/SignUpPage'
import { SignInPage } from './pages/signin/SignInPage'
import NotFoundPage from './pages/notfound/NotFoundPage'
import Home from './pages/home/Home'
import AdminDashboard from './pages/admin_dashboard/AdminDashboard'

import ThemeToggle from './components/themeToggle/ThemeToggle'

import './App.css'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <div className="app-container">
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="signin" element={<SignInPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
