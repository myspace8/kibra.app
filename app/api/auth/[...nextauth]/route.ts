import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabase } from "@/lib/supabase"

export const authOptions = {  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        full_name: { label: "Full Name", type: "text" },
        username: { label: "Username", type: "text" },
        is_signup: { label: "Is Signup", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password")
        }

        const isSignup = credentials.is_signup === "true" // Check if this is a signup request

        if (isSignup) {
          // Handle signup
          const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
              emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
              data: {
                full_name: credentials.full_name || "New User",
              },
            },
          })

          if (error || !data.user) {
            console.error("Signup error:", error?.message)
            throw new Error(error?.message || "Signup failed")
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || "New User",
          }
        } else {
          // Handle sign-in
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error || !data.user) {
            console.error("Sign-in error:", error?.message)
            throw new Error(error?.message || "Invalid email or password")
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || null,
          }
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login", // Changed from /home to /login to match your app's flow
  },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (token.sub) {
        session.user.id = token.sub // Map the user ID (sub) to the session
      }
      return session
    },
    async signIn({ user }: { user: any }) {
      // After successful signup or sign-in, ensure a profile exists in the profiles table
      if (user) {
        const { error } = await supabase.from("profiles").upsert({
          id: user.id,
          full_name: user.name || "New User",
          email: user.email,
          updated_at: new Date().toISOString(),
        })

        if (error) {
          console.error("Error creating/updating profile:", error)
          return false // Optionally block sign-in if profile creation fails
        }
      }
      return true
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
