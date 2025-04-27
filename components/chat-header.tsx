import { Bot } from "lucide-react"

interface ChatHeaderProps {
  title?: string
  description?: string
}

export function ChatHeader({
  title = "森林公园智能助手",
  description = "我可以回答关于森林公园的任何问题",
}: ChatHeaderProps) {
  return (
    <div className="flex items-start gap-4 p-4 border-b">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        <Bot className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
