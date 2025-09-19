import { apiLogin, apiRegister } from "./api"

export interface AuthUser {
  id: number
  username: string
  email: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
  phone?: string
}

// Mock authentication functions (will be replaced with real auth)
export async function loginUser(credentials: LoginCredentials): Promise<AuthUser | null> {
  return await apiLogin(credentials)
}

export async function registerUser(credentials: RegisterCredentials): Promise<AuthUser | null> {
  return await apiRegister(credentials)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 6
}

export function validateUsername(username: string): boolean {
  return username.length >= 3 && username.length <= 50 && /^[a-zA-Z0-9_]+$/.test(username)
}

export function validatePhone(phone: string): boolean {
  return !phone || /^\+?[\d\s\-\(\)]{10,15}$/.test(phone.replace(/\s/g, ''))
}
