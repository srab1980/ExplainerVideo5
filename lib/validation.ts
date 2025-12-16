import { z } from 'zod';

// ============================================================================
// Authentication Schemas
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum(['user', 'admin']).default('user').optional(),
});

export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const passwordUpdateSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// ============================================================================
// User Schemas
// ============================================================================

export const userCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum(['user', 'admin']).default('user').optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  role: z.enum(['user', 'admin']).optional(),
  emailVerified: z.boolean().optional(),
});

export const userIdSchema = z.object({
  id: z.string().cuid('Invalid user ID'),
});

// ============================================================================
// Task Schemas
// ============================================================================

export const taskCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(['pending', 'in-progress', 'completed']).default('pending').optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium').optional(),
  userId: z.string().cuid('Invalid user ID'),
});

export const taskUpdateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long').optional(),
  description: z.string().max(2000, 'Description too long').optional().nullable(),
  status: z.enum(['pending', 'in-progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export const taskIdSchema = z.object({
  id: z.string().cuid('Invalid task ID'),
});

export const taskFilterSchema = z.object({
  userId: z.string().cuid('Invalid user ID').optional(),
  status: z.enum(['pending', 'in-progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  search: z.string().optional(),
});

// ============================================================================
// Pagination Schema
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// ============================================================================
// Query Parameter Schemas
// ============================================================================

export const userListQuerySchema = paginationSchema.extend({
  role: z.enum(['user', 'admin']).optional(),
  search: z.string().optional(),
});

export const taskListQuerySchema = paginationSchema.extend(taskFilterSchema.shape);

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>;

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserIdInput = z.infer<typeof userIdSchema>;

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type TaskIdInput = z.infer<typeof taskIdSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;

export type PaginationInput = z.infer<typeof paginationSchema>;
export type UserListQueryInput = z.infer<typeof userListQuerySchema>;
export type TaskListQueryInput = z.infer<typeof taskListQuerySchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validate data against a schema and return typed result
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true;
  data: T;
} | {
  success: false;
  errors: z.ZodError;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

/**
 * Format Zod errors into a user-friendly format
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    formatted[path] = issue.message;
  });
  
  return formatted;
}

/**
 * Get first validation error message
 */
export function getFirstError(error: z.ZodError): string {
  return error.issues[0]?.message || 'Validation failed';
}
