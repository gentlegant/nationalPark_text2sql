# 森林公园管理系统

一个现代化的森林公园管理平台，集成了用户管理、景点管理、动植物管理、活动公告和智能对话等功能。

## 功能概述

- **用户管理**：用户注册、登录、角色管理（管理员、工作人员、访客）
- **景点管理**：添加、编辑、删除景点信息，包括图片、描述、位置等
- **动植物管理**：记录和管理园区内的动植物信息
- **活动公告**：发布和管理园区活动和公告信息
- **智能对话**：基于大模型的智能问答系统，支持RAG模式和Chat2Data模式
- **系统日志**：记录系统操作日志，便于审计和问题排查
- **个人设置**：用户个性化设置，包括通知、主题和语言偏好

## 技术栈

- **前端**：Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **后端**：Next.js API Routes, Server Actions
- **数据库**：PostgreSQL (Neon)
- **认证**：基于Cookie的自定义认证系统
- **AI集成**：Coze API 流式对话

## 环境
### 云端：https://v0-user-dialog-agent.vercel.app/chat
### Neon： https://console.neon.tech/app/projects/solitary-snow-57570766
### COZE:  https://www.coze.cn/space/7366561614713126953/project-ide/7495219630069006374
### wrenai: https://cloud.getwren.ai/projects/5965/home/6737


## 安装和启动

### 前提条件

- Node.js 18+ 
- npm 或 yarn
- PostgreSQL 数据库

### 环境变量

创建一个`.env.local`文件，添加以下环境变量：

```
# 数据库连接
DATABASE_URL=postgres://username:password@host:port/database
POSTGRES_URL=postgres://username:password@host:port/database

# 认证
NEXTAUTH_SECRET=your-secret-key

# Coze API (智能对话)
COZE_API_KEY=your-coze-api-key
COZE_BOT_ID=your-coze-bot-id
```

### 本地启动

```bash


npm install yarn -g

yarn install

yarn build 

yarn start
```

