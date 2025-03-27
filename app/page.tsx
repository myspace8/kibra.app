import { redirect } from "next/navigation"

// TODO::: Redirect to the /discover page (Currently the /home)
export default function Home() {
  redirect("/login")
  return null
}

