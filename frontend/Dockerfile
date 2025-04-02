FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Modify the font import to use local fonts instead of Google Fonts
RUN sed -i 's|import { Inter } from "next/font/google"|import localFont from "next/font/local"|' src/app/layout.tsx && \
    sed -i 's|const inter = Inter({ subsets: \["latin"\] })|const inter = localFont({ src: "./fonts/inter.woff2", variable: "--font-inter" })|' src/app/layout.tsx && \
    mkdir -p src/app/fonts

# Add a sample local font file to replace Google Font
COPY public/fonts/inter.woff2 src/app/fonts/inter.woff2

# Remove optimizeFonts from next.config.ts if it exists
RUN if [ -f next.config.ts ]; then sed -i "/optimizeFonts: false,/d" next.config.ts; fi

# Build the Next.js app
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
# ... rest of your Dockerfile

WORKDIR /app

# Copy necessary files from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/app/fonts ./src/app/fonts

# Expose the port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]