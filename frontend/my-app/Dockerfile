# Stage 1: Base - Nền tảng chung cho các stage khác
FROM node:20-slim AS base
WORKDIR /app

FROM base AS builder
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 3: Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

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