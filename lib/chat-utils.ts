import { executeQuery } from "@/lib/db"

export type ChatMessage = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

// 保存聊天消息到数据库
export async function saveChatMessage(userId: number, message: Omit<ChatMessage, "id">) {
  try {
    const query = `
      INSERT INTO chat_messages (user_id, content, role, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `

    const result = await executeQuery(query, [userId, message.content, message.role, message.timestamp])

    if (result.success && result.data && result.data.length > 0) {
      return { success: true, id: result.data[0].id }
    }

    return { success: false, error: "Failed to save message" }
  } catch (error) {
    console.error("Error saving chat message:", error)
    return { success: false, error: "Database error" }
  }
}

// 获取用户的聊天历史
export async function getUserChatHistory(userId: number, limit = 20) {
  try {
    const query = `
      SELECT id, content, role, created_at as timestamp
      FROM chat_messages
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `

    const result = await executeQuery(query, [userId, limit])

    if (result.success) {
      return {
        success: true,
        messages: result.data
          ? result.data
              .map((msg) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              }))
              .reverse()
          : [],
      }
    }

    return { success: false, error: "Failed to fetch chat history" }
  } catch (error) {
    console.error("Error fetching chat history:", error)
    return { success: false, error: "Database error" }
  }
}
