import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function SettingsLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <Separator className="my-6" />

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">通知</TabsTrigger>
          <TabsTrigger value="appearance">外观</TabsTrigger>
          <TabsTrigger value="language">语言</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>

              <Skeleton className="h-10 w-24" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
