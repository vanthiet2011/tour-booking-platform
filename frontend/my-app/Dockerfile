# Stage 1: Base - Nền tảng chung cho các stage khác
# Sử dụng 'slim' thay vì 'alpine' để tăng độ tương thích với các native module
FROM node:20-slim AS base
WORKDIR /app

# Stage 2: Builder - Stage này build ứng dụng cho production
FROM base AS builder
# Copy file quản lý package và cài đặt tất cả dependencies (bao gồm devDependencies để build)
COPY package*.json ./
RUN npm install
# Copy toàn bộ source code
COPY . .
# Chạy lệnh build
RUN npm run build

# Stage 3: Runner - Stage này tạo ra image cuối cùng cho production
# Image này siêu nhẹ vì chỉ chứa những file cần thiết để chạy
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# Copy các file cần thiết từ stage 'builder'
# Yêu cầu phải có `output: 'standalone'` trong file next.config.js của bạn
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]

# Stage 4: Development - Stage riêng biệt cho môi trường phát triển local
FROM base AS dev
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]