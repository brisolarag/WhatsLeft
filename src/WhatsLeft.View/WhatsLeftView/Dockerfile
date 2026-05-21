# Stage 1: Build the Angular application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve the application using Node.js (SSR)
FROM node:20-alpine
WORKDIR /app
# Copy the built assets from the build stage
COPY --from=build /app/dist/WhatsLeftView ./dist/WhatsLeftView
# Expose port 4000 (Angular SSR default)
EXPOSE 4000
# Run the SSR server
CMD ["node", "dist/WhatsLeftView/server/server.mjs"]
