import { Task } from '@/types';
import { TaskFilterState } from '@/components/TaskFilters';

export function filterAndSortTasks(tasks: Task[], filters: TaskFilterState): Task[] {
  let filtered = [...tasks];

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (task) =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.assignee?.name.toLowerCase().includes(searchLower)
    );
  }

  // Apply status filter
  if (filters.status !== 'all') {
    filtered = filtered.filter((task) => task.status === filters.status);
  }

  // Apply priority filter
  if (filters.priority !== 'all') {
    filtered = filtered.filter((task) => task.priority === filters.priority);
  }

  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;

      case 'priority': {
        const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      }

      case 'dueDate':
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;

      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;

      case 'createdAt':
      default:
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
}

export const DEFAULT_FILTERS: TaskFilterState = {
  search: '',
  status: 'all',
  priority: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};
