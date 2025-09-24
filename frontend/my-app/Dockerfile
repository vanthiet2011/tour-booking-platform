# Stage 1: Base
FROM node:22-alpine AS base
WORKDIR /app

# Copy package.json và package-lock.json trước
COPY package*.json ./

# Cài dependencies (cache sẽ giữ lại trừ khi package.json thay đổi)
RUN npm install

# Copy source code (đã bỏ qua node_modules/.next nhờ .dockerignore)
COPY . .

# Stage 2: Dev image (hot reload)
FROM base AS dev
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 3: Production image
FROM base AS build
RUN npm run build

FROM node:22-alpine AS prod
WORKDIR /app
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "start"]
