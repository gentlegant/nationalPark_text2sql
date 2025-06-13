"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  createAnnouncement,
  updateAnnouncement,
  type Announcement,
  type AnnouncementFormData,
} from "@/app/actions/announcement-actions";

interface AnnouncementFormProps {
  announcement?: Announcement;
  userId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AnnouncementForm({
  announcement,
  userId,
  onSuccess,
  onCancel,
}: AnnouncementFormProps) {
  const isEditing = !!announcement;
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: "",
    content: "",
    type: "announcement",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    location: "",
    image_url: "",
    is_published: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        start_date: new Date(announcement.start_date)
          .toISOString()
          .split("T")[0],
        end_date: announcement.end_date
          ? new Date(announcement.end_date).toISOString().split("T")[0]
          : "",
        location: announcement.location,
        image_url: announcement.image_url,
        is_published: announcement.is_published,
      });
    } else {
      // 重置为新增模式的默认值
      setFormData({
        title: "",
        content: "",
        type: "announcement",
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
        location: "",
        image_url: "",
        is_published: true,
      });
    }
  }, [announcement]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { name: string; value: string | boolean }
  ) => {
    const { name, value } = "target" in e ? e.target : e;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;

      if (isEditing && announcement) {
        result = await updateAnnouncement(announcement.id, formData, userId);
      } else {
        result = await createAnnouncement(formData, userId);
      }

      if (result.success) {
        toast({
          title: isEditing ? "公告已更新" : "公告已创建",
          description: isEditing ? "公告信息已成功更新" : "新公告已成功创建",
        });

        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/announcements");
        }
      } else {
        toast({
          title: "操作失败",
          description: result.error || "发生错误，请稍后再试",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "操作失败",
        description: "发生错误，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">标题 *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">内容 *</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={6}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>类型 *</Label>
        <RadioGroup
          value={formData.type}
          onValueChange={(value) => handleChange({ name: "type", value })}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="announcement" id="announcement" />
            <Label htmlFor="announcement" className="cursor-pointer">
              公告
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="activity" id="activity" />
            <Label htmlFor="activity" className="cursor-pointer">
              活动
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">开始日期 *</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">结束日期</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">地点</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">图片URL</Label>
        <Input
          id="image_url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_published"
          checked={formData.is_published}
          onCheckedChange={(checked) =>
            handleChange({ name: "is_published", value: checked })
          }
        />
        <Label htmlFor="is_published">立即发布</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          取消
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? isEditing
              ? "更新中..."
              : "创建中..."
            : isEditing
            ? "更新公告"
            : "创建公告"}
        </Button>
      </div>
    </form>
  );
}
