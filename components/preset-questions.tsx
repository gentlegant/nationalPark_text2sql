"use client"

import { Button } from "@/components/ui/button"

interface PresetQuestionsProps {
  onSelectQuestion: (question: string) => void
}

export function PresetQuestions({ onSelectQuestion }: PresetQuestionsProps) {
  const questions = [
    "国家森林公园设计规范施行日期是啥时候？",
    "森林公园的供热工程的原则是什么？",
    "森林公园内可以进行哪些活动？",
    "森林公园的主要保护对象有哪些？",
    "如何申请森林公园的导游服务？",
  ]

  return (
    <div className="space-y-2 p-4 border-b">
      <h3 className="text-sm font-medium mb-2">您可能想问：</h3>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-left h-auto py-2 px-3 text-sm whitespace-normal break-words"
            onClick={() => onSelectQuestion(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  )
}
