import { executeQuery } from "@/lib/db"

export type ChatMessage = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

// 保存聊天消息到数据库
export async function saveChatMessageToDb(userId: number, message: Omit<ChatMessage, "id">) {
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
export async function getUserChatHistoryFromDb(userId: number, limit = 20) {
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

// 清除用户的聊天历史
export async function clearUserChatHistory(userId: number) {
  try {
    const query = `
      DELETE FROM chat_messages
      WHERE user_id = $1
    `

    const result = await executeQuery(query, [userId])

    if (result.success) {
      return { success: true }
    }

    return { success: false, error: "Failed to clear chat history" }
  } catch (error) {
    console.error("Error clearing chat history:", error)
    return { success: false, error: "Database error" }
  }
}

// 格式化消息以发送给API
export function formatMessagesForApi(messages: ChatMessage[]) {
  return messages.map((msg) => ({
    role: msg.role,
    type: msg.role === "user" ? "question" : "answer",
    content: msg.content,
  }))
}

// 限制消息数量，避免超出token限制
export function limitMessageHistory(messages: ChatMessage[], limit = 10) {
  if (messages.length <= limit) return messages

  // 保留第一条消息（通常是系统欢迎消息）和最近的N-1条消息
  return [messages[0], ...messages.slice(-(limit - 1))]
}
