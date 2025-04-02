FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Ensure storage directory exists
RUN mkdir -p storage/uploads

# Expose the port your app runs on
EXPOSE 3030

# Start the app
CMD ["npm", "start"]