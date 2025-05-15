"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { Eye, EyeOff } from "lucide-react" // Import eye icons

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false) // State for password visibility
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }
      router.push("/learn")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
        <Link href={"/"} className="h-8 bg-black text-white rounded-full py-2 px-3 flex justify-center items-center my-4">
<span>Go back</span>
</Link>
<div className="w-full max-w-md space-y-6 pt-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">Log into your account</h2>

<form onSubmit={handleLogin} className="space-y-4">
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
</div>
{error && <p className="text-sm text-red-500">{error}</p>}
<Button type="submit" className="w-full rounded-full" disabled={loading}>
  {loading ? "Logging in..." : "Log in"}
</Button>
</form>
<p className="mt-4 text-center text-xs text-gray-500">
By logging in, you agree to the {" "}
<Link href="#" className="text-[#1D9BF0] hover:underline">Terms of Service</Link> and {" "}
<Link href="#" className="text-[#1D9BF0] hover:underline">Privacy Policy</Link>, including {" "}
<Link href="#" className="text-[#1D9BF0] hover:underline">Cookie Use</Link>.
</p>
<div className="mt-10 text-center">
<p className="text-sm text-gray-600">Don&apos;t have an account?</p>
<Link
            href="/signup"
            className="mt-2 inline-block w-full rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sign up
          </Link>
</div>
</div>
<div className="mt-8 text-xs text-gray-500">© All rights reserved 2025</div>
</div>      

  )
}
