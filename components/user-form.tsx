"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { createUser, updateUser, getRoles, type User, type UserFormData } from "@/app/actions/user-actions"

interface UserFormProps {
  user?: User
  adminId: number
  onSuccess?: () => void
  onCancel?: () => void
}

interface Role {
  id: number
  name: string
  description: string
}

export function UserForm({ user, adminId, onSuccess, onCancel }: UserFormProps) {
  const isEditing = !!user
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    role_id: 3, // 默认为访客角色
    is_active: true,
  })

  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRoles, setIsLoadingRoles] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // 获取所有角色
    const fetchRoles = async () => {
      try {
        const result = await getRoles()
        if (result.success) {
          setRoles(result.data)
        } else {
          toast({
            title: "获取角色失败",
            description: result.error || "发生错误，请稍后再试",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching roles:", error)
        toast({
          title: "获取角色失败",
          description: "发生错误，请稍后再试",
          variant: "destructive",
        })
      } finally {
        setIsLoadingRoles(false)
      }
    }

    fetchRoles()
  }, [toast])

  useEffect(() => {
    if (user && roles.length > 0) {
      // 根据角色名称找到对应的角色ID
      const roleId = roles.find((r) => r.name === user.role_name)?.id || 3

      setFormData({
        username: user.username,
        email: user.email,
        password: "", // 编辑时不填充密码
        role_id: roleId,
        is_active: user.is_active,
      })
    }
  }, [user, roles])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string | boolean | number },
  ) => {
    const { name, value } = "target" in e ? e.target : e
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // 清除对应字段的错误
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = "用户名不能为空"
    }

    if (!formData.email.trim()) {
      newErrors.email = "邮箱不能为空"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "邮箱格式不正确"
    }

    if (!isEditing && !formData.password) {
      newErrors.password = "密码不能为空"
    } else if (!isEditing && formData.password && formData.password.length < 6) {
      newErrors.password = "密码长度不能少于6个字符"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      let result

      if (isEditing && user) {
        result = await updateUser(user.id, formData, adminId)
      } else {
        result = await createUser(formData, adminId)
      }

      if (result.success) {
        toast({
          title: isEditing ? "用户已更新" : "用户已创建",
          description: isEditing ? "用户信息已成功更新" : "新用户已成功创建",
        })

        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/users")
        }
      } else {
        toast({
          title: "操作失败",
          description: result.error || "发生错误，请稍后再试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "操作失败",
        description: "发生错误，请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingRoles) {
    return <div>加载角色信息...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">用户名 *</Label>
        <Input
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={errors.username ? "border-red-500" : ""}
        />
        {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">邮箱 *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{isEditing ? "密码 (留空保持不变)" : "密码 *"}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        {!errors.password && (
          <p className="text-xs text-gray-500">{isEditing ? "如果不需要修改密码，请留空" : "密码长度至少为6个字符"}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>角色 *</Label>
        <RadioGroup
          value={formData.role_id.toString()}
          onValueChange={(value) => handleChange({ name: "role_id", value: Number.parseInt(value) })}
          className="flex flex-col space-y-2"
        >
          {roles.map((role) => (
            <div key={role.id} className="flex items-center space-x-2">
              <RadioGroupItem value={role.id.toString()} id={`role-${role.id}`} />
              <Label htmlFor={`role-${role.id}`} className="cursor-pointer">
                {role.name === "admin" ? "管理员" : role.name === "staff" ? "工作人员" : "访客"}
                {role.description && <span className="text-xs text-gray-500 ml-2">({role.description})</span>}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => handleChange({ name: "is_active", value: checked })}
        />
        <Label htmlFor="is_active">账户激活</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          取消
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? "更新中..." : "创建中...") : isEditing ? "更新用户" : "创建用户"}
        </Button>
      </div>
    </form>
  )
}
