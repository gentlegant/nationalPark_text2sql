"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle } from "lucide-react"
import { getCurrentUser } from "@/app/actions/auth-actions"

// Mock data for wildlife
const animals = [
  {
    id: 1,
    name: "红松鼠",
    scientificName: "Sciurus vulgaris",
    description: "体型小巧，毛色红褐，尾巴蓬松，主要以坚果和种子为食。",
    imageUrl: "https://images.unsplash.com/photo-1507666405895-422eee7d517f?q=80&w=2070&auto=format&fit=crop",
    conservationStatus: "无危",
    habitat: "森林",
  },
  {
    id: 2,
    name: "梅花鹿",
    scientificName: "Cervus nippon",
    description: "体型优雅，背部有白色斑点，喜欢在林间活动。",
    imageUrl: "https://images.unsplash.com/photo-1484406566174-9da000fda645?q=80&w=2089&auto=format&fit=crop",
    conservationStatus: "易危",
    habitat: "森林、草原",
  },
  {
    id: 3,
    name: "黑熊",
    scientificName: "Ursus thibetanus",
    description: "体型较大，毛色黑亮，胸前有一块V形白斑，杂食性。",
    imageUrl: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=2070&auto=format&fit=crop",
    conservationStatus: "易危",
    habitat: "森林",
  },
]

const plants = [
  {
    id: 1,
    name: "红松",
    scientificName: "Pinus koraiensis",
    description: "常绿乔木，树皮红褐色，松果大而圆，种子可食用。",
    imageUrl: "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?q=80&w=2074&auto=format&fit=crop",
    conservationStatus: "无危",
    habitat: "山地森林",
  },
  {
    id: 2,
    name: "杜鹃花",
    scientificName: "Rhododendron",
    description: "灌木或小乔木，花色艳丽，春季开花，是重要的观赏植物。",
    imageUrl: "https://images.unsplash.com/photo-1589994160839-163cd867cfe8?q=80&w=2070&auto=format&fit=crop",
    conservationStatus: "无危",
    habitat: "山地、丘陵",
  },
  {
    id: 3,
    name: "银杏",
    scientificName: "Ginkgo biloba",
    description: '落叶乔木，树形优美，叶扇形，秋季叶变金黄，被称为"活化石"。',
    imageUrl: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop",
    conservationStatus: "濒危",
    habitat: "温带地区",
  },
]

export default function WildlifePage() {
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string; role: string } | null>(null)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
    }

    fetchCurrentUser()
  }, [])

  // 检查用户是否有编辑权限
  const canEdit = currentUser && (currentUser.role === "admin" || currentUser.role === "staff")

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">动植物管理</h1>
        {canEdit && (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            添加记录
          </Button>
        )}
      </div>

      <Tabs defaultValue="animals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="animals">动物</TabsTrigger>
          <TabsTrigger value="plants">植物</TabsTrigger>
        </TabsList>

        <TabsContent value="animals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {animals.map((animal) => (
              <Card key={animal.id}>
                <img
                  src={animal.imageUrl || "/placeholder.svg"}
                  alt={animal.name}
                  className="w-full h-40 object-cover rounded-t-lg"
                />
                <CardHeader className="pb-2">
                  <CardTitle>{animal.name}</CardTitle>
                  <CardDescription>
                    <em>{animal.scientificName}</em> | {animal.conservationStatus}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{animal.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <strong>栖息地:</strong> {animal.habitat}
                  </p>
                  {canEdit && (
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        编辑
                      </Button>
                      <Button variant="destructive" size="sm">
                        删除
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="plants" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plants.map((plant) => (
              <Card key={plant.id}>
                <img
                  src={plant.imageUrl || "/placeholder.svg"}
                  alt={plant.name}
                  className="w-full h-40 object-cover rounded-t-lg"
                />
                <CardHeader className="pb-2">
                  <CardTitle>{plant.name}</CardTitle>
                  <CardDescription>
                    <em>{plant.scientificName}</em> | {plant.conservationStatus}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{plant.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <strong>生长环境:</strong> {plant.habitat}
                  </p>
                  {canEdit && (
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        编辑
                      </Button>
                      <Button variant="destructive" size="sm">
                        删除
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
