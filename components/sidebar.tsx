"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Users, Map, Leaf, Calendar, MessageSquare, Settings, BarChart, HelpCircle } from "lucide-react"

const navItems = [
  { name: "首页", href: "/dashboard", icon: Home },
  { name: "用户管理", href: "/users", icon: Users },
  { name: "景点管理", href: "/scenic-spots", icon: Map },
  { name: "动植物管理", href: "/wildlife", icon: Leaf },
  { name: "活动公告", href: "/announcements", icon: Calendar },
  { name: "智能对话", href: "/chat", icon: MessageSquare },
  { name: "系统日志", href: "/logs", icon: BarChart },
  { name: "设置", href: "/settings", icon: Settings },
  { name: "帮助", href: "/help", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:bg-gray-50 dark:bg-gray-900 md:border-r border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold">森林公园管理系统</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
