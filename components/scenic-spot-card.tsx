"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import type { ScenicSpot } from "@/app/actions/scenic-spot-actions"

interface ScenicSpotCardProps {
  spot: ScenicSpot
  onEdit: (spot: ScenicSpot) => void
  onDelete: (spot: ScenicSpot) => void
  canEdit?: boolean
}

export function ScenicSpotCard({ spot, onEdit, onDelete, canEdit = true }: ScenicSpotCardProps) {
  // 确保 ticket_price 是数字类型
  const ticketPrice =
    typeof spot.ticket_price === "number" ? spot.ticket_price.toFixed(2) : Number(spot.ticket_price).toFixed(2)

  return (
    <Card className="h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          src={spot.image_url || "/placeholder.svg?height=300&width=400"}
          alt={spot.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{spot.name}</CardTitle>
        <CardDescription>
          开放时间: {spot.visiting_hours} | 票价: ¥{ticketPrice}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-2">{spot.description}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>位置:</strong> {spot.location}
        </p>
      </CardContent>
      {canEdit && (
        <CardFooter className="flex justify-between pt-2 border-t">
          <Button variant="outline" size="sm" onClick={() => onEdit(spot)}>
            <Edit className="h-4 w-4 mr-1" /> 编辑
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(spot)}>
            <Trash2 className="h-4 w-4 mr-1" /> 删除
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
