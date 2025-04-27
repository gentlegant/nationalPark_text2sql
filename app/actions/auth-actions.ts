"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { executeQuery } from "@/lib/db"
import { verifyPassword, hashPassword } from "@/lib/auth"

// Type definitions
type LoginResult = {
  success: boolean
  message: string
  userId?: number
  username?: string
  role?: string
}

type RegisterResult = {
  success: boolean
  message: string
  userId?: number
}

// Login action
export async function login(formData: FormData): Promise<LoginResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("Login attempt for email:", email)

  if (!email || !password) {
    console.log("Missing email or password")
    return { success: false, message: "请输入邮箱和密码" }
  }

  try {
    // Get user from database
    const query = `
      SELECT u.id, u.username, u.password_hash, r.name as role_name 
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1 AND u.is_active = true
    `
    console.log("Executing query to find user")
    const result = await executeQuery(query, [email])
    console.log("Query result:", JSON.stringify(result))

    // 检查是否有数据库错误
    if (!result.success) {
      console.error("Database error:", result.error)
      return { success: false, message: "数据库连接错误，请稍后再试" }
    }

    // 检查数据是否为空
    if (!result.data || result.data.length === 0) {
      console.log("No user found with email:", email)
      return { success: false, message: "用户不存在或已被禁用" }
    }

    const user = result.data[0]
    console.log("User found:", user.username)

    // Verify password
    console.log("Verifying password")
    const isValid = await verifyPassword(password, user.password_hash)
    console.log("Password valid:", isValid)

    if (!isValid) {
      return { success: false, message: "密码错误" }
    }

    // Set session cookie
    console.log("Setting cookies")
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    cookies().set("userId", user.id.toString(), { expires, httpOnly: true })
    cookies().set("username", user.username, { expires, httpOnly: true })
    cookies().set("role", user.role_name || "visitor", { expires, httpOnly: true })
    console.log("Cookies set successfully")

    // Update last login time
    console.log("Updating last login time")
    await executeQuery("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [user.id])
    console.log("Last login time updated")

    return {
      success: true,
      message: "登录成功",
      userId: user.id,
      username: user.username,
      role: user.role_name || "visitor",
    }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "登录失败，请稍后再试" }
  }
}

// Register action
export async function register(formData: FormData): Promise<RegisterResult> {
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!username || !email || !password || !confirmPassword) {
    return { success: false, message: "请填写所有必填字段" }
  }

  if (password !== confirmPassword) {
    return { success: false, message: "两次输入的密码不一致" }
  }

  try {
    // Check if user already exists
    const checkResult = await executeQuery("SELECT id FROM users WHERE email = $1 OR username = $2", [email, username])

    if (checkResult.success && checkResult.data && checkResult.data.length > 0) {
      return { success: false, message: "用户名或邮箱已存在" }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Insert new user (default role is visitor - role_id 3)
    const insertResult = await executeQuery(
      `INSERT INTO users (username, email, password_hash, role_id, is_active)
       VALUES ($1, $2, $3, 3, true)
       RETURNING id`,
      [username, email, hashedPassword],
    )

    if (!insertResult.success || !insertResult.data || insertResult.data.length === 0) {
      return { success: false, message: "注册失败，请稍后再试" }
    }

    const userId = insertResult.data[0].id

    // Create user preferences
    await executeQuery(
      `INSERT INTO user_preferences (user_id, notification_enabled, theme, language)
       VALUES ($1, true, 'light', 'zh-CN')`,
      [userId],
    )

    return { success: true, message: "注册成功，请登录", userId }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, message: "注册失败，请稍后再试" }
  }
}

// Logout action
export async function logout() {
  cookies().delete("userId")
  cookies().delete("username")
  cookies().delete("role")
  redirect("/login")
}

// Get current user
export async function getCurrentUser() {
  const userId = cookies().get("userId")?.value
  const username = cookies().get("username")?.value
  const role = cookies().get("role")?.value

  if (!userId || !username || !role) {
    return null
  }

  return {
    id: Number.parseInt(userId),
    username,
    role,
  }
}
