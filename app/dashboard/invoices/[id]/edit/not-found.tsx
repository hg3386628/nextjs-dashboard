import Link from "next/link";
import { FaceFrownIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <FaceFrownIcon className="h-12 w-12 text-gray-400" />
      <h2 className="text-xl font-semibold">404 Not Found</h2>
      <p className="text-sm text-gray-400">The page you are looking for does not exist.</p>
      <Link href="/dashboard/invoices" className="text-sm text-blue-500 hover:underline">Go back to dashboard invoices</Link>
    </main>
  )

}