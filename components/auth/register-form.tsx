/**
 * USER REGISTRATION FORM COMPONENT
 * 
 * Handles user account creation with optional phone number
 * Data flow: User input → Form validation → AuthContext → API → Database
 * User data: username, email, password, confirm password, phone (optional)
 * 
 * Features:
 * - Green theme styling to match parent modal
 * - Phone number field for future password recovery
 * - Client-side validation before API submission
 * - Real-time error display and loading states
 * - Switch to login form functionality
 */

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { validateEmail, validatePassword, validateUsername, validatePhone } from "@/lib/auth"

/**
 * Props for RegisterForm component
 * Data source: AuthModal component passes the switch function
 */
interface RegisterFormProps {
  onSwitchToLogin: () => void  // Function to switch modal to login mode
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  // Form state management for all input fields
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phone, setPhone] = useState("")  // NEW: Optional phone for password recovery
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Get register function from authentication context
  const { register } = useAuth()

  /**
   * Handles form submission with comprehensive validation
   * Data flow: Form data → Validation → AuthContext.register → API → Database
   * User data: All form fields sent to registration API endpoint
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Client-side validation using imported validator functions
    if (!validateUsername(username)) {
      setError("Username must be 3-50 characters and contain only letters, numbers, and underscores")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate phone number format if provided (optional field)
    if (!validatePhone(phone)) {
      setError("Please enter a valid phone number")
      return
    }

    setLoading(true)
    try {
      // Call register function from AuthContext with phone number included
      const success = await register({ username, email, password, phone })
      if (!success) {
        setError("Registration failed. Please try again.")
      }
      // If successful, AuthContext will handle user session creation
    } catch (error) {
      setError("User already exists")
    }
    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md bg-transparent border-0 shadow-none rounded-xl">
      <CardHeader className="text-center text-white p-6 m-0">
        <CardTitle className="text-2xl font-bold">Join the Discussion</CardTitle>
        <CardDescription className="text-green-100">Create your account to get started</CardDescription>
      </CardHeader>
      <CardContent className="p-6 text-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-100 border-red-300 text-red-800">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" className="text-green-100">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              className="bg-green-400/20 border-green-300 text-white placeholder:text-green-200 focus:border-green-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-green-100">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="bg-green-400/20 border-green-300 text-white placeholder:text-green-200 focus:border-green-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-green-100">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="bg-green-400/20 border-green-300 text-white placeholder:text-green-200 focus:border-green-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-green-100">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              className="bg-green-400/20 border-green-300 text-white placeholder:text-green-200 focus:border-green-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-green-100">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="bg-green-400/20 border-green-300 text-white placeholder:text-green-200 focus:border-green-200"
            />
          </div>

          <Button type="submit" className="w-full bg-green-800 hover:bg-green-900 text-white border-0" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-green-100">Already have an account? </span>
          <button onClick={onSwitchToLogin} className="text-green-200 hover:text-white hover:underline font-medium">
            Sign in
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
