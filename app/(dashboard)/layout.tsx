import type React from "react"
import { cookies } from "next/headers"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const username = cookies().get("username")?.value || undefined

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header username={username} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
