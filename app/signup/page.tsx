"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { debounce } from "lodash"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [username, setUsername] = useState("")
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const router = useRouter()

  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters")
      return false
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError("Username can only contain letters, numbers, and underscores")
      return false
    }

    setIsCheckingUsername(true)
    try {
      const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`)
      const data = await response.json()
      
      if (!data.available) {
        setUsernameError("Username is already taken")
        return false
      }
      
      setUsernameError(null)
      return true
    } catch (error) {
      console.error("Error checking username:", error)
      setUsernameError("Error checking username availability")
      return false
    } finally {
      setIsCheckingUsername(false)
    }
  }

  // Debounced version of username check
  const debouncedCheckUsername = debounce((username: string) => {
    checkUsername(username)
  }, 2000)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    // Validate username
    if (!await checkUsername(username)) {
      setLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        username,
        full_name: fullName,
        is_signup: "true",
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      setMessage("Signup successful! Redirecting...")
      router.push("/home")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred during signup")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-[#E8E8E8] p-6">
      <div className="w-full max-w-[320px]">
        <div className="mb-8 flex justify-center">
          <Image src="/simple-icons_packagist.png" alt="Logo" width={64} height={64} className="h-16 w-16" />
        </div>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Your Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a unique username"
              value={username}
              onChange={(e) => {
                const value = e.target.value.trim()
                setUsername(value)
                if (value.length >= 3) {
                  debouncedCheckUsername(value)
                }
              }}
              required
              className={usernameError ? "border-red-500" : ""}
              disabled={isCheckingUsername}
            />
            {usernameError && (
              <p className="text-sm text-red-500">{usernameError}</p>
            )}
            {isCheckingUsername && (
              <p className="text-sm text-blue-500">Checking username availability...</p>
            )}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-green-500">{message}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-500">
          By signing up, you agree to the {" "}
          <Link href="#" className="text-[#1D9BF0] hover:underline">Terms of Service</Link> and {" "}
          <Link href="#" className="text-[#1D9BF0] hover:underline">Privacy Policy</Link>, including {" "}
          <Link href="#" className="text-[#1D9BF0] hover:underline">Cookie Use</Link>.
        </p>
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-600">Already have an account?</p>
          <Link href="/login" className="mt-2 inline-block w-full rounded-full border border-gray-300 px-4 py-3 text-center text-[#1D9BF0] hover:bg-gray-50">
            Log in
          </Link>
        </div>
      </div>
      <div className="mt-8 text-xs text-gray-500">© All rights reserved 2025</div>
    </div>
  )
}