#  build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

COPY src ./src
RUN npx tsc

# lambda runtime stage
FROM amazon/aws-lambda-nodejs:18
WORKDIR /var/task

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

CMD ["dist/handler.handler"]
