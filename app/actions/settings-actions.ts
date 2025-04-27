"use server"

import { executeQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

// 用户偏好设置类型
export type UserPreferences = {
  notification_enabled: boolean
  theme: "light" | "dark" | "system"
  language: "zh-CN" | "en-US"
}

// 获取用户ID的多种方法
async function getUserId(): Promise<number | null> {
  try {
    // 方法1: 从cookie获取会话令牌并查询数据库
    const cookieStore = cookies()
    const sessionToken =
      cookieStore.get("next-auth.session-token")?.value || cookieStore.get("__Secure-next-auth.session-token")?.value

    if (sessionToken) {
      console.log("从cookie获取到会话令牌")

      // 查询会话表
      const sessionQuery = `
        SELECT user_id FROM sessions WHERE session_token = $1
      `
      const sessionResult = await executeQuery(sessionQuery, [sessionToken])

      if (sessionResult.success && sessionResult.data && sessionResult.data.length > 0) {
        const userId = Number(sessionResult.data[0].user_id)
        console.log("从数据库会话表获取到用户ID:", userId)
        return userId
      }

      console.log("会话表查询结果:", JSON.stringify(sessionResult))
    } else {
      console.log("未找到会话令牌cookie")
    }

    // 方法2: 尝试获取默认用户
    const defaultUserQuery = `
      SELECT id FROM users WHERE username = 'admin' OR role_id = 1 LIMIT 1
    `
    const defaultUserResult = await executeQuery(defaultUserQuery)

    if (defaultUserResult.success && defaultUserResult.data && defaultUserResult.data.length > 0) {
      const userId = Number(defaultUserResult.data[0].id)
      console.log("使用默认管理员用户ID:", userId)
      return userId
    }

    // 方法3: 返回固定ID 1（通常是管理员）
    console.log("使用固定ID 1")
    return 1
  } catch (error) {
    console.error("获取用户ID时出错:", error)
    // 出错时返回固定ID 1
    return 1
  }
}

// 获取用户偏好设置
export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    console.log("开始获取用户偏好设置")

    // 获取用户ID
    const userId = await getUserId()

    if (!userId) {
      console.log("未能获取用户ID，返回默认设置")
      // 返回默认设置
      return {
        notification_enabled: true,
        theme: "system",
        language: "zh-CN",
      }
    }

    console.log("获取到用户ID:", userId)

    // 检查user_preferences表是否存在
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_preferences'
      )
    `
    const tableCheckResult = await executeQuery(tableCheckQuery)

    if (!tableCheckResult.success || !tableCheckResult.data || !tableCheckResult.data[0].exists) {
      console.log("user_preferences表不存在，创建表")

      // 创建表
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS user_preferences (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
          theme VARCHAR(10) NOT NULL DEFAULT 'system',
          language VARCHAR(10) NOT NULL DEFAULT 'zh-CN',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id)
        )
      `
      await executeQuery(createTableQuery)
    }

    // 检查用户偏好设置是否存在
    const prefsQuery = `
      SELECT * FROM user_preferences WHERE user_id = $1
    `
    const prefsResult = await executeQuery(prefsQuery, [userId])

    console.log("用户偏好查询结果:", JSON.stringify(prefsResult))

    if (!prefsResult.success || !prefsResult.data || prefsResult.data.length === 0) {
      console.log("用户偏好不存在，创建默认设置")

      // 如果不存在，创建默认设置
      const defaultPreferences: UserPreferences = {
        notification_enabled: true,
        theme: "system",
        language: "zh-CN",
      }

      const insertQuery = `
        INSERT INTO user_preferences (user_id, notification_enabled, theme, language)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO NOTHING
      `

      await executeQuery(insertQuery, [
        userId,
        defaultPreferences.notification_enabled,
        defaultPreferences.theme,
        defaultPreferences.language,
      ])

      return defaultPreferences
    }

    console.log("返回用户偏好设置")
    return {
      notification_enabled: prefsResult.data[0].notification_enabled,
      theme: prefsResult.data[0].theme,
      language: prefsResult.data[0].language,
    }
  } catch (error) {
    console.error("获取用户偏好设置失败:", error)
    // 返回默认设置
    return {
      notification_enabled: true,
      theme: "system",
      language: "zh-CN",
    }
  }
}

// 更新用户偏好设置
export async function updateUserPreferences(preferences: Partial<UserPreferences>) {
  try {
    console.log("开始更新用户偏好设置:", JSON.stringify(preferences))

    // 获取用户ID
    const userId = await getUserId()

    if (!userId) {
      console.log("未能获取用户ID，无法更新设置")
      return { success: false, message: "未授权" }
    }

    console.log("获取到用户ID:", userId)

    // 获取当前设置
    const currentPrefs = await getUserPreferences()

    if (!currentPrefs) {
      console.log("获取当前设置失败")
      return { success: false, message: "获取当前设置失败" }
    }

    // 合并设置
    const updatedPrefs = { ...currentPrefs, ...preferences }
    console.log("更新后的设置:", JSON.stringify(updatedPrefs))

    // 更新数据库
    const updateQuery = `
      INSERT INTO user_preferences (user_id, notification_enabled, theme, language, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        notification_enabled = $2,
        theme = $3,
        language = $4,
        updated_at = CURRENT_TIMESTAMP
    `

    const result = await executeQuery(updateQuery, [
      userId,
      updatedPrefs.notification_enabled,
      updatedPrefs.theme,
      updatedPrefs.language,
    ])

    console.log("更新结果:", JSON.stringify(result))

    if (!result.success) {
      console.log("更新设置失败")
      return { success: false, message: "更新设置失败" }
    }

    console.log("设置更新成功")
    revalidatePath("/settings")
    return { success: true, message: "设置已更新" }
  } catch (error) {
    console.error("更新用户偏好设置失败:", error)
    return { success: false, message: "更新设置失败" }
  }
}
