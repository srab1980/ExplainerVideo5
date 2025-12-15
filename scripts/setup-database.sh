#!/bin/bash

# Database Setup Script
# This script helps set up the database for the application

set -e

echo "🚀 Database Setup Script"
echo "========================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL" .env; then
    echo -e "${YELLOW}⚠️  DATABASE_URL not found in .env${NC}"
    echo ""
    echo "Please choose your database setup:"
    echo "1. Local PostgreSQL"
    echo "2. Cloud PostgreSQL (Railway, Supabase, etc.)"
    echo "3. Skip database configuration"
    read -p "Enter your choice (1-3): " choice

    case $choice in
        1)
            read -p "Enter database name [next_app_db]: " db_name
            db_name=${db_name:-next_app_db}
            read -p "Enter PostgreSQL username [postgres]: " db_user
            db_user=${db_user:-postgres}
            read -sp "Enter PostgreSQL password: " db_pass
            echo ""
            read -p "Enter host [localhost]: " db_host
            db_host=${db_host:-localhost}
            read -p "Enter port [5432]: " db_port
            db_port=${db_port:-5432}
            
            DATABASE_URL="postgresql://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}?schema=public"
            echo "" >> .env
            echo "DATABASE_URL=\"${DATABASE_URL}\"" >> .env
            echo -e "${GREEN}✅ DATABASE_URL added to .env${NC}"
            ;;
        2)
            echo ""
            echo "Please paste your cloud database connection string:"
            read -p "DATABASE_URL: " DATABASE_URL
            echo "" >> .env
            echo "DATABASE_URL=\"${DATABASE_URL}\"" >> .env
            echo -e "${GREEN}✅ DATABASE_URL added to .env${NC}"
            ;;
        3)
            echo -e "${YELLOW}⚠️  Skipping database configuration${NC}"
            echo "You'll need to add DATABASE_URL to .env manually"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            exit 1
            ;;
    esac
fi

# Check if JWT_SECRET is set
if ! grep -q "JWT_SECRET" .env; then
    echo -e "${YELLOW}⚠️  JWT_SECRET not found in .env${NC}"
    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    echo "" >> .env
    echo "JWT_SECRET=\"${JWT_SECRET}\"" >> .env
    echo -e "${GREEN}✅ Generated JWT_SECRET${NC}"
fi

echo ""
echo "📦 Installing dependencies..."
if command -v npm &> /dev/null; then
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ npm not found. Please install Node.js${NC}"
    exit 1
fi

echo ""
echo "🗄️  Setting up Prisma..."

# Check if Prisma is already initialized
if [ ! -d "prisma" ]; then
    echo "Initializing Prisma..."
    npx prisma init
    echo -e "${GREEN}✅ Prisma initialized${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Please update prisma/schema.prisma with your data models${NC}"
    echo "See IMPLEMENTATION_GUIDE.md for the schema definition"
else
    echo -e "${GREEN}✅ Prisma already initialized${NC}"
fi

echo ""
read -p "Would you like to run database migrations now? (y/n): " run_migrations

if [ "$run_migrations" = "y" ] || [ "$run_migrations" = "Y" ]; then
    echo "Running migrations..."
    npx prisma migrate dev --name init
    echo -e "${GREEN}✅ Migrations completed${NC}"
    
    echo ""
    read -p "Would you like to seed the database with sample data? (y/n): " run_seed
    
    if [ "$run_seed" = "y" ] || [ "$run_seed" = "Y" ]; then
        if [ -f "prisma/seed.ts" ] || [ -f "prisma/seed.js" ]; then
            npm run db:seed
            echo -e "${GREEN}✅ Database seeded${NC}"
        else
            echo -e "${YELLOW}⚠️  No seed file found. Skipping...${NC}"
        fi
    fi
fi

echo ""
echo -e "${GREEN}✅ Database setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review your .env file"
echo "2. Update prisma/schema.prisma if needed"
echo "3. Run 'npm run dev' to start the application"
echo "4. Visit http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  npm run dev              - Start development server"
echo "  npx prisma studio        - Open Prisma Studio (database GUI)"
echo "  npx prisma migrate dev   - Create and apply migrations"
echo "  npx prisma db seed       - Seed database"
echo ""
