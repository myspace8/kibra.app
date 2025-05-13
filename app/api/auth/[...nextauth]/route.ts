import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabase } from "@/lib/supabase"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        full_name: { label: "Full Name", type: "text" },
        username: { label: "Username", type: "text" },
        role: { label: "Role", type: "text" },
        is_signup: { label: "Is Signup", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password")
        }

        const isSignup = credentials.is_signup === "true"

        if (isSignup) {
          const { data, error } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
              emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
              data: {
                full_name: credentials.full_name || "New User",
                role: credentials.role || "student",
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
            role: data.user.user_metadata?.role || "student",
          }
        } else {
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
            role: data.user.user_metadata?.role || "student",
          }
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (token.sub) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async signIn({ user }: { user: any }) {
      if (user) {
        const { error } = await supabase.from("users").upsert({
          id: user.id,
          name: user.name || "New User",
          email: user.email,
          role: user.role || "student",
          username: user.username,
          updated_at: new Date().toISOString(),
        })

        if (error) {
          console.error("Error creating/updating user:", error)
          return false
        }
      }
      return true
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }