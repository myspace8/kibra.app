import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    )
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return NextResponse.json({ available: !data })
  } catch (error) {
    console.error("Error checking username:", error)
    return NextResponse.json(
      { error: "Error checking username availability" },
      { status: 500 }
    )
  }
}