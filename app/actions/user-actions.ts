"use server"

import { executeQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { hashPassword } from "@/lib/auth" // 确保这里导入的是从lib/auth中导出的hashPassword

// Types
export type User = {
  id: number
  username: string
  email: string
  full_name: string | null
  role_name: string
  is_active: boolean
  created_at: string
  last_login: string | null
  updated_at: string | null
}

export type UserFormData = {
  username: string
  email: string
  password?: string
  role_id: number
  is_active: boolean
}

// 获取用户列表
export async function getUsers() {
  const query = `
    SELECT u.id, u.username, u.email, u.full_name, u.is_active, u.created_at, u.last_login, r.name as role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    ORDER BY u.created_at DESC
  `

  return executeQuery(query)
}

// 获取单个用户
export async function getUserById(id: string) {
  const query = `
    SELECT u.id, u.username, u.email, u.full_name, u.is_active, u.created_at, r.name as role_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    WHERE u.id = $1
  `

  const result = await executeQuery(query, [id])

  if (result.success && result.data && result.data.length > 0) {
    return { success: true, data: result.data[0] }
  }

  return { success: false, error: "User not found" }
}

// 创建用户
export async function createUser(userData: UserFormData, adminId: number) {
  try {
    // 检查用户名是否已存在
    const checkUsername = await executeQuery("SELECT id FROM users WHERE username = $1", [userData.username])
    if (checkUsername.success && checkUsername.data && checkUsername.data.length > 0) {
      return { success: false, error: "用户名已存在" }
    }

    // 检查邮箱是否已存在
    const checkEmail = await executeQuery("SELECT id FROM users WHERE email = $1", [userData.email])
    if (checkEmail.success && checkEmail.data && checkEmail.data.length > 0) {
      return { success: false, error: "邮箱已存在" }
    }

    // 使用hashPassword函数
    const hashedPassword = await hashPassword(userData.password!)

    const query = `
      INSERT INTO users (username, email, password_hash, role_id, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `

    const result = await executeQuery(query, [
      userData.username,
      userData.email,
      hashedPassword,
      userData.role_id,
      userData.is_active,
    ])

    if (result.success) {
      // Log the action
      await executeQuery(
        `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [adminId, "create", "user", result.data[0].id, `Created user: ${userData.username}`],
      )

      revalidatePath("/users")
    }

    return result
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, error: "Failed to create user" }
  }
}

// 更新用户
export async function updateUser(id: number, userData: UserFormData, adminId: number) {
  try {
    // 检查邮箱是否已被其他用户使用
    const checkEmail = await executeQuery("SELECT id FROM users WHERE email = $1 AND id != $2", [userData.email, id])
    if (checkEmail.success && checkEmail.data && checkEmail.data.length > 0) {
      return { success: false, error: "邮箱已被其他用户使用" }
    }

    let query
    let params

    if (userData.password) {
      // 使用hashPassword函数
      const hashedPassword = await hashPassword(userData.password)

      query = `
        UPDATE users
        SET username = $1, email = $2, password_hash = $3, role_id = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING id
      `
      params = [userData.username, userData.email, hashedPassword, userData.role_id, userData.is_active, id]
    } else {
      query = `
        UPDATE users
        SET username = $1, email = $2, role_id = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING id
      `
      params = [userData.username, userData.email, userData.role_id, userData.is_active, id]
    }

    const result = await executeQuery(query, params)

    if (result.success) {
      // Log the action
      await executeQuery(
        `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [adminId, "update", "user", id, `Updated user: ${userData.username}`],
      )

      revalidatePath("/users")
    }

    return result
  } catch (error) {
    console.error("Error updating user:", error)
    return { success: false, error: "Failed to update user" }
  }
}

// 删除用户
export async function deleteUser(id: number, adminId: number) {
  try {
    // Get the username before deletion for logging
    const userResult = await executeQuery("SELECT username FROM users WHERE id = $1", [id])
    const username =
      userResult.success && userResult.data && userResult.data.length > 0 ? userResult.data[0].username : "Unknown"

    const query = `
      DELETE FROM users
      WHERE id = $1
      RETURNING id
    `

    const result = await executeQuery(query, [id])

    if (result.success) {
      // Log the action
      await executeQuery(
        `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [adminId, "delete", "user", id, `Deleted user: ${username}`],
      )

      revalidatePath("/users")
    }

    return result
  } catch (error) {
    console.error("Error deleting user:", error)
    return { success: false, error: "Failed to delete user" }
  }
}

// 重置用户密码
export async function resetUserPassword(id: number, newPassword: string, adminId: number) {
  try {
    // 使用hashPassword函数
    const hashedPassword = await hashPassword(newPassword)

    const query = `
      UPDATE users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id
    `

    const result = await executeQuery(query, [hashedPassword, id])

    if (result.success) {
      // Log the action
      await executeQuery(
        `INSERT INTO system_logs (user_id, action, entity_type, entity_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [adminId, "update", "user", id, `Reset password for user: ${id}`],
      )
    }

    return result
  } catch (error) {
    console.error("Error resetting user password:", error)
    return { success: false, error: "Failed to reset user password" }
  }
}

// 获取角色列表
export async function getRoles() {
  const query = `
    SELECT id, name, description
    FROM roles
    ORDER BY id
  `

  return executeQuery(query)
}
