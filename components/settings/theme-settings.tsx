"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { toast } from "@/components/ui/use-toast";
import { Moon, Sun } from "lucide-react";

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    toast({
      title: "主题已更新",
      description: `已切换到${newTheme === "light" ? "浅色" : "深色"}模式`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>外观设置</CardTitle>
        <CardDescription>自定义应用程序的外观主题</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={theme}
          onValueChange={(value) =>
            handleThemeChange(value as "light" | "dark")
          }
          className="space-y-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="light" id="light" />
            <Label
              htmlFor="light"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Sun className="h-4 w-4" />
              浅色模式
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dark" id="dark" />
            <Label
              htmlFor="dark"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Moon className="h-4 w-4" />
              深色模式
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
