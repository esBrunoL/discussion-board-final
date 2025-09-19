"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { validateEmail } from "@/lib/auth"

interface LoginFormProps {
  onSwitchToRegister: () => void
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    if (!password) {
      setError("Password is required")
      return
    }

    setLoading(true)
    const success = await login({ email, password })
    setLoading(false)

    if (!success) {
      setError("Invalid email or password")
    }
  }

  return (
    <Card className="w-full max-w-md bg-transparent border-0 shadow-none rounded-xl">
      <CardHeader className="text-center text-white p-6 m-0">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription className="text-blue-100">Sign in to join the discussion</CardDescription>
      </CardHeader>
      <CardContent className="p-6 text-white">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-100 border-red-300 text-red-800">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-blue-100">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="bg-blue-400/20 border-blue-300 text-white placeholder:text-blue-200 focus:border-blue-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-blue-100">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="bg-blue-400/20 border-blue-300 text-white placeholder:text-blue-200 focus:border-blue-200"
            />
          </div>

          <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-900 text-white border-0" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-blue-100">Don't have an account? </span>
          <button onClick={onSwitchToRegister} className="text-blue-200 hover:text-white hover:underline font-medium">
            Sign up
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
