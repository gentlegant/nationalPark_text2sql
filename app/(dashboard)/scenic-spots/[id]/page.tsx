"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScenicSpotForm } from "@/components/scenic-spot-form"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { getScenicSpotById, deleteScenicSpot, type ScenicSpot } from "@/app/actions/scenic-spot-actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ScenicSpotDetailPage({ params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)
  const router = useRouter()
  const { toast } = useToast()

  const [scenicSpot, setScenicSpot] = useState<ScenicSpot | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Mock user ID - in a real app, this would come from authentication
  const userId = 1

  useEffect(() => {
    if (isNaN(id)) {
      toast({
        title: "无效的景点ID",
        description: "请返回景点列表页面",
        variant: "destructive",
      })
      router.push("/scenic-spots")
      return
    }

    fetchScenicSpot()
  }, [id])

  const fetchScenicSpot = async () => {
    setIsLoading(true)
    try {
      const result = await getScenicSpotById(id)
      if (result.success) {
        setScenicSpot(result.data)
      } else {
        toast({
          title: "获取景点失败",
          description: result.error || "发生错误，请稍后再试",
          variant: "destructive",
        })
        router.push("/scenic-spots")
      }
    } catch (error) {
      toast({
        title: "获取景点失败",
        description: "发生错误，请稍后再试",
        variant: "destructive",
      })
      router.push("/scenic-spots")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setIsFormOpen(true)
  }

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!scenicSpot) return

    try {
      const result = await deleteScenicSpot(scenicSpot.id, userId)

      if (result.success) {
        toast({
          title: "景点已删除",
          description: `景点 "${scenicSpot.name}" 已成功删除`,
        })
        router.push("/scenic-spots")
      } else {
        toast({
          title: "删除失败",
          description: result.error || "发生错误，请稍后再试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: "发生错误，请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchScenicSpot()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!scenicSpot) {
    return null
  }

  // 确保 ticket_price 是数字类型
  const ticketPrice =
    typeof scenicSpot.ticket_price === "number"
      ? scenicSpot.ticket_price.toFixed(2)
      : Number(scenicSpot.ticket_price).toFixed(2)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/scenic-spots")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回列表
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            编辑
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <img
            src={scenicSpot.image_url || "/placeholder.svg?height=400&width=600"}
            alt={scenicSpot.name}
            className="w-full h-auto rounded-lg object-cover"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{scenicSpot.name}</CardTitle>
            <CardDescription>
              开放时间: {scenicSpot.visiting_hours} | 票价: ¥{ticketPrice}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">景点描述</h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{scenicSpot.description}</p>
            </div>

            <div>
              <h3 className="font-medium mb-1">位置</h3>
              <p className="text-gray-600 dark:text-gray-400">{scenicSpot.location}</p>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-gray-500">创建时间: {new Date(scenicSpot.created_at).toLocaleString()}</p>
              {scenicSpot.updated_at && (
                <p className="text-sm text-gray-500">最后更新: {new Date(scenicSpot.updated_at).toLocaleString()}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>编辑景点</DialogTitle>
          </DialogHeader>
          <ScenicSpotForm
            spot={scenicSpot}
            userId={userId}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        title="确认删除"
        description={`您确定要删除景点 "${scenicSpot.name}" 吗？此操作无法撤销。`}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  )
}
