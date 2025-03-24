# Etapa 1: Construcción
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Etapa 2: Imagen final
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production --legacy-peer-deps
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"] 