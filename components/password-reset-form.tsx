"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PasswordResetFormProps {
  username: string
  onSubmit: (password: string) => void
  onCancel: () => void
}

export function PasswordResetForm({ username, onSubmit, onCancel }: PasswordResetFormProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("密码长度不能少于6个字符")
      return
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致")
      return
    }

    setIsLoading(true)
    onSubmit(password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-4">
          您正在为用户 <strong>{username}</strong> 重置密码。
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">新密码</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <p className="text-xs text-gray-500">密码长度至少为6个字符</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">确认密码</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          取消
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "重置中..." : "重置密码"}
        </Button>
      </div>
    </form>
  )
}
