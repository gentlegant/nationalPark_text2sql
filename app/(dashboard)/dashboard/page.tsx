"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Users, MapPin, Leaf, Bell } from "lucide-react";
import { getCurrentUser } from "@/app/actions/auth-actions";

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
    role: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching current user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // 角色中文名称映射
  const roleNameMap: Record<string, string> = {
    admin: "系统管理员",
    staff: "工作人员",
    visitor: "普通访客",
  };

  // 根据角色获取欢迎信息
  const getWelcomeMessage = (role: string) => {
    switch (role) {
      case "admin":
        return "您拥有系统的全部管理权限，可以管理用户、景点、动植物、公告等所有内容。";
      case "staff":
        return "您可以管理景点、动植物和公告信息，但无法管理用户和系统日志。";
      case "visitor":
        return "您可以浏览所有公开信息，使用智能对话功能，但无法进行编辑操作。";
      default:
        return "欢迎使用国家森林公园管理系统。";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">仪表盘</h1>

      {!isLoading && currentUser && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>欢迎，{currentUser.username}！</AlertTitle>
          <AlertDescription>
            您当前的角色是：
            <span className="font-bold">
              {roleNameMap[currentUser.role] || currentUser.role}
            </span>
            。{getWelcomeMessage(currentUser.role)}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">景点总数</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">包含7个特色景点</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">动植物种类</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">13</div>
            <p className="text-xs text-muted-foreground">8种动物和5种植物</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活动公告</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">本月已发布3条公告</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">用户数量</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">包含3种不同角色</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最新公告</CardTitle>
            <CardDescription>近期发布的活动和公告</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-medium">春季森林徒步活动</h3>
                <p className="text-sm text-muted-foreground">
                  2023年4月15日 - 2023年4月20日
                </p>
              </div>
              <div className="border-b pb-2">
                <h3 className="font-medium">森林防火安全提示</h3>
                <p className="text-sm text-muted-foreground">2023年3月28日</p>
              </div>
              <div>
                <h3 className="font-medium">珍稀植物保护计划启动</h3>
                <p className="text-sm text-muted-foreground">2023年3月15日</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>智能对话统计</CardTitle>
            <CardDescription>用户与智能助手的互动情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">本月对话次数</p>
                  <p className="text-sm text-muted-foreground">较上月增长15%</p>
                </div>
                <div className="text-2xl font-bold">245</div>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">平均响应时间</p>
                  <p className="text-sm text-muted-foreground">
                    较上月减少0.3秒
                  </p>
                </div>
                <div className="text-2xl font-bold">1.2s</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">用户满意度</p>
                  <p className="text-sm text-muted-foreground">基于用户反馈</p>
                </div>
                <div className="text-2xl font-bold">92%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
