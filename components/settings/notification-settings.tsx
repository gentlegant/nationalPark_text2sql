"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { type UserPreferences, updateUserPreferences } from "@/app/actions/settings-actions"
import { toast } from "@/components/ui/use-toast"

interface NotificationSettingsProps {
  initialSettings: UserPreferences
}

export function NotificationSettings({ initialSettings }: NotificationSettingsProps) {
  const [notificationEnabled, setNotificationEnabled] = useState(initialSettings.notification_enabled)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateUserPreferences({
        notification_enabled: notificationEnabled,
      })

      if (result.success) {
        toast({
          title: "设置已更新",
          description: "您的通知设置已成功更新。",
        })
      } else {
        toast({
          title: "更新失败",
          description: result.message || "无法更新通知设置。",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "更新失败",
        description: "发生错误，无法更新通知设置。",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>通知设置</CardTitle>
        <CardDescription>配置您希望接收的通知类型</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="email-notifications">电子邮件通知</Label>
            <p className="text-sm text-muted-foreground">接收有关系统更新、活动和公告的电子邮件通知</p>
          </div>
          <Switch id="email-notifications" checked={notificationEnabled} onCheckedChange={setNotificationEnabled} />
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "保存中..." : "保存设置"}
        </Button>
      </CardContent>
    </Card>
  )
}
