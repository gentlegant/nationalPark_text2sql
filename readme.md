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
- **AI集成**：Coze API 流式对话和Wrenai


## 环境
### 云端
https://v0-user-dialog-agent.vercel.app/chat
### Neon
https://console.neon.tech/app/projects/solitary-snow-57570766
### COZE  
https://www.coze.cn/space/7366561614713126953/project-ide/7495219630069006374
调用：https://www.coze.cn/open/playground/chat_v3
### wrenai
https://cloud.getwren.ai/projects/5965/home/6737
### github 
https://github.com/gentlegant/nationalPark_text2sql



## 安装和启动

### 前提条件

- Node.js 20+ 
- npm 或 yarn
- PostgreSQL 数据库

### 环境变量

创建一个`.env.local`文件，添加以下环境变量：

```
# Recommended for most uses
DATABASE_URL=postgres://neondb_owner:npg_5d9QXgoDfjBM@ep-yellow-night-a4do52f9-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# For uses requiring a connection without pgbouncer
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:npg_5d9QXgoDfjBM@ep-yellow-night-a4do52f9.us-east-1.aws.neon.tech/neondb?sslmode=require

# Parameters for constructing your own connection string
PGHOST=ep-yellow-night-a4do52f9-pooler.us-east-1.aws.neon.tech
PGHOST_UNPOOLED=ep-yellow-night-a4do52f9.us-east-1.aws.neon.tech
PGUSER=neondb_owner
PGDATABASE=neondb
PGPASSWORD=npg_5d9QXgoDfjBM

# Parameters for Vercel Postgres Templates
POSTGRES_URL=postgres://neondb_owner:npg_5d9QXgoDfjBM@ep-yellow-night-a4do52f9-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL_NON_POOLING=postgres://neondb_owner:npg_5d9QXgoDfjBM@ep-yellow-night-a4do52f9.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_USER=neondb_owner
POSTGRES_HOST=ep-yellow-night-a4do52f9-pooler.us-east-1.aws.neon.tech
POSTGRES_PASSWORD=npg_5d9QXgoDfjBM
POSTGRES_DATABASE=neondb
POSTGRES_URL_NO_SSL=postgres://neondb_owner:npg_5d9QXgoDfjBM@ep-yellow-night-a4do52f9-pooler.us-east-1.aws.neon.tech/neondb
POSTGRES_PRISMA_URL=postgres://neondb_owner:npg_5d9QXgoDfjBM@ep-yellow-night-a4do52f9-pooler.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
```

### 本地启动

```bash
###首先安装NPM

npm install yarn -g

yarn install

yarn build 

yarn start
```

