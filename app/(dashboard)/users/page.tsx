"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, UserPlus, Key } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { getUsers, deleteUser, resetUserPassword, type User } from "@/app/actions/user-actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserForm } from "@/components/user-form"
import { PasswordResetForm } from "@/components/password-reset-form"
import { getCurrentUser } from "@/app/actions/auth-actions"

export default function UsersPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string; role: string } | null>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)

      // 如果用户不是管理员，重定向到仪表板
      if (user && user.role !== "admin") {
        router.push("/dashboard")
      }
    }

    fetchCurrentUser()
    fetchUsers()
  }, [router])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(
        users.filter(
          (user) =>
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.role_name.toLowerCase().includes(query),
        ),
      )
    }
  }, [searchQuery, users])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const result = await getUsers()
      if (result.success) {
        setUsers(result.data)
        setFilteredUsers(result.data)
      } else {
        toast({
          title: "获取用户失败",
          description: result.error || "发生错误，请稍后再试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "获取用户失败",
        description: "发生错误，请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedUser(null)
    setIsFormOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleDelete = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const handleResetPassword = (user: User) => {
    setUserToResetPassword(user)
    setIsResetPasswordOpen(true)
  }

  const confirmDelete = async () => {
    if (!userToDelete || !currentUser) return

    try {
      const result = await deleteUser(userToDelete.id, currentUser.id)

      if (result.success) {
        toast({
          title: "用户已删除",
          description: `用户 "${userToDelete.username}" 已成功删除`,
        })
        fetchUsers()
      } else {
        toast({
          title: "删除失败",
          description: result.error || "发生错误，请稍后再试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: "发生错误，请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const confirmResetPassword = async (password: string) => {
    if (!userToResetPassword || !currentUser) return

    try {
      const result = await resetUserPassword(userToResetPassword.id, password, currentUser.id)

      if (result.success) {
        toast({
          title: "密码已重置",
          description: `用户 "${userToResetPassword.username}" 的密码已成功重置`,
        })
      } else {
        toast({
          title: "重置失败",
          description: result.error || "发生错误，请稍后再试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "重置失败",
        description: "发生错误，请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsResetPasswordOpen(false)
      setUserToResetPassword(null)
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchUsers()
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default"
      case "staff":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "管理员"
      case "staff":
        return "工作人员"
      case "visitor":
        return "访客"
      default:
        return role
    }
  }

  // 只有管理员可以访问用户管理页面
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
        <h1 className="text-2xl font-bold">用户管理</h1>
        <Button onClick={handleAddNew}>
          <UserPlus className="mr-2 h-4 w-4" />
          添加用户
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="搜索用户..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-center text-gray-500 mb-4">{searchQuery ? "没有找到匹配的用户" : "暂无用户数据"}</p>
            {searchQuery ? (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                清除搜索
              </Button>
            ) : (
              <Button onClick={handleAddNew}>添加第一个用户</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">用户名</th>
                <th className="px-4 py-2 text-left">邮箱</th>
                <th className="px-4 py-2 text-left">角色</th>
                <th className="px-4 py-2 text-left">状态</th>
                <th className="px-4 py-2 text-left">创建时间</th>
                <th className="px-4 py-2 text-left">最后登录</th>
                <th className="px-4 py-2 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <Badge variant={getRoleBadgeVariant(user.role_name)}>{getRoleDisplayName(user.role_name)}</Badge>
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant={user.is_active ? "default" : "destructive"}>
                      {user.is_active ? "活跃" : "禁用"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {new Date(user.created_at).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleDateString("zh-CN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "从未登录"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleResetPassword(user)}>
                        <Key className="h-3 w-3 mr-1" />
                        重置密码
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                        编辑
                      </Button>
                      {/* 不允许删除自己 */}
                      {currentUser && currentUser.id !== user.id && (
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(user)}>
                          删除
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedUser ? "编辑用户" : "添加新用户"}</DialogTitle>
          </DialogHeader>
          <UserForm
            user={selectedUser || undefined}
            adminId={currentUser?.id || 1}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
          </DialogHeader>
          <PasswordResetForm
            username={userToResetPassword?.username || ""}
            onSubmit={confirmResetPassword}
            onCancel={() => setIsResetPasswordOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="确认删除"
        description={`您确定要删除用户 "${userToDelete?.username}" 吗？此操作无法撤销。`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteDialogOpen(false)
          setUserToDelete(null)
        }}
      />
    </div>
  )
}
