"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react"
import Image from "next/image"
import { debounce } from "lodash"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<"student" | "teacher">("student")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [username, setUsername] = useState("")
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [passwordValid, setPasswordValid] = useState(false)
  const router = useRouter()

  const checkUsername = async (username: string) => {
    if (username.length < 4) {
      setUsernameError("Username must be at least 4 characters")
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
      console.log(data);
      

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

  const debouncedCheckUsername = debounce((username: string) => {
    checkUsername(username)
  }, 500)

  const validatePassword = (password: string) => {
    const isValid = password.length >= 6
    setPasswordValid(isValid)
    return isValid
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    if (!(await checkUsername(username))) {
      setLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        username,
        full_name: fullName,
        role,
        is_signup: "true",
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      setMessage("Signup successful! Redirecting...")
      router.push("/learn")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred during signup")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      {/* A back to root route button */}
      <Link href={"/"} className="h-8 bg-black text-white rounded-full py-2 px-3 flex justify-center items-center my-4">
        <span>Go back</span>
      </Link>
      <div className="w-full max-w-md space-y-6 pt-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">Create your account</h2>
        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-700 dark:text-gray-300">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">I am a...</Label>
            <Select onValueChange={(value: "student" | "teacher") => setRole(value)} defaultValue="student">
              <SelectTrigger className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem disabled value="teacher">Teacher</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  validatePassword(e.target.value)
                }}
                required
                className={`pr-10 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 ${
                  password && (passwordValid ? "border-green-500" : "border-red-500")
                }`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={20} className="text-gray-500" /> : <Eye size={20} className="text-gray-500" />}
              </button>
            </div>
            {password && (
              <p className={`text-xs flex items-center gap-1 mt-1 ${passwordValid ? "text-green-500" : "text-red-500"}`}>
                {passwordValid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                Password must be at least 6 characters long
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a unique username"
              value={username}
              onChange={(e) => {
                const value = e.target.value.trim()
                setUsername(value)
                if (value.length >= 4) {
                  debouncedCheckUsername(value)
                } else {
                  setUsernameError("Username must be at least 4 characters")
                }
              }}
              required
              className={`border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 ${
                usernameError ? "border-red-500" : username && !isCheckingUsername ? "border-green-500" : ""
              }`}
              disabled={isCheckingUsername}
            />
            {usernameError && <p className="text-sm text-red-500">{usernameError}</p>}
            {isCheckingUsername && <p className="text-sm text-blue-500">Checking username availability...</p>}
            {!usernameError && username && !isCheckingUsername && (
              <p className="text-sm text-green-500 flex items-center gap-1">
                <CheckCircle2 size={14} /> Username available!
              </p>
            )}
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          {message && <p className="text-sm text-green-500 text-center">{message}</p>}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-full"
            disabled={loading || isCheckingUsername || !!usernameError || !passwordValid}
          >
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          By signing up, you agree to the{" "}
          <Link href="#" className="text-blue-500 hover:underline">Terms of Service</Link> and{" "}
          <Link href="#" className="text-blue-500 hover:underline">Privacy Policy</Link>, including{" "}
          <Link href="#" className="text-blue-500 hover:underline">Cookie Use</Link>.
        </p>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">Already have an account?</p>
          <Link
            href="/login"
            className="mt-2 inline-block w-full rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Log in
          </Link>
        </div>
      </div>
      <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">© All rights reserved 2025</div>
    </div>
  )
}