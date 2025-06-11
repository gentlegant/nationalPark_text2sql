"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import {
  getUserPreferences,
  type UserPreferences,
} from "@/app/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchPreferences() {
    try {
      setLoading(true);
      setError(null);
      console.log("开始获取用户设置");
      const prefs = await getUserPreferences();
      console.log("获取到用户设置:", prefs);
      setPreferences(prefs);
    } catch (err) {
      console.error("获取设置失败:", err);
      setError("加载设置失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPreferences();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">正在加载设置...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button
            onClick={fetchPreferences}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            重试
          </Button>
        </div>
      </div>
    );
  }

  // 如果没有获取到设置，使用默认设置
  const defaultPreferences: UserPreferences = {
    notification_enabled: true,
    theme: "light",
    language: "zh-CN",
  };

  const userPreferences = preferences || defaultPreferences;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">设置</h1>
        <p className="text-muted-foreground">管理您的账户设置和偏好</p>
      </div>

      <Separator className="my-6" />

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="appearance">外观</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <ThemeSettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings initialSettings={userPreferences} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
