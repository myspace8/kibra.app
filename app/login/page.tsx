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

      window.location.href = "/home"
    } catch (error: any) {
      setError(error.message || "Login failed")
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
          <Button type="submit" className="w-full" disabled={loading}>
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
          <Link href="/signup" className="mt-2 inline-block w-full rounded-full border border-gray-300 px-4 py-3 text-center text-[#1D9BF0] hover:bg-gray-50">
            Sign up
          </Link>
        </div>
      </div>
      <div className="mt-8 text-xs text-gray-500">© All rights reserved 2025</div>
    </div>
  )
}
