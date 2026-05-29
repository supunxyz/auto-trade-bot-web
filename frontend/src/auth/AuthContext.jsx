import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem('token')
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const { data } = await auth.me()
      setUser(data)
    } catch (err) {
      console.error('Failed to load user:', err)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const { data } = await auth.login(email, password)
    localStorage.setItem('token', data.access_token)
    setUser(data.user)
    return data.user
  }

  const register = async (email, password, name) => {
    const { data } = await auth.register(email, password, name)
    localStorage.setItem('token', data.access_token)
    setUser(data.user)
    return data.user
  }

  const googleLogin = async (idToken) => {
    const { data } = await auth.google(idToken)
    localStorage.setItem('token', data.access_token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    googleLogin,
    logout,
    isAdmin: user?.is_admin || false,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
