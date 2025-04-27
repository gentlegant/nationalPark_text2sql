"use server"

import { revalidatePath } from "next/cache"
import { executeQuery } from "@/lib/db"

// Types
export type Announcement = {
  id: number
  title: string
  content: string
  type: string
  start_date: string
  end_date: string
  location: string
  image_url: string
  is_published: boolean
  created_at: string
  updated_at: string
  created_by: number
  created_by_name?: string
}

export type AnnouncementFormData = {
  title: string
  content: string
  type: string
  start_date: string
  end_date: string
  location: string
  image_url: string
  is_published: boolean
}

// Get all announcements
export async function getAnnouncements() {
  try {
    const query = `
      SELECT a.*, u.username as created_by_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      ORDER BY a.start_date DESC
    `
    const result = await executeQuery(query)
    return { success: true, data: result.data || [] }
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return { success: false, error: "获取公告列表失败" }
  }
}

// Get announcement by ID
export async function getAnnouncementById(id: number) {
  try {
    const query = `
      SELECT a.*, u.username as created_by_name
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = $1
    `
    const result = await executeQuery(query, [id])

    if (!result.success || !result.data || result.data.length === 0) {
      return { success: false, error: "公告不存在" }
    }

    return { success: true, data: result.data[0] }
  } catch (error) {
    console.error(`Error fetching announcement with ID ${id}:`, error)
    return { success: false, error: "获取公告详情失败" }
  }
}

// Create a new announcement
export async function createAnnouncement(data: AnnouncementFormData, userId: number) {
  try {
    // Validate required fields
    if (!data.title || !data.content || !data.type) {
      return { success: false, error: "请填写所有必填字段" }
    }

    const query = `
      INSERT INTO announcements (
        title, content, type, start_date, end_date, location, image_url, is_published, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `

    const result = await executeQuery(query, [
      data.title,
      data.content,
      data.type,
      data.start_date,
      data.end_date,
      data.location,
      data.image_url || "/placeholder.svg?height=300&width=400",
      data.is_published,
      userId,
    ])

    if (!result.success || !result.data || result.data.length === 0) {
      return { success: false, error: "创建公告失败" }
    }

    // Log the action
    await executeQuery(
      `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, "create", "announcement", result.data[0].id, `Created announcement: ${data.title}`],
    )

    revalidatePath("/announcements")
    return { success: true, data: { id: result.data[0].id } }
  } catch (error) {
    console.error("Error creating announcement:", error)
    return { success: false, error: "创建公告失败" }
  }
}

// Update an existing announcement
export async function updateAnnouncement(id: number, data: AnnouncementFormData, userId: number) {
  try {
    // Validate required fields
    if (!data.title || !data.content || !data.type) {
      return { success: false, error: "请填写所有必填字段" }
    }

    const query = `
      UPDATE announcements
      SET title = $1, content = $2, type = $3, start_date = $4, end_date = $5, 
          location = $6, image_url = $7, is_published = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING id
    `

    const result = await executeQuery(query, [
      data.title,
      data.content,
      data.type,
      data.start_date,
      data.end_date,
      data.location,
      data.image_url || "/placeholder.svg?height=300&width=400",
      data.is_published,
      id,
    ])

    if (!result.success || !result.data || result.data.length === 0) {
      return { success: false, error: "更新公告失败" }
    }

    // Log the action
    await executeQuery(
      `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, "update", "announcement", id, `Updated announcement: ${data.title}`],
    )

    revalidatePath("/announcements")
    return { success: true }
  } catch (error) {
    console.error(`Error updating announcement with ID ${id}:`, error)
    return { success: false, error: "更新公告失败" }
  }
}

// Delete an announcement
export async function deleteAnnouncement(id: number, userId: number) {
  try {
    // Get the announcement title before deletion for logging
    const announcementResult = await executeQuery("SELECT title FROM announcements WHERE id = $1", [id])
    const announcementTitle =
      announcementResult.success && announcementResult.data && announcementResult.data.length > 0
        ? announcementResult.data[0].title
        : "Unknown"

    const query = "DELETE FROM announcements WHERE id = $1 RETURNING id"
    const result = await executeQuery(query, [id])

    if (!result.success || !result.data || result.data.length === 0) {
      return { success: false, error: "删除公告失败" }
    }

    // Log the action
    await executeQuery(
      `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, "delete", "announcement", id, `Deleted announcement: ${announcementTitle}`],
    )

    revalidatePath("/announcements")
    return { success: true }
  } catch (error) {
    console.error(`Error deleting announcement with ID ${id}:`, error)
    return { success: false, error: "删除公告失败" }
  }
}
