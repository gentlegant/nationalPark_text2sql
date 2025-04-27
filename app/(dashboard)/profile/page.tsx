import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getUserById } from "@/app/actions/user-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Mail, MapPin, User } from "lucide-react"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return <div>未授权访问</div>
  }

  const userId = session.user.id
  const user = await getUserById(userId)

  if (!user) {
    return <div>用户不存在</div>
  }

  // 获取用户首字母作为头像备用显示
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">个人资料</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src="/placeholder.svg?height=96&width=96" alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-muted-foreground">{user.role}</p>
            <div className="mt-4 w-full">
              <Button className="w-full" variant="outline">
                编辑资料
              </Button>
            </div>
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
                  <p className="text-sm text-muted-foreground">姓名</p>
                  <p>{user.name}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">邮箱</p>
                  <p>{user.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">角色</p>
                  <p>{user.role}</p>
                </div>
              </div>

              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">注册时间</p>
                  <p>{new Date(user.created_at).toLocaleString("zh-CN")}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
