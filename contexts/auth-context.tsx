/**
 * AUTHENTICATION CONTEXT
 * 
 * Global state management for user authentication
 * Data source: localStorage for persistence, API endpoints for authentication
 * User data: User session stored in localStorage, API calls for login/register
 * 
 * Features:
 * - Persistent user sessions using localStorage
 * - Login and registration functions with API integration
 * - User state management across entire application
 * - Loading states for authentication operations
 * - Automatic session restoration on app load
 */

"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type AuthUser, type LoginCredentials, type RegisterCredentials, loginUser, registerUser } from "@/lib/auth"

/**
 * Authentication context interface
 * Provides all auth-related functions and state to child components
 */
interface AuthContextType {
  user: AuthUser | null              // Current authenticated user or null
  login: (credentials: LoginCredentials) => Promise<boolean>    // Login function
  register: (credentials: RegisterCredentials) => Promise<boolean>  // Register function with phone support
  logout: () => void                 // Logout function
  loading: boolean                   // Loading state for initial auth check
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Authentication Provider Component
 * Wraps the entire app to provide authentication state and functions
 * Data persistence: Uses localStorage to maintain user sessions across browser sessions
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore user session from localStorage on app initialization
  useEffect(() => {
    const storedUser = localStorage.getItem("auth-user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  /**
   * Login function - authenticates user and creates session
   * Data flow: Form credentials → API login endpoint → Database verification → Session creation
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const authUser = await loginUser(credentials)
      if (authUser) {
        setUser(authUser)
        localStorage.setItem("auth-user", JSON.stringify(authUser))  // Persist session
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  /**
   * Register function - creates new user account with phone support
   * Data flow: Form data → API register endpoint → Database insertion → Session creation
   * NEW: Includes phone number for password recovery feature
   */
  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      const authUser = await registerUser(credentials)
      if (authUser) {
        setUser(authUser)
        localStorage.setItem("auth-user", JSON.stringify(authUser))  // Auto-login after registration
        return true
      }
      return false
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  /**
   * Logout function - clears user session and local storage
   */
  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth-user")
  }

  // Provide authentication state and functions to all child components
  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

/**
 * Custom hook to access authentication context
 * Usage: const { user, login, logout } = useAuth()
 * Data source: AuthContext provider above
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
