import React from 'react'
import { useAuthStore } from '../stores/useAuthStore'

export const TestPage = () => {
  const { logout } = useAuthStore();
  return (
    <button onClick={logout}>
      Logout
    </button>
  )
}

