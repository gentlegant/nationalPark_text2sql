"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { type UserPreferences, updateUserPreferences } from "@/app/actions/settings-actions"
import { toast } from "@/components/ui/use-toast"
import { Moon, Sun, Monitor } from "lucide-react"

interface ThemeSettingsProps {
  initialSettings: UserPreferences
}

export function ThemeSettings({ initialSettings }: ThemeSettingsProps) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">(initialSettings.theme as any)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateUserPreferences({
        theme,
      })

      if (result.success) {
        toast({
          title: "设置已更新",
          description: "您的主题设置已成功更新。",
        })
      } else {
        toast({
          title: "更新失败",
          description: result.message || "无法更新主题设置。",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "更新失败",
        description: "发生错误，无法更新主题设置。",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>主题设置</CardTitle>
        <CardDescription>自定义应用程序的外观</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={theme} onValueChange={(value) => setTheme(value as any)} className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light" className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              浅色模式
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark" className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              深色模式
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="system" id="system" />
            <Label htmlFor="system" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              跟随系统
            </Label>
          </div>
        </RadioGroup>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "保存中..." : "保存设置"}
        </Button>
      </CardContent>
    </Card>
  )
}
