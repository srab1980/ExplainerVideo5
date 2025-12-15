# Implementation Guide: Database Integration (Phase 1.1)

## Getting Started with Prisma & PostgreSQL

This guide walks through implementing real database persistence to replace the mock API routes.

---

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed locally OR access to a cloud PostgreSQL instance (recommended: Railway, Supabase, or Neon)
- Basic understanding of SQL and database concepts

---

## Step 1: Install Dependencies

```bash
# Install Prisma CLI and client
npm install prisma @prisma/client

# Install additional validation library
npm install zod

# Install bcrypt for password hashing
npm install bcryptjs
npm install -D @types/bcryptjs
```

---

## Step 2: Initialize Prisma

```bash
# Initialize Prisma (creates prisma/ directory and .env)
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Your database schema
- `.env` file (or updates existing) - Database connection string

---

## Step 3: Configure Database Connection

### Option A: Local PostgreSQL

Update your `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/next_app_db?schema=public"
```

### Option B: Cloud PostgreSQL (Recommended for development)

**Using Railway:**
1. Go to https://railway.app/
2. Create new project → Provision PostgreSQL
3. Copy connection string to `.env`:
```env
DATABASE_URL="postgresql://postgres:xxx@containers-us-west-xxx.railway.app:5432/railway"
```

**Using Supabase:**
1. Go to https://supabase.com/
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy and add to `.env`:
```env
DATABASE_URL="postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres"
```

---

## Step 4: Define Database Schema

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String?
  role          String    @default("user")
  emailVerified Boolean   @default(false)
  tasks         Task[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([email])
  @@map("users")
}

model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  status      String   @default("pending")
  priority    String   @default("medium")
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@map("tasks")
}
```

---

## Step 5: Create and Run Migration

```bash
# Create migration and apply to database
npx prisma migrate dev --name init

# This will:
# 1. Create migration files in prisma/migrations/
# 2. Apply migration to your database
# 3. Generate Prisma Client
```

---

## Step 6: Create Prisma Client Singleton

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## Step 7: Create Database Utility Functions

Create `lib/db.ts`:

```typescript
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

// User utilities
export const userDb = {
  async create(data: { email: string; password: string; name?: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
  },

  async verifyPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  },

  async list(params: { skip?: number; take?: number } = {}) {
    const { skip = 0, take = 10 } = params;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count(),
    ]);

    return { users, total };
  },

  async update(id: string, data: { name?: string; role?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });
  },

  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  },
};

// Task utilities
export const taskDb = {
  async create(data: { title: string; description?: string; userId: string; status?: string }) {
    return prisma.task.create({
      data,
    });
  },

  async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  },

  async list(params: {
    userId?: string;
    status?: string;
    skip?: number;
    take?: number;
  } = {}) {
    const { userId, status, skip = 0, take = 10 } = params;

    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    return { tasks, total };
  },

  async update(id: string, data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
  }) {
    return prisma.task.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.task.delete({
      where: { id },
    });
  },
};
```

---

## Step 8: Update API Routes

### Update `app/api/auth/register/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/db';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationResult.error.errors[0].message 
        },
        { status: 400 }
      );
    }

    const { email, password, name } = validationResult.data;

    // Check if user already exists
    const existingUser = await userDb.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create user
    const user = await userDb.create({ email, password, name });

    return NextResponse.json({
      success: true,
      data: { user },
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}
```

### Update `app/api/auth/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/db';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: validationResult.error.errors[0].message 
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Find user
    const user = await userDb.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await userDb.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
```

### Update `app/api/users/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const { users, total } = await userDb.list({ skip, take: limit });

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
```

---

## Step 9: Add JWT Secret to Environment

Update `.env`:

```env
DATABASE_URL="your-database-url"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

Install jsonwebtoken:
```bash
npm install jsonwebtoken
npm install -D @types/jsonwebtoken
```

---

## Step 10: Testing the Implementation

```bash
# Start the development server
npm run dev

# Test registration (in another terminal)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# View database in Prisma Studio
npx prisma studio
```

---

## Step 11: Update Remaining API Routes

Follow the same pattern for:
- `app/api/users/[id]/route.ts` - Update to use userDb
- `app/api/tasks/route.ts` - Update to use taskDb
- `app/api/tasks/[id]/route.ts` - Update to use taskDb

---

## Common Issues & Solutions

### Issue: Connection timeout to database
**Solution:** Check your DATABASE_URL and ensure the database is accessible. For cloud databases, check firewall settings.

### Issue: "Prisma Client is not generated"
**Solution:** Run `npx prisma generate`

### Issue: Migration conflicts
**Solution:** 
```bash
# Reset database (development only!)
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --name fix_migration
```

### Issue: Type errors after migration
**Solution:** Restart your TypeScript server in VS Code or run `npm run type-check`

---

## Next Steps After Database Integration

1. ✅ Database is connected and working
2. ➡️ Add input validation with Zod for all endpoints
3. ➡️ Implement proper error handling middleware
4. ➡️ Add database connection pooling for production
5. ➡️ Set up database backups
6. ➡️ Add database indexes for performance
7. ➡️ Implement transaction handling for complex operations
8. ➡️ Add database seeding for development/testing

---

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Zod Validation](https://zod.dev/)

---

**Estimated Time to Complete:** 1-2 days for initial setup, 3-5 days for all API routes
