"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  SendIcon,
  User,
  Bot,
  Loader2,
  Trash2,
  BarChart2,
  ExternalLink,
} from "lucide-react";
import { getCurrentUser } from "@/app/actions/auth-actions";
import { ChatHeader } from "@/components/chat-header";
import { PresetQuestions } from "@/components/preset-questions";
import { ChatActions } from "@/components/chat-actions";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

// 用于存储会话的本地存储键
const CHAT_HISTORY_KEY = "forest-park-chat-history";
// Chat2Data URL
const CHAT2DATA_URL = "https://cloud.getwren.ai/projects/5965/home/6737";
// Coze API 配置
const COZE_API_KEY =
  "pat_jDJ8HyaJfdSaH7PDpy47WQVwhfmH1oI6WEPxnb3FKr1jD9geKRIJCXWB1YfvzBul";
const COZE_BOT_ID = "7495295094762045440";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{
    id: number;
    username: string;
    role: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // 获取当前用户信息和加载聊天历史
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      // 加载聊天历史
      loadChatHistory(currentUser?.username);
    };

    fetchCurrentUser();
  }, []);

  // 保存聊天历史到本地存储
  const saveChatHistory = (newMessages: Message[], username?: string) => {
    if (!username) return;

    try {
      const key = `${CHAT_HISTORY_KEY}-${username}`;
      localStorage.setItem(key, JSON.stringify(newMessages));
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  // 从本地存储加载聊天历史
  const loadChatHistory = (username?: string) => {
    if (!username) {
      // 如果没有用户名，显示默认欢迎消息
      setMessages([
        {
          id: "1",
          content: "您好！我是国家森林公园智能助手，有什么可以帮助您的吗？",
          role: "assistant" as const,
          timestamp: new Date(),
        },
      ]);
      return;
    }

    try {
      const key = `${CHAT_HISTORY_KEY}-${username}`;
      const savedHistory = localStorage.getItem(key);

      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory) as Message[];
        // 确保时间戳是Date对象
        const formattedHistory = parsedHistory.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedHistory);
      } else {
        // 如果没有历史记录，显示默认欢迎消息
        setMessages([
          {
            id: "1",
            content: "您好！我是国家森林公园智能助手，有什么可以帮助您的吗？",
            role: "assistant" as const,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      // 出错时显示默认欢迎消息
      setMessages([
        {
          id: "1",
          content: "您好！我是国家森林公园智能助手，有什么可以帮助您的吗？",
          role: "assistant" as const,
          timestamp: new Date(),
        },
      ]);
    }
  };

  // 清除聊天历史
  const clearChatHistory = () => {
    if (!user?.username) return;

    try {
      const key = `${CHAT_HISTORY_KEY}-${user.username}`;
      localStorage.removeItem(key);

      // 重置为默认欢迎消息
      const defaultMessage: Message = {
        id: Date.now().toString(),
        content: "您好！我是国家森林公园智能助手，有什么可以帮助您的吗？",
        role: "assistant" as const,
        timestamp: new Date(),
      };

      setMessages([defaultMessage]);
      saveChatHistory([defaultMessage], user.username);

      toast({
        title: "对话已清空",
        description: "您的聊天历史已被清除",
      });
    } catch (error) {
      console.error("Error clearing chat history:", error);
      toast({
        title: "操作失败",
        description: "清除聊天历史时出错",
        variant: "destructive",
      });
    }
  };

  // 自动滚动到最新消息
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // 当消息更新时保存到本地存储
    if (user?.username && messages.length > 0) {
      saveChatHistory(messages, user.username);
    }
  }, [messages, user?.username]);

  const handleSendMessage = async (messageText = input) => {
    if (!messageText.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      role: "user",
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // 创建一个新的消息对象来存储AI的响应
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "",
        role: "assistant",
        timestamp: new Date(),
      };

      // 先添加空消息，然后在接收到内容时更新它
      setMessages([...updatedMessages, assistantMessage]);

      // 使用用户名作为user_id，添加V0前缀
      const userId = `V0_${user?.username || "anonymous"}`;

      // 构建请求体
      const cozePayload = {
        bot_id: COZE_BOT_ID,
        user_id: userId,
        stream: true,
        additional_messages: [
          {
            role: "user",
            type: "question",
            content: messageText,
          },
        ],
      };

      console.log("Sending to Coze API:", JSON.stringify(cozePayload));

      // 直接请求 Coze API
      const response = await fetch("https://api.coze.cn/v3/chat", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${COZE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cozePayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Coze API error:", errorText);
        throw new Error(`API请求失败: ${response.status}`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("无法读取响应");
      }

      const decoder = new TextDecoder("utf-8");
      let content = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 解码收到的数据
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // 按行处理数据
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          console.log("Raw line:", line);

          // 解析事件数据
          if (line.startsWith("event:")) {
            // 记录事件类型，但不处理
            console.log("Event:", line);
            continue;
          } else if (line.startsWith("data:")) {
            try {
              const dataStr = line.substring(5).trim();

              // 处理特殊的[DONE]消息
              if (dataStr === '"[DONE]"') {
                console.log("Stream completed");
                continue;
              }

              const jsonData = JSON.parse(dataStr);

              // 处理conversation.message.delta事件的数据
              if (
                jsonData.role === "assistant" &&
                jsonData.type === "answer" &&
                jsonData.content
              ) {
                // 累加内容
                content += jsonData.content;

                // 更新消息内容
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id ? { ...msg, content } : msg
                  )
                );
              }
            } catch (error) {
              console.error("解析事件数据失败:", error, line);
            }
          }
        }
      }

      // 如果没有获取到任何内容，添加一个错误消息
      if (!content) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: "抱歉，我无法处理您的请求，请稍后再试。" }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Chat API错误:", error);

      // 添加错误消息
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          content:
            "抱歉，发生了一个错误，请稍后再试。如果是CORS错误，请检查浏览器控制台。",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理预设问题的选择
  const handleSelectQuestion = (question: string) => {
    setInput(question);
    handleSendMessage(question);
  };

  // 打开Chat2Data在新窗口
  const openChat2Data = () => {
    window.open(CHAT2DATA_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] border rounded-lg overflow-hidden bg-white dark:bg-gray-950">
      <div className="flex justify-between items-center">
        <ChatHeader />
        <div className="px-4 flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openChat2Data}
            className="flex items-center gap-1"
          >
            <BarChart2 className="h-4 w-4" />
            <span>打开Chat2Data</span>
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearChatHistory}
            className="text-gray-500 hover:text-red-500"
            title="清空对话"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            清空对话
          </Button>
        </div>
      </div>

      {/* 预设问题区域 - 只在对话开始时显示 */}
      {messages.length <= 2 && !isLoading && (
        <div className="w-full min-h-[120px]">
          <PresetQuestions onSelectQuestion={handleSelectQuestion} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <Card
              className={`max-w-[80%] ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  {message.role === "assistant" && (
                    <Bot className="h-5 w-5 mt-1" />
                  )}
                  <div>
                    <p className="whitespace-pre-line">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.role === "user" && <User className="h-5 w-5 mt-1" />}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p>正在思考...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2 items-center">
          <ChatActions onSelectQuestion={handleSelectQuestion} />
          <Input
            placeholder="输入您的问题..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
          >
            <SendIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
