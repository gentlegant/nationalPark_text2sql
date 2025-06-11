"use server";

import { revalidatePath } from "next/cache";
import { executeQuery } from "@/lib/db";

// Types
export type Wildlife = {
  id: number;
  name: string;
  scientific_name: string;
  category_id: number;
  category_name?: string;
  category_type?: string;
  description: string;
  habitat: string;
  conservation_status: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  created_by_name?: string;
};

export type WildlifeCategory = {
  id: number;
  name: string;
  type: string;
  description: string;
  created_at: string;
};

export type WildlifeFormData = {
  name: string;
  scientific_name: string;
  category_id: number;
  description: string;
  habitat: string;
  conservation_status: string;
  image_url: string;
};

// Get all wildlife with category information
export async function getWildlife() {
  try {
    const query = `
      SELECT 
        w.*,
        wc.name as category_name,
        u.username as created_by_name
      FROM wildlife w
      LEFT JOIN wildlife_categories wc ON w.category_id = wc.id
      LEFT JOIN users u ON w.created_by = u.id
      ORDER BY w.name
    `;
    const result = await executeQuery(query);
    return { success: true, data: result.data || [] };
  } catch (error) {
    console.error("Error fetching wildlife:", error);
    return { success: false, error: "获取动植物列表失败" };
  }
}

// Get wildlife by category type (animal or plant)
export async function getWildlifeByCategory(categoryType: string) {
  try {
    const query = `
      SELECT 
        w.*,
        wc.name as category_name,
        wc.type as category_type,
        u.username as created_by_name
      FROM wildlife w
      LEFT JOIN wildlife_categories wc ON w.category_id = wc.id
      LEFT JOIN users u ON w.created_by = u.id
      WHERE wc.type = $1
      ORDER BY w.name
    `;
    const result = await executeQuery(query, [categoryType]);
    return { success: true, data: result.data || [] };
  } catch (error) {
    console.error("Error fetching wildlife by category:", error);
    return { success: false, error: "获取动植物列表失败" };
  }
}

// Get all wildlife categories
export async function getWildlifeCategories() {
  try {
    const query = `
      SELECT * FROM wildlife_categories
      ORDER BY name
    `;
    const result = await executeQuery(query);
    return { success: true, data: result.data || [] };
  } catch (error) {
    console.error("Error fetching wildlife categories:", error);
    return { success: false, error: "获取分类列表失败" };
  }
}

// Get a single wildlife by ID
export async function getWildlifeById(id: number) {
  try {
    const query = `
      SELECT 
        w.*,
        wc.name as category_name,
        u.username as created_by_name
      FROM wildlife w
      LEFT JOIN wildlife_categories wc ON w.category_id = wc.id
      LEFT JOIN users u ON w.created_by = u.id
      WHERE w.id = $1
    `;
    const result = await executeQuery(query, [id]);

    if (result.success && result.data && result.data.length > 0) {
      return { success: true, data: result.data[0] };
    }

    return { success: false, error: "动植物记录不存在" };
  } catch (error) {
    console.error("Error fetching wildlife by ID:", error);
    return { success: false, error: "获取动植物信息失败" };
  }
}

// Create a new wildlife record
export async function createWildlife(data: WildlifeFormData, userId: number) {
  try {
    // Validate required fields
    if (
      !data.name ||
      !data.scientific_name ||
      !data.category_id ||
      !data.description
    ) {
      return { success: false, error: "请填写所有必填字段" };
    }

    const query = `
      INSERT INTO wildlife (
        name, scientific_name, category_id, description, habitat, 
        conservation_status, image_url, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const result = await executeQuery(query, [
      data.name,
      data.scientific_name,
      data.category_id,
      data.description,
      data.habitat,
      data.conservation_status,
      data.image_url || "/placeholder.svg?height=300&width=400",
      userId,
    ]);

    if (!result.success || !result.data || result.data.length === 0) {
      return { success: false, error: "创建动植物记录失败" };
    }

    // Log the action
    await executeQuery(
      `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        "create",
        "wildlife",
        result.data[0].id,
        `Created wildlife: ${data.name}`,
      ]
    );

    revalidatePath("/wildlife");
    return { success: true, data: { id: result.data[0].id } };
  } catch (error) {
    console.error("Error creating wildlife:", error);
    return { success: false, error: "创建动植物记录失败" };
  }
}

// Update an existing wildlife record
export async function updateWildlife(
  id: number,
  data: WildlifeFormData,
  userId: number
) {
  try {
    // Validate required fields
    if (
      !data.name ||
      !data.scientific_name ||
      !data.category_id ||
      !data.description
    ) {
      return { success: false, error: "请填写所有必填字段" };
    }

    const query = `
      UPDATE wildlife
      SET name = $1, scientific_name = $2, category_id = $3, description = $4, 
          habitat = $5, conservation_status = $6, image_url = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING id
    `;

    const result = await executeQuery(query, [
      data.name,
      data.scientific_name,
      data.category_id,
      data.description,
      data.habitat,
      data.conservation_status,
      data.image_url || "/placeholder.svg?height=300&width=400",
      id,
    ]);

    if (!result.success || !result.data || result.data.length === 0) {
      return { success: false, error: "更新动植物记录失败" };
    }

    // Log the action
    await executeQuery(
      `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, "update", "wildlife", id, `Updated wildlife: ${data.name}`]
    );

    revalidatePath("/wildlife");
    return { success: true };
  } catch (error) {
    console.error(`Error updating wildlife with ID ${id}:`, error);
    return { success: false, error: "更新动植物记录失败" };
  }
}

// Delete a wildlife record
export async function deleteWildlife(id: number, userId: number) {
  try {
    // Get the wildlife name before deletion for logging
    const wildlifeResult = await executeQuery(
      "SELECT name FROM wildlife WHERE id = $1",
      [id]
    );
    const wildlifeName =
      wildlifeResult.success &&
      wildlifeResult.data &&
      wildlifeResult.data.length > 0
        ? wildlifeResult.data[0].name
        : "Unknown";

    const query = `
      DELETE FROM wildlife
      WHERE id = $1
      RETURNING id
    `;

    const result = await executeQuery(query, [id]);

    if (!result.success || !result.data || result.data.length === 0) {
      return { success: false, error: "删除动植物记录失败" };
    }

    // Log the action
    await executeQuery(
      `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, "delete", "wildlife", id, `Deleted wildlife: ${wildlifeName}`]
    );

    revalidatePath("/wildlife");
    return { success: true };
  } catch (error) {
    console.error(`Error deleting wildlife with ID ${id}:`, error);
    return { success: false, error: "删除动植物记录失败" };
  }
}
