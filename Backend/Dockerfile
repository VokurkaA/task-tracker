# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to leverage cache
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and config
COPY tsconfig.json ./
COPY src ./src

# Build the TypeScript code
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy compiled JavaScript from the builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["npm", "start"]