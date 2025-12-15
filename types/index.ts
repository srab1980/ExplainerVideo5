// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'date' | 'datetime-local';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  label?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  footer?: React.ReactNode;
}

export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

// API Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'moderator';
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: User;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

// Environment Types
export interface EnvironmentVariables {
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_APP_NAME: string;
  NEXT_PUBLIC_ENVIRONMENT: 'development' | 'staging' | 'production';
  API_SECRET_KEY?: string;
}

// State Management Types
export interface AppState {
  user: User | null;
  tasks: Task[];
  loading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
}

export interface AppActions {
  setUser: (user: User | null) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleTheme: () => void;
  clearError: () => void;
  reset: () => void;
  clearTasks: () => void;
  getCompletedTasks: () => Task[];
  getPendingTasks: () => Task[];
  getTasksByPriority: (priority: Task['priority']) => Task[];
  getTaskById: (id: string) => Task | undefined;
  isAuthenticated: () => boolean;
}

export type AppStore = AppState & AppActions;

// Route Types
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  title: string;
  exact?: boolean;
  protected?: boolean;
  loading?: boolean;
}

// Form Types
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface FormActions<T> {
  setData: (data: T) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  setTouched: (touched: Partial<Record<keyof T, boolean>>) => void;
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  reset: () => void;
  validate: () => boolean;
}

export type FormStore<T> = FormState<T> & FormActions<T>;