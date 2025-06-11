"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Edit, Trash2, Loader2, AlertCircle } from "lucide-react";
import { getCurrentUser } from "@/app/actions/auth-actions";
import {
  getWildlifeByCategory,
  deleteWildlife,
  updateWildlife,
  getWildlifeCategories,
  type Wildlife,
  type WildlifeCategory,
  type WildlifeFormData,
} from "@/app/actions/wildlife-actions";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";

export default function WildlifePage() {
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    username: string;
    role: string;
  } | null>(null);
  const [animals, setAnimals] = useState<Wildlife[]>([]);
  const [plants, setPlants] = useState<Wildlife[]>([]);
  const [categories, setCategories] = useState<WildlifeCategory[]>([]);
  const [isLoadingAnimals, setIsLoadingAnimals] = useState(true);
  const [isLoadingPlants, setIsLoadingPlants] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingWildlife, setEditingWildlife] = useState<Wildlife | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState({ url: "", name: "" });
  const { toast } = useToast();

  // 表单数据状态
  const [formData, setFormData] = useState<WildlifeFormData>({
    name: "",
    scientific_name: "",
    category_id: 0,
    description: "",
    habitat: "",
    conservation_status: "",
    image_url: "",
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };

    fetchCurrentUser();
  }, []);

  // 获取分类数据
  const fetchCategories = async () => {
    try {
      const result = await getWildlifeCategories();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 获取动物数据
  const fetchAnimals = async () => {
    setIsLoadingAnimals(true);
    setError(null);
    try {
      const result = await getWildlifeByCategory("animal");
      if (result.success) {
        setAnimals(result.data);
      } else {
        setError(result.error || "获取动物数据失败");
      }
    } catch (error) {
      console.error("Error fetching animals:", error);
      setError("获取动物数据失败");
    } finally {
      setIsLoadingAnimals(false);
    }
  };

  // 获取植物数据
  const fetchPlants = async () => {
    setIsLoadingPlants(true);
    setError(null);
    try {
      const result = await getWildlifeByCategory("plant");
      if (result.success) {
        setPlants(result.data);
      } else {
        setError(result.error || "获取植物数据失败");
      }
    } catch (error) {
      console.error("Error fetching plants:", error);
      setError("获取植物数据失败");
    } finally {
      setIsLoadingPlants(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
    fetchPlants();
  }, []);

  // 检查用户是否有编辑权限
  const canEdit =
    currentUser &&
    (currentUser.role === "admin" || currentUser.role === "staff");

  // 处理添加记录
  const handleAdd = () => {
    toast({
      title: "功能开发中",
      description: "添加新记录功能正在开发中，敬请期待！",
    });
  };

  // 处理编辑
  const handleEdit = (wildlife: Wildlife) => {
    setEditingWildlife(wildlife);
    setFormData({
      name: wildlife.name,
      scientific_name: wildlife.scientific_name,
      category_id: wildlife.category_id,
      description: wildlife.description,
      habitat: wildlife.habitat,
      conservation_status: wildlife.conservation_status,
      image_url: wildlife.image_url,
    });
    setEditDialogOpen(true);
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !editingWildlife) {
      toast({
        title: "操作失败",
        description: "请先登录",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateWildlife(
        editingWildlife.id,
        formData,
        currentUser.id
      );

      if (result.success) {
        toast({
          title: "更新成功",
          description: `已更新${
            editingWildlife.category_type === "animal" ? "动物" : "植物"
          }：${formData.name}`,
        });

        setEditDialogOpen(false);
        setEditingWildlife(null);

        // 重新获取数据
        if (editingWildlife.category_type === "animal") {
          fetchAnimals();
        } else {
          fetchPlants();
        }
      } else {
        toast({
          title: "更新失败",
          description: result.error || "更新失败，请稍后再试",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "更新失败",
        description: "发生错误，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理删除
  const handleDelete = async (wildlife: Wildlife) => {
    if (!currentUser) {
      toast({
        title: "操作失败",
        description: "请先登录",
        variant: "destructive",
      });
      return;
    }

    if (
      confirm(
        `确定要删除${wildlife.category_type === "animal" ? "动物" : "植物"}"${
          wildlife.name
        }"吗？此操作无法撤销。`
      )
    ) {
      try {
        const result = await deleteWildlife(wildlife.id, currentUser.id);

        if (result.success) {
          toast({
            title: "删除成功",
            description: `已删除${
              wildlife.category_type === "animal" ? "动物" : "植物"
            }：${wildlife.name}`,
          });

          // 重新获取数据
          if (wildlife.category_type === "animal") {
            fetchAnimals();
          } else {
            fetchPlants();
          }
        } else {
          toast({
            title: "删除失败",
            description: result.error || "删除失败，请稍后再试",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast({
          title: "删除失败",
          description: "发生错误，请稍后再试",
          variant: "destructive",
        });
      }
    }
  };

  // 处理图片点击
  const handleImageClick = (imageUrl: string, name: string) => {
    setPreviewImage({ url: imageUrl, name });
    setImagePreviewOpen(true);
  };

  // 渲染Wildlife卡片
  const renderWildlifeCard = (wildlife: Wildlife) => (
    <Card key={wildlife.id}>
      <div
        className="relative h-56 overflow-hidden cursor-pointer rounded-t-lg"
        onClick={() =>
          handleImageClick(
            wildlife.image_url || "/placeholder.svg",
            wildlife.name
          )
        }
      >
        <img
          src={wildlife.image_url || "/placeholder.svg"}
          alt={wildlife.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="text-white bg-black/50 px-2 py-1 rounded text-sm opacity-0 hover:opacity-100 transition-opacity duration-300">
            点击查看大图
          </div>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle>{wildlife.name}</CardTitle>
        <CardDescription>
          <em>{wildlife.scientific_name}</em> | {wildlife.conservation_status}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {wildlife.description}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <strong>
            {wildlife.category_type === "animal" ? "栖息地" : "生长环境"}:
          </strong>{" "}
          {wildlife.habitat}
        </p>
        {canEdit && (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(wildlife)}
            >
              <Edit className="mr-1 h-3 w-3" />
              编辑
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(wildlife)}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              删除
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // 渲染加载状态
  const renderLoading = () => (
    <div className="flex justify-center items-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">正在加载...</span>
    </div>
  );

  // 渲染空状态
  const renderEmpty = (type: string) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-gray-500 mb-4">暂无{type}数据</p>
      {canEdit && (
        <Button onClick={handleAdd} variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          添加{type}
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">动植物管理</h1>
        {canEdit && (
          <Button onClick={handleAdd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            添加记录
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="animals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="animals">动物</TabsTrigger>
          <TabsTrigger value="plants">植物</TabsTrigger>
        </TabsList>

        <TabsContent value="animals" className="space-y-4">
          {isLoadingAnimals ? (
            renderLoading()
          ) : animals.length === 0 ? (
            renderEmpty("动物")
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {animals.map(renderWildlifeCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="plants" className="space-y-4">
          {isLoadingPlants ? (
            renderLoading()
          ) : plants.length === 0 ? (
            renderEmpty("植物")
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plants.map(renderWildlifeCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              编辑
              {editingWildlife?.category_type === "animal" ? "动物" : "植物"}
              信息
            </DialogTitle>
            <DialogDescription>
              修改{editingWildlife?.name}的信息，点击保存来更新记录。
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scientific_name">学名 *</Label>
                <Input
                  id="scientific_name"
                  value={formData.scientific_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scientific_name: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">分类 *</Label>
              <Select
                value={formData.category_id.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="habitat">栖息地/生长环境</Label>
                <Input
                  id="habitat"
                  value={formData.habitat}
                  onChange={(e) =>
                    setFormData({ ...formData, habitat: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conservation_status">保护状态</Label>
                <Input
                  id="conservation_status"
                  value={formData.conservation_status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      conservation_status: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">图片URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  "保存"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 图片预览对话框 */}
      <ImagePreviewDialog
        open={imagePreviewOpen}
        onOpenChange={setImagePreviewOpen}
        imageUrl={previewImage.url}
        imageName={previewImage.name}
      />
    </div>
  );
}
