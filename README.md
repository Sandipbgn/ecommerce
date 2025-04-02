# E-Commerce Platform

A full-featured e-commerce application with customer and admin interfaces, built with Next.js, Node.js, Express, PostgreSQL, and Prisma.

## Overview

This e-commerce platform provides a complete online shopping experience with the following features:

### Customer Features

- Browse products with filtering and search
- Product details with images and descriptions
- Shopping cart functionality
- Secure checkout process
- PayPal payment integration
- Order history and tracking
- User account management

### Admin Features

- Dashboard with sales analytics
- Order management
- Product management (CRUD operations)
- User management
- Inventory tracking
- Payment history

## Tech Stack

### Frontend

- Next.js (React framework)
- Tailwind CSS for styling
- React Context API for state management
- React Hot Toast for notifications

### Backend

- Node.js with Express
- PostgreSQL database
- Prisma ORM
- JWT authentication
- PayPal integration for payments

## Installation and Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Vanilla Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/sandipbgn/ecommerce.git
   cd ecommerce
   ```

2. **Backend Setup**

   ```bash
   # Navigate to backend directory
   cd backend

   # Install dependencies
   npm install

   # Copy example env file and modify as needed
   cp .env.example .env

   # Run database migrations
   npx prisma migrate dev

   # Seed the database with sample data
   npx prisma db seed

   # Start the backend server
   npm run dev
   ```

3. **Frontend Setup**

   ```bash
   # Navigate to frontend directory
   cd ../frontend

   # Install dependencies
   npm install

   # Start the frontend development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3030
   - API Documentation: http://localhost:3030/api-docs

### Running with Docker

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/ecommerce.git
   cd ecommerce
   ```

2. **Start the Docker containers**

   ```bash
   docker compose up -d
   ```

3. **Run database migrations and seed data**

   ```bash
   # Wait for the database to be ready
   sleep 5
   
   # Run migrations
   docker exec ecommerce_backend npx prisma migrate deploy
   
   # Generate Prisma client
   docker exec ecommerce_backend npx prisma generate
   
   # Seed the database with sample data
   docker exec ecommerce_backend npx prisma db seed
   ```

   You can also create a shell script to automate this process:

   ```bash
   # Create a file called setup-db.sh
   echo '#!/bin/bash
   echo "Waiting for database to be ready..."
   sleep 5
   echo "Running migrations..."
   docker exec ecommerce_backend npx prisma migrate deploy
   echo "Generating Prisma client..."
   docker exec ecommerce_backend npx prisma generate
   echo "Seeding database..."
   docker exec ecommerce_backend npx prisma db seed
   echo "Database setup complete!"
   ' > setup-db.sh
   
   # Make it executable
   chmod +x setup-db.sh
   
   # Run it
   ./setup-db.sh
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3030
   - API Documentation: http://localhost:3030/api-docs

## Database Setup

The application uses Prisma to manage the database schema and migrations. The Docker Compose configuration automatically sets up a PostgreSQL database.

If you're using the vanilla installation, you'll need to:

1. Create a PostgreSQL database
2. Update the `DATABASE_URL` in the `.env` file
3. Run Prisma migrations and seed the database as described above

## Default Users

After seeding the database, the following user accounts are available:

| Email             | Password      | Role  |
| ----------------- | ------------- | ----- |
| admin@example.com | password123   | Admin |
| john@example.com  | password123   | User  |
| jane@example.com  | password123   | User  |

## Environment Variables

### Backend (.env)

- `PORT`: Server port (default: 3030)
- `JWT_SECRET`: Secret key for JWT authentication
- `PAYPAL_CLIENT_ID`: PayPal client ID for payment integration
- `PAYPAL_CLIENT_SECRET`: PayPal client secret
- `FRONTEND_URL`: Frontend application URL
- `DATABASE_URL`: PostgreSQL connection string

### Frontend (.env.local)

- `NEXT_PUBLIC_API_URL`: Backend API URL

## Troubleshooting Docker Setup

If you encounter issues with the Docker setup, try these solutions:

1. **Database connection errors**:
   - Ensure the PostgreSQL container is running: `docker ps`
   - Check PostgreSQL logs: `docker logs postgres_db`
   - Verify the connection string in the backend environment variables

2. **Migration/Seed failures**:
   - Make sure the database is ready before running migrations
   - Check if the backend container has proper access to the database
   - Run migrations with the `--force` flag: `docker exec ecommerce_backend npx prisma migrate deploy --force`
   - If seeding fails, try regenerating the Prisma client: `docker exec ecommerce_backend npx prisma generate`

3. **Frontend build issues**:
   - Check the frontend container logs: `docker logs ecommerce_frontend`
   - You may need to rebuild the frontend container: `docker compose build frontend`