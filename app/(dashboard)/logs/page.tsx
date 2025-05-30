"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { executeQuery } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/auth-actions"

type SystemLog = {
  id: number
  user_id: number
  username: string
  action: string
  entity_type: string
  entity_id: number
  details: string
  created_at: string
}

export default function LogsPage() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string; role: string } | null>(null)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
    }

    fetchCurrentUser()
    fetchLogs()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLogs(logs)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredLogs(
        logs.filter(
          (log) =>
            log.username.toLowerCase().includes(query) ||
            log.action.toLowerCase().includes(query) ||
            log.entity_type.toLowerCase().includes(query) ||
            log.details.toLowerCase().includes(query),
        ),
      )
    }
  }, [searchQuery, logs])

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const result = await executeQuery(`
        SELECT l.*, u.username 
        FROM system_logs l
        LEFT JOIN users u ON l.user_id = u.id
        ORDER BY l.created_at DESC
        LIMIT 100
      `)

      if (result.success && result.data) {
        setLogs(result.data)
        setFilteredLogs(result.data)
      } else {
        toast({
          title: "获取日志失败",
          description: "发生错误，请稍后再试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "获取日志失败",
        description: "发生错误，请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case "create":
        return "default"
      case "update":
        return "secondary"
      case "delete":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getActionText = (action: string) => {
    switch (action) {
      case "create":
        return "创建"
      case "update":
        return "更新"
      case "delete":
        return "删除"
      default:
        return action
    }
  }

  const getEntityTypeText = (entityType: string) => {
    switch (entityType) {
      case "scenic_spot":
        return "景点"
      case "wildlife":
        return "动植物"
      case "announcement":
        return "公告"
      case "user":
        return "用户"
      default:
        return entityType
    }
  }

  // 只有管理员可以访问日志页面
  if (currentUser && currentUser.role !== "admin") {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-lg text-gray-500">您没有权限访问此页面</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">系统日志</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="搜索日志..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-center text-gray-500 mb-4">{searchQuery ? "没有找到匹配的日志" : "暂无日志数据"}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>最近操作记录</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center">
                      <Badge variant={getActionColor(log.action)} className="mr-2">
                        {getActionText(log.action)}
                      </Badge>
                      <span className="font-medium">{getEntityTypeText(log.entity_type)}</span>
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(log.created_at)}</span>
                  </div>
                  <p className="text-sm mb-1">{log.details}</p>
                  <p className="text-xs text-gray-500">
                    操作人: {log.username} | ID: {log.entity_id}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
