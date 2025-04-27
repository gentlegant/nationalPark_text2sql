"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HelpCircle, X } from "lucide-react"
import { PresetQuestions } from "@/components/preset-questions"

interface ChatActionsProps {
  onSelectQuestion: (question: string) => void
}

export function ChatActions({ onSelectQuestion }: ChatActionsProps) {
  const [showQuestions, setShowQuestions] = useState(false)

  return (
    <div className="relative">
      <div className="absolute bottom-16 right-0 z-10">
        {showQuestions && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border p-3 w-72">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">常见问题</h3>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowQuestions(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <PresetQuestions
              onSelectQuestion={(q) => {
                onSelectQuestion(q)
                setShowQuestions(false)
              }}
            />
          </div>
        )}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={() => setShowQuestions(!showQuestions)}
        title="常见问题"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
    </div>
  )
}
