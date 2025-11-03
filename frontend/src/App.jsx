import { Routes, Route } from 'react-router'
import { SignUpPage } from './pages/signup/SignUpPage'
import { SignInPage } from './pages/signin/SignInPage'
import NotFoundPage from './pages/notfound/NotFoundPage'
import Home from './pages/home/Home'

import ThemeToggle from './components/themeToggle/ThemeToggle'

import './App.css'

function App() {
  return (
    <div className="app-container">
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="signin" element={<SignInPage />} />
        <Route path="signup" element={<SignUpPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App
