import { NextRequest, NextResponse } from 'next/server';
import { Task } from '@/types';
import { prisma } from '@/lib/prisma';
import { getAuthSession, isPrivilegedRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = getAuthSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const privileged = isPrivilegedRole(session.role);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search') || '';
    const userId = privileged ? searchParams.get('userId') : null;

    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};

    if (!privileged) {
      whereClause.userId = session.userId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    if (userId) {
      whereClause.userId = userId;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
        include: { user: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where: Object.keys(whereClause).length > 0 ? whereClause : undefined }),
    ]);

    const data = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      status: task.status as 'pending' | 'in-progress' | 'completed' | 'cancelled',
      priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
      assignee: {
        id: task.user.id,
        name: task.user.name || '',
        email: task.user.email,
        role: task.user.role as 'admin' | 'user' | 'moderator',
        createdAt: task.user.createdAt.toISOString(),
        updatedAt: task.user.updatedAt.toISOString(),
      },
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    }));
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getAuthSession(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const privileged = isPrivilegedRole(session.role);

    const body = await request.json();
    const { title, description, status = 'pending', priority = 'medium' } = body;

    const requestedUserId = body.userId ?? body.assigneeId;
    const targetUserId = privileged ? (requestedUserId ?? session.userId) : session.userId;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status,
        priority,
        userId: targetUserId,
      },
      include: { user: true },
    });

    const newTask: Task = {
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      status: task.status as 'pending' | 'in-progress' | 'completed' | 'cancelled',
      priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
      assignee: {
        id: task.user.id,
        name: task.user.name || '',
        email: task.user.email,
        role: task.user.role as 'admin' | 'user' | 'moderator',
        createdAt: task.user.createdAt.toISOString(),
        updatedAt: task.user.updatedAt.toISOString(),
      },
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      data: newTask,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}