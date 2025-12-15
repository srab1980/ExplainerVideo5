// Mock API route for tasks
import { NextRequest, NextResponse } from 'next/server';
import { Task } from '@/types';

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project setup',
    description: 'Set up the initial project structure with Next.js, TypeScript, and Tailwind CSS',
    status: 'completed',
    priority: 'high',
    assignee: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    dueDate: '2023-01-15T00:00:00Z',
  },
  {
    id: '2',
    title: 'Implement authentication',
    description: 'Add user authentication and authorization features',
    status: 'in-progress',
    priority: 'medium',
    assignee: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'user',
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
    },
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
    dueDate: '2023-02-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'Design responsive layout',
    description: 'Create a responsive layout that works on all device sizes',
    status: 'pending',
    priority: 'low',
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search') || '';
    
    let filteredTasks = [...mockTasks];
    
    // Apply filters
    if (status) {
      filteredTasks = filteredTasks.filter(task => task.status === status);
    }
    
    if (priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === priority);
    }
    
    if (search) {
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
    
    return NextResponse.json({
      success: true,
      data: paginatedTasks,
      pagination: {
        page,
        limit,
        total: filteredTasks.length,
        totalPages: Math.ceil(filteredTasks.length / limit),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, status = 'pending', priority = 'medium', assigneeId, dueDate } = body;
    
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }
    
    let assignee;
    if (assigneeId) {
      // In a real app, you'd fetch the user from the database
      assignee = {
        id: assigneeId,
        name: 'Unknown User',
        email: 'unknown@example.com',
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    
    const newTask: Task = {
      id: String(mockTasks.length + 1),
      title,
      description,
      status,
      priority,
      assignee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate,
    };
    
    mockTasks.push(newTask);
    
    return NextResponse.json({
      success: true,
      data: newTask,
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}