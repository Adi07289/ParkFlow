# Use Node.js Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./

# Copy source code
COPY . .

# Install all dependencies (including dev dependencies)
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Build the TypeScript code
RUN npm run build

# Copy docs folder to dist
RUN mkdir -p /app/dist/docs && cp -r /app/src/docs/* /app/dist/docs/ 2>/dev/null || true

# Keep development dependencies for dev mode
# RUN npm prune --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

# Start the application
CMD ["npm", "start"]