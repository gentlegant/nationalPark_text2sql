import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">帮助中心</h1>

      <Card>
        <CardHeader>
          <CardTitle>系统使用指南</CardTitle>
          <CardDescription>了解如何使用国家森林公园管理系统</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>如何管理景点信息？</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">管理员和工作人员可以通过以下步骤管理景点信息：</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>在左侧导航栏中点击"景点管理"</li>
                  <li>点击"添加景点"按钮创建新景点</li>
                  <li>填写景点信息并提交表单</li>
                  <li>在景点列表中，可以点击"编辑"或"删除"按钮修改或删除现有景点</li>
                </ol>
                <p className="mt-2">普通访客只能查看景点信息，无法进行编辑或删除操作。</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>如何管理动植物信息？</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">管理员和工作人员可以通过以下步骤管理动植物信息：</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>在左侧导航栏中点击"动植物管理"</li>
                  <li>选择"动物"或"植物"标签页</li>
                  <li>点击"添加记录"按钮创建新记录</li>
                  <li>填写动植物信息并提交表单</li>
                  <li>在列表中，可以点击"编辑"或"删除"按钮修改或删除现有记录</li>
                </ol>
                <p className="mt-2">普通访客只能查看动植物信息，无法进行编辑或删除操作。</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>如何发布活动公告？</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">管理员和工作人员可以通过以下步骤发布活动公告：</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>在左侧导航栏中点击"活动公告"</li>
                  <li>点击"添加公告"按钮创建新公告</li>
                  <li>选择公告类型（活动或公告）</li>
                  <li>填写公告信息并提交表单</li>
                  <li>可以选择立即发布或稍后发布</li>
                </ol>
                <p className="mt-2">普通访客只能查看已发布的公告，无法进行编辑或删除操作。</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>如何使用智能对话功能？</AccordionTrigger>
              <AccordionContent>
                <p className="mb-2">所有用户都可以使用智能对话功能：</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>在左侧导航栏中点击"智能对话"</li>
                  <li>在输入框中输入您的问题</li>
                  <li>点击发送按钮或按回车键提交问题</li>
                  <li>系统将自动回答您的问题</li>
                </ol>
                <p className="mt-2">
                  智能对话系统可以回答关于森林公园的各种问题，包括景点信息、动植物知识、活动安排等。
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>常见问题</CardTitle>
          <CardDescription>解答用户常见疑问</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger>忘记密码怎么办？</AccordionTrigger>
              <AccordionContent>
                <p>
                  如果您忘记了密码，请联系系统管理员重置密码。管理员将为您生成一个临时密码，您可以使用临时密码登录后修改为您自己的密码。
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2">
              <AccordionTrigger>如何修改个人信息？</AccordionTrigger>
              <AccordionContent>
                <p>您可以通过以下步骤修改个人信息：</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>点击右上角的用户图标</li>
                  <li>在下拉菜单中选择"个人资料"</li>
                  <li>修改您的个人信息</li>
                  <li>点击"保存"按钮提交更改</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3">
              <AccordionTrigger>系统支持哪些浏览器？</AccordionTrigger>
              <AccordionContent>
                <p>本系统支持以下现代浏览器的最新版本：</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Google Chrome</li>
                  <li>Mozilla Firefox</li>
                  <li>Microsoft Edge</li>
                  <li>Apple Safari</li>
                </ul>
                <p className="mt-2">为了获得最佳体验，我们建议使用Google Chrome浏览器。</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>联系我们</CardTitle>
          <CardDescription>需要更多帮助？请联系我们</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>技术支持：</strong> support@forestpark.com
            </p>
            <p>
              <strong>电话：</strong> 400-123-4567
            </p>
            <p>
              <strong>工作时间：</strong> 周一至周五 9:00-17:00
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
