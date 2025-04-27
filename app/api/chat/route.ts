import { NextResponse } from "next/server"

const COZE_API_KEY = "pat_L3YnWimWNwrthDvzKQDyg6awChXb1vMQQfJwyDFcw09x759V33UrCWdeaHdDBDF1"
const COZE_BOT_ID = "7495295094762045440"

export async function POST(request: Request) {
  try {
    const { messages, user } = await request.json()

    if (!messages || !messages.length) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 })
    }

    // 获取最后一条用户消息
    const lastUserMessage = [...messages].reverse().find((msg) => msg.role === "user")

    if (!lastUserMessage) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 })
    }

    // 使用用户名作为user_id，添加V0前缀
    const userId = `V0_${user || "anonymous"}`

    // 构建请求体
    const cozePayload = {
      bot_id: COZE_BOT_ID,
      user_id: userId,
      stream: true,
      additional_messages: [
        {
          role: "user",
          type: "question",
          content: lastUserMessage.content,
        },
      ],
    }

    console.log("Sending to Coze API:", JSON.stringify(cozePayload))

    // 创建一个可读流
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch("https://api.coze.cn/v3/chat", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${COZE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(cozePayload),
          })

          if (!response.ok) {
            const error = await response.text()
            controller.enqueue(encoder.encode(`event: error\ndata: ${error}\n\n`))
            controller.close()
            return
          }

          if (!response.body) {
            controller.enqueue(encoder.encode("event: error\ndata: No response body\n\n"))
            controller.close()
            return
          }

          // 处理流式响应
          const reader = response.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            // 将数据添加到缓冲区
            buffer += decoder.decode(value, { stream: true })

            // 按行分割并处理每一行
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""

            for (const line of lines) {
              if (line.trim() === "") continue

              // 记录原始行，帮助调试
              console.log("Raw line:", line)

              // 直接将行转发到客户端
              controller.enqueue(encoder.encode(`${line}\n`))
            }
          }

          // 处理剩余数据
          if (buffer) {
            controller.enqueue(encoder.encode(`${buffer}\n`))
          }

          controller.close()
        } catch (error) {
          console.error("Error in stream:", error)
          controller.enqueue(encoder.encode(`event: error\ndata: ${error}\n\n`))
          controller.close()
        }
      },
    })

    // 返回流式响应
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
