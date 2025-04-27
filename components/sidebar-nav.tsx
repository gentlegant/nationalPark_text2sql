"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Map, Leaf, Bell, MessageSquare, Users, FileText, Settings, HelpCircle } from "lucide-react"
import { getCurrentUser } from "@/app/actions/auth-actions"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  requiredRole?: string[]
}

export function SidebarNav({ className }: { className?: string }) {
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string; role: string } | null>(null)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
    }

    fetchCurrentUser()
  }, [])

  const navItems: NavItem[] = [
    {
      title: "仪表盘",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "景点管理",
      href: "/scenic-spots",
      icon: <Map className="h-5 w-5" />,
    },
    {
      title: "动植物管理",
      href: "/wildlife",
      icon: <Leaf className="h-5 w-5" />,
    },
    {
      title: "活动公告",
      href: "/announcements",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      title: "智能对话",
      href: "/chat",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "用户管理",
      href: "/users",
      icon: <Users className="h-5 w-5" />,
      requiredRole: ["admin"],
    },
    {
      title: "系统日志",
      href: "/logs",
      icon: <FileText className="h-5 w-5" />,
      requiredRole: ["admin"],
    },
    {
      title: "系统设置",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      requiredRole: ["admin"],
    },
    {
      title: "帮助中心",
      href: "/help",
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ]

  // 根据用户角色过滤导航项
  const filteredNavItems = navItems.filter((item) => {
    if (!item.requiredRole) return true
    return currentUser && item.requiredRole.includes(currentUser.role)
  })

  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {filteredNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href || pathname.startsWith(`${item.href}/`)
              ? "bg-accent text-accent-foreground"
              : "transparent",
          )}
        >
          {item.icon}
          <span className="ml-3">{item.title}</span>
        </Link>
      ))}
    </nav>
  )
}
