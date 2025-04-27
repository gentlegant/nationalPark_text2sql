"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Search, Loader2, Calendar, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { getAnnouncements, deleteAnnouncement, type Announcement } from "@/app/actions/announcement-actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AnnouncementForm } from "@/components/announcement-form"
import { getCurrentUser } from "@/app/actions/auth-actions"

export default function AnnouncementsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string; role: string } | null>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
    }

    fetchCurrentUser()
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAnnouncements(announcements)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredAnnouncements(
        announcements.filter(
          (announcement) =>
            announcement.title.toLowerCase().includes(query) ||
            announcement.content.toLowerCase().includes(query) ||
            announcement.location.toLowerCase().includes(query),
        ),
      )
    }
  }, [searchQuery, announcements])

  const fetchAnnouncements = async () => {
    setIsLoading(true)
    try {
      const result = await getAnnouncements()
      if (result.success) {
        setAnnouncements(result.data)
        setFilteredAnnouncements(result.data)
      } else {
        toast({
          title: "获取公告失败",
          description: result.error || "发生错误，请稍后再试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "获取公告失败",
        description: "发生错误，请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedAnnouncement(null)
    setIsFormOpen(true)
  }

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setIsFormOpen(true)
  }

  const handleDelete = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!announcementToDelete || !currentUser) return

    try {
      const result = await deleteAnnouncement(announcementToDelete.id, currentUser.id)

      if (result.success) {
        toast({
          title: "公告已删除",
          description: `公告 "${announcementToDelete.title}" 已成功删除`,
        })
        fetchAnnouncements()
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
      setAnnouncementToDelete(null)
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    fetchAnnouncements()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // 检查用户是否有编辑权限
  const canEdit = currentUser && (currentUser.role === "admin" || currentUser.role === "staff")

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">活动公告</h1>
        {canEdit && (
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            添加公告
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="搜索公告..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-center text-gray-500 mb-4">{searchQuery ? "没有找到匹配的公告" : "暂无公告数据"}</p>
            {searchQuery ? (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                清除搜索
              </Button>
            ) : canEdit ? (
              <Button onClick={handleAddNew}>添加第一个公告</Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {announcement.image_url && (
                  <div className="md:w-1/4 h-48 md:h-auto">
                    <img
                      src={announcement.image_url || "/placeholder.svg"}
                      alt={announcement.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className={`flex-1 p-4 ${announcement.image_url ? "md:w-3/4" : "w-full"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-xl font-bold">{announcement.title}</h2>
                      <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {formatDate(announcement.start_date)}
                            {announcement.end_date && ` 至 ${formatDate(announcement.end_date)}`}
                          </span>
                        </div>
                        {announcement.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{announcement.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={announcement.type === "activity" ? "default" : "secondary"}>
                      {announcement.type === "activity" ? "活动" : "公告"}
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{announcement.content}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {announcement.is_published ? "已发布" : "未发布"} · 由 {announcement.created_by_name || "未知"}{" "}
                      创建
                    </div>
                    {canEdit && (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(announcement)}>
                          编辑
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(announcement)}>
                          删除
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {canEdit && (
        <>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{selectedAnnouncement ? "编辑公告" : "添加新公告"}</DialogTitle>
              </DialogHeader>
              <AnnouncementForm
                announcement={selectedAnnouncement || undefined}
                userId={currentUser?.id || 1}
                onSuccess={handleFormSuccess}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            title="确认删除"
            description={`您确定要删除公告 "${announcementToDelete?.title}" 吗？此操作无法撤销。`}
            onConfirm={confirmDelete}
            onCancel={() => {
              setIsDeleteDialogOpen(false)
              setAnnouncementToDelete(null)
            }}
          />
        </>
      )}
    </div>
  )
}
