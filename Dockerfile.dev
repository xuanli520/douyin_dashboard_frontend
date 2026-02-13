# ========== 第一阶段：安装依赖 ==========
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only==production

# ========== 第二阶段：构建应用 ==========
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# 构建阶段校验 standalone 入口是否存在（提前失败，避免运行时才炸）
RUN test -f .next/standalone/server.js

# ========== 第三阶段：运行应用 ==========
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 安全：非 root 用户
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# 只复制运行必需的文件
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE ${PORT:-3000}

# 健康检查：专用 healthz，不受首页、鉴权、302 影响
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || '3000') + '/api/healthz', (r) => process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# 启动命令（standalone 模式使用 server.js，支持 PORT 环境变量）
CMD ["node", "server.js"]
