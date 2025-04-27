"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { type UserPreferences, updateUserPreferences } from "@/app/actions/settings-actions"
import { toast } from "@/components/ui/use-toast"
import { Globe } from "lucide-react"

interface LanguageSettingsProps {
  initialSettings: UserPreferences
}

export function LanguageSettings({ initialSettings }: LanguageSettingsProps) {
  const [language, setLanguage] = useState<"zh-CN" | "en-US">(initialSettings.language as any)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateUserPreferences({
        language,
      })

      if (result.success) {
        toast({
          title: "设置已更新",
          description: "您的语言设置已成功更新。",
        })
      } else {
        toast({
          title: "更新失败",
          description: result.message || "无法更新语言设置。",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "更新失败",
        description: "发生错误，无法更新语言设置。",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>语言设置</CardTitle>
        <CardDescription>选择您偏好的语言</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={language} onValueChange={(value) => setLanguage(value as any)} className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="zh-CN" id="zh-CN" />
            <Label htmlFor="zh-CN" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              简体中文
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="en-US" id="en-US" />
            <Label htmlFor="en-US" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              English (US)
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
