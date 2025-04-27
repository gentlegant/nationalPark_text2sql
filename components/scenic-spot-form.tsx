"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  createScenicSpot,
  updateScenicSpot,
  type ScenicSpot,
  type ScenicSpotFormData,
} from "@/app/actions/scenic-spot-actions"

interface ScenicSpotFormProps {
  spot?: ScenicSpot
  userId: number
  onSuccess?: () => void
  onCancel?: () => void
}

export function ScenicSpotForm({ spot, userId, onSuccess, onCancel }: ScenicSpotFormProps) {
  const isEditing = !!spot
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState<ScenicSpotFormData>({
    name: "",
    description: "",
    location: "",
    image_url: "",
    visiting_hours: "",
    ticket_price: 0,
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (spot) {
      setFormData({
        name: spot.name,
        description: spot.description,
        location: spot.location,
        image_url: spot.image_url,
        visiting_hours: spot.visiting_hours,
        ticket_price: spot.ticket_price,
      })
    }
  }, [spot])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ticket_price" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let result

      if (isEditing && spot) {
        result = await updateScenicSpot(spot.id, formData, userId)
      } else {
        result = await createScenicSpot(formData, userId)
      }

      if (result.success) {
        toast({
          title: isEditing ? "景点已更新" : "景点已创建",
          description: isEditing ? "景点信息已成功更新" : "新景点已成功创建",
        })

        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/scenic-spots")
        }
      } else {
        toast({
          title: "操作失败",
          description: result.error || "发生错误，请稍后再试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "操作失败",
        description: "发生错误，请稍后再试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">景点名称 *</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">景点描述 *</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">位置 *</Label>
        <Input id="location" name="location" value={formData.location} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">图片URL</Label>
        <Input
          id="image_url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="/placeholder.svg?height=300&width=400"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="visiting_hours">开放时间 *</Label>
        <Input
          id="visiting_hours"
          name="visiting_hours"
          value={formData.visiting_hours}
          onChange={handleChange}
          placeholder="8:00 - 17:30"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ticket_price">票价 (¥) *</Label>
        <Input
          id="ticket_price"
          name="ticket_price"
          type="number"
          min="0"
          step="0.01"
          value={formData.ticket_price}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          取消
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? "更新中..." : "创建中...") : isEditing ? "更新景点" : "创建景点"}
        </Button>
      </div>
    </form>
  )
}
