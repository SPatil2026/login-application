# Stage 1: Build frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json and install dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build   # produces /dist

# Stage 2: Serve production static files
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve   # lightweight static server
COPY --from=builder /app/dist ./dist

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]