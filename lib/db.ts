import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

// User database utilities
export const userDb = {
  /**
   * Create a new user with hashed password
   */
  async create(data: { email: string; password: string; name?: string; role?: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });
  },

  /**
   * Find user by email (includes password for authentication)
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  /**
   * Find user by ID (excludes password)
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  /**
   * Verify password against hashed password
   */
  async verifyPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  },

  /**
   * List users with pagination
   */
  async list(params: { skip?: number; take?: number; role?: string } = {}) {
    const { skip = 0, take = 10, role } = params;
    
    const where = role ? { role } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: { tasks: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  },

  /**
   * Update user information
   */
  async update(id: string, data: { name?: string; role?: string; emailVerified?: boolean }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        updatedAt: true,
      },
    });
  },

  /**
   * Update user password
   */
  async updatePassword(id: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  },

  /**
   * Delete user (cascades to tasks)
   */
  async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  },
};

// Task database utilities
export const taskDb = {
  /**
   * Create a new task
   */
  async create(data: {
    title: string;
    description?: string;
    userId: string;
    status?: string;
    priority?: string;
  }) {
    return prisma.task.create({
      data,
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

  /**
   * Find task by ID
   */
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

  /**
   * List tasks with filtering and pagination
   */
  async list(params: {
    userId?: string;
    status?: string;
    priority?: string;
    skip?: number;
    take?: number;
    search?: string;
  } = {}) {
    const { userId, status, priority, skip = 0, take = 10, search } = params;

    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

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

  /**
   * Update task
   */
  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
    }
  ) {
    return prisma.task.update({
      where: { id },
      data,
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

  /**
   * Delete task
   */
  async delete(id: string) {
    return prisma.task.delete({
      where: { id },
    });
  },

  /**
   * Get task statistics
   */
  async getStats(userId?: string) {
    const where = userId ? { userId } : {};

    const [total, pending, inProgress, completed] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.count({ where: { ...where, status: 'pending' } }),
      prisma.task.count({ where: { ...where, status: 'in-progress' } }),
      prisma.task.count({ where: { ...where, status: 'completed' } }),
    ]);

    return {
      total,
      pending,
      inProgress,
      completed,
    };
  },
};
