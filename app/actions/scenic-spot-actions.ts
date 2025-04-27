"use server"

import { revalidatePath } from "next/cache"
import { executeQuery } from "@/lib/db"

// Types
export type ScenicSpot = {
  id: number
  name: string
  description: string
  location: string
  image_url: string
  visiting_hours: string
  ticket_price: number
  popularity: number
  created_at: string
  updated_at: string
  created_by: number
}

export type ScenicSpotFormData = {
  name: string
  description: string
  location: string
  image_url: string
  visiting_hours: string
  ticket_price: number
}

// Get all scenic spots
export async function getScenicSpots() {
  try {
    const query = `
      SELECT s.*, u.username as created_by_name
      FROM scenic_spots s
      LEFT JOIN users u ON s.created_by = u.id
      ORDER BY s.name
    `
    const result = await executeQuery(query)
    return { success: true, data: result.data || [] }
  } catch (error) {
    console.error("Error fetching scenic spots:", error)
    return { success: false, error: "获取景点列表失败" }
  }
}

// Get scenic spot by ID
export async function getScenicSpotById(id: number) {
  try {
    const query = `
      SELECT s.*, u.username as created_by_name
      FROM scenic_spots s
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.id = $1
    `
    const result = await executeQuery(query, [id])

    if (!result.success || !result.data || result.data.length === 0) {
      return { success: false, error: "景点不存在" }
    }

    return { success: true, data: result.data[0] }
  } catch (error) {
    console.error(`Error fetching scenic spot with ID ${id}:`, error)
    return { success: false, error: "获取景点详情失败" }
  }
}

// Create a new scenic spot
export async function createScenicSpot(data: ScenicSpotFormData, userId: number) {
  try {
    // Validate required fields
    if (!data.name || !data.description || !data.location || !data.visiting_hours) {
      return { success: false, error: "请填写所有必填字段" }
    }

    // Validate ticket price
    if (isNaN(data.ticket_price) || data.ticket_price < 0) {
      return { success: false, error: "票价必须是非负数" }
    }

    const query = `
      INSERT INTO scenic_spots (
        name, description, location, image_url, visiting_hours, ticket_price, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `

    const result = await executeQuery(query, [
      data.name,
      data.description,
      data.location,
      data.image_url || "/placeholder.svg?height=300&width=400",
      data.visiting_hours,
      data.ticket_price,
      userId,
    ])

    if (!result.success || !result.data || result.data.length === 0) {
      return { success: false, error: "创建景点失败" }
    }

    // Log the action
    await executeQuery(
      `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, "create", "scenic_spot", result.data[0].id, `Created scenic spot: ${data.name}`],
    )

    revalidatePath("/scenic-spots")
    return { success: true, data: { id: result.data[0].id } }
  } catch (error) {
    console.error("Error creating scenic spot:", error)
    return { success: false, error: "创建景点失败" }
  }
}

// Update an existing scenic spot
export async function updateScenicSpot(id: number, data: ScenicSpotFormData, userId: number) {
  try {
    // Validate required fields
    if (!data.name || !data.description || !data.location || !data.visiting_hours) {
      return { success: false, error: "请填写所有必填字段" }
    }

    // Validate ticket price
    if (isNaN(data.ticket_price) || data.ticket_price < 0) {
      return { success: false, error: "票价必须是非负数" }
    }

    const query = `
      UPDATE scenic_spots
      SET name = $1, description = $2, location = $3, image_url = $4, 
          visiting_hours = $5, ticket_price = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING id
    `

    const result = await executeQuery(query, [
      data.name,
      data.description,
      data.location,
      data.image_url || "/placeholder.svg?height=300&width=400",
      data.visiting_hours,
      data.ticket_price,
      id,
    ])

    if (!result.success || !result.data || result.data.length === 0) {
      return { success: false, error: "更新景点失败" }
    }

    // Log the action
    await executeQuery(
      `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, "update", "scenic_spot", id, `Updated scenic spot: ${data.name}`],
    )

    revalidatePath("/scenic-spots")
    return { success: true }
  } catch (error) {
    console.error(`Error updating scenic spot with ID ${id}:`, error)
    return { success: false, error: "更新景点失败" }
  }
}

// Delete a scenic spot
export async function deleteScenicSpot(id: number, userId: number) {
  try {
    // Get the scenic spot name before deletion for logging
    const spotResult = await executeQuery("SELECT name FROM scenic_spots WHERE id = $1", [id])
    const spotName =
      spotResult.success && spotResult.data && spotResult.data.length > 0 ? spotResult.data[0].name : "Unknown"

    const query = "DELETE FROM scenic_spots WHERE id = $1 RETURNING id"
    const result = await executeQuery(query, [id])

    if (!result.success || !result.data || result.data.length === 0) {
      return { success: false, error: "删除景点失败" }
    }

    // Log the action
    await executeQuery(
      `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, "delete", "scenic_spot", id, `Deleted scenic spot: ${spotName}`],
    )

    revalidatePath("/scenic-spots")
    return { success: true }
  } catch (error) {
    console.error(`Error deleting scenic spot with ID ${id}:`, error)
    return { success: false, error: "删除景点失败" }
  }
}
