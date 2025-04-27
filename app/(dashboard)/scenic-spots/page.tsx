"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ScenicSpotCard } from "@/components/scenic-spot-card"
import { ScenicSpotForm } from "@/components/scenic-spot-form"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { getScenicSpots, deleteScenicSpot, type ScenicSpot } from "@/app/actions/scenic-spot-actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getCurrentUser } from "@/app/actions/auth-actions"

export default function ScenicSpotsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [scenicSpots, setScenicSpots] = useState<ScenicSpot[]>([])
  const [filteredSpots, setFilteredSpots] = useState<ScenicSpot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string; role: string } | null>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSpot, setSelectedSpot] = useState<ScenicSpot | null>(null)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [spotToDelete, setSpotToDelete] = useState<ScenicSpot | null>(null)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
    }

    fetchCurrentUser()
    fetchScenicSpots()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSpots(scenicSpots)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredSpots(
        scenicSpots.filter(
          (spot) =>
            spot.name.toLowerCase().includes(query) ||
            spot.description.toLowerCase().includes(query) ||
            spot.location.toLowerCase().includes(query),
        ),
      )
    }
  }, [searchQuery, scenicSpots])

  const fetchScenicSpots = async () => {
    setIsLoading(true)
    try {
      const result = await getScenicSpots()
      if (result.success) {
        setScenicSpots(result.data)
        setFilteredSpots(result.data)
      } else {
        toast({
          title: "获取景点失败",
          description: result.error || "发生错误，请稍后再试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "获取景点失败",
        description: "发生错误，请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedSpot(null)
    setIsFormOpen(true)
  }

  const handleEdit = (spot: ScenicSpot) => {
    setSelectedSpot(spot)
    setIsFormOpen(true)
  }

  const handleDelete = (spot: ScenicSpot) => {
    setSpotToDelete(spot)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!spotToDelete || !currentUser) return

    try {
      const result = await deleteScenicSpot(spotToDelete.id, currentUser.id)

      if (result.success) {
        toast({
          title: "景点已删除",
          description: `景点 "${spotToDelete.name}" 已成功删除`,
        })
        fetchScenicSpots()
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
      setSpotToDelete(null)
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchScenicSpots()
  }

  // 检查用户是否有编辑权限
  const canEdit = currentUser && (currentUser.role === "admin" || currentUser.role === "staff")

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">景点管理</h1>
        {canEdit && (
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            添加景点
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="搜索景点..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredSpots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-center text-gray-500 mb-4">{searchQuery ? "没有找到匹配的景点" : "暂无景点数据"}</p>
            {searchQuery ? (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                清除搜索
              </Button>
            ) : canEdit ? (
              <Button onClick={handleAddNew}>添加第一个景点</Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSpots.map((spot) => (
            <ScenicSpotCard
              key={spot.id}
              spot={spot}
              onEdit={canEdit ? handleEdit : () => {}}
              onDelete={canEdit ? handleDelete : () => {}}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}

      {canEdit && (
        <>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{selectedSpot ? "编辑景点" : "添加新景点"}</DialogTitle>
              </DialogHeader>
              <ScenicSpotForm
                spot={selectedSpot || undefined}
                userId={currentUser?.id || 1}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            title="确认删除"
            description={`您确定要删除景点 "${spotToDelete?.name}" 吗？此操作无法撤销。`}
            onConfirm={confirmDelete}
            onCancel={() => {
              setIsDeleteDialogOpen(false)
              setSpotToDelete(null)
            }}
          />
        </>
      )}
    </div>
  )
}
