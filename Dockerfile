# 第一阶段：依赖安装和构建
FROM node:18-alpine AS builder
 
# 设置工作目录
WORKDIR /app
 
# 复制 package.json 和 其他配置文件
COPY package.json ./
COPY tsconfig.json ./
COPY next.config.mjs ./
COPY postcss.config.mjs ./
COPY tailwind.config.ts ./
COPY uno.config.ts ./
 
# 安装依赖
RUN yarn install
 
# 复制源代码
COPY src ./src
COPY styles ./styles
 
# 创建空的 public 目录（如果不需要可以删除这部分）
RUN mkdir -p public
 
# 创建生产环境配置文件（如果需要的话）
RUN echo "NODE_ENV=production" > .env.production
 
# 构建应用
RUN yarn build
 
# 第二阶段：生产环境
FROM node:18-alpine AS runner
 
WORKDIR /app
 
# 设置生产环境变量（修复格式警告）
ENV NODE_ENV=production
 
# 从构建阶段复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
 
# 暴露端口
EXPOSE 3000
 
# 启动命令
CMD ["node", "server.js"]