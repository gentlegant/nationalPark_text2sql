"use client";

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/app/actions/auth-actions";
import { getUserById } from "@/app/actions/user-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Mail, MapPin, User, Loader2 } from "lucide-react";

type UserProfile = {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  role_name: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  updated_at: string | null;
};

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
    role: string;
  } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 获取当前登录用户信息
        const user = await getCurrentUser();
        if (!user) {
          setError("未登录或会话已过期");
          return;
        }

        setCurrentUser(user);

        // 获取用户详细资料
        const profileResult = await getUserById(user.id.toString());
        if (profileResult.success) {
          setUserProfile(profileResult.data);
        } else {
          setError("无法获取用户资料");
        }
      } catch (err) {
        console.error("获取用户数据失败:", err);
        setError("获取用户数据失败");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // 获取用户首字母作为头像备用显示
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // 获取角色显示名称
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "系统管理员";
      case "staff":
        return "工作人员";
      case "visitor":
        return "访客";
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  if (!currentUser || !userProfile) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-lg text-gray-500">用户信息不完整</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">个人资料</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage
                src="/placeholder.svg?height=96&width=96"
                alt={userProfile.username}
              />
              <AvatarFallback>
                {getInitials(userProfile.username)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">
              {userProfile.full_name || userProfile.username}
            </h2>
            <p className="text-muted-foreground">
              {getRoleDisplayName(userProfile.role_name)}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">用户名</p>
                  <p>{userProfile.username}</p>
                </div>
              </div>

              {userProfile.full_name && (
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">姓名</p>
                    <p>{userProfile.full_name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">邮箱</p>
                  <p>{userProfile.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">角色</p>
                  <p>{getRoleDisplayName(userProfile.role_name)}</p>
                </div>
              </div>

              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">注册时间</p>
                  <p>
                    {new Date(userProfile.created_at).toLocaleString("zh-CN")}
                  </p>
                </div>
              </div>

              {userProfile.last_login && (
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">最后登录</p>
                    <p>
                      {new Date(userProfile.last_login).toLocaleString("zh-CN")}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center">
                <div className="h-5 w-5 mr-2 text-muted-foreground">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      userProfile.is_active ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">账户状态</p>
                  <p>{userProfile.is_active ? "活跃" : "已禁用"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
