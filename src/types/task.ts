export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  dueDate: string | null; // YYYY-MM-DD
  manualProgress: number; // 0..100 used when subtasks.length === 0
  subtasks: Subtask[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Project {
  id: string;
  name: string;
  color: string; // Hex accent for tiny folder indicator
}

export type ViewMode = 'list' | 'kanban';

export type SmartFilter = 'all' | 'today' | 'in_progress' | 'overdue' | 'done';

export type PriorityFilter = 'all' | TaskPriority;

export type SortOption =
  | 'updated_desc'
  | 'due_asc'
  | 'progress_desc'
  | 'priority_desc';
