import { SiteHeader } from "@/components/site-header"
import Link from "next/link"

export default function Feedback() {
    return (
        <div className="container max-w-md mx-auto pl-4 pb-8">
            <SiteHeader />
            <div>
            <h2 className="text-xl font-bold">Help</h2>
            <p>You may quickly search for specific books on the <Link href="/search" className="text-blue-500">search page</Link></p>
            </div>
        </div>
    )
}
