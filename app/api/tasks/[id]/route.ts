import { NextRequest, NextResponse } from 'next/server';
import { Task } from '@/types';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    const taskData: Task = {
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
      data: taskData,
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, status, priority, userId } = body;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // If updating userId, verify the new user exists
    if (userId && userId !== task.userId) {
      const newUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!newUser) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(userId !== undefined && { userId }),
      },
      include: { user: true },
    });

    const taskData: Task = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description || undefined,
      status: updatedTask.status as 'pending' | 'in-progress' | 'completed' | 'cancelled',
      priority: updatedTask.priority as 'low' | 'medium' | 'high' | 'urgent',
      assignee: {
        id: updatedTask.user.id,
        name: updatedTask.user.name || '',
        email: updatedTask.user.email,
        role: updatedTask.user.role as 'admin' | 'user' | 'moderator',
        createdAt: updatedTask.user.createdAt.toISOString(),
        updatedAt: updatedTask.user.updatedAt.toISOString(),
      },
      createdAt: updatedTask.createdAt.toISOString(),
      updatedAt: updatedTask.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: taskData,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
