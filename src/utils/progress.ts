import { Task, TaskPriority, TaskStatus } from '../types/task';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Cần làm',
  in_progress: 'Đang thực hiện',
  done: 'Hoàn thành',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Ưu tiên thấp',
  medium: 'Trung bình',
  high: 'Ưu tiên cao',
};

export const PRIORITY_SHORT_LABELS: Record<TaskPriority, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
};

export const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToTodayIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateTaskProgress(task: Task): number {
  if (task.subtasks.length > 0) {
    const completed = task.subtasks.filter((s) => s.completed).length;
    return Math.round((completed / task.subtasks.length) * 100);
  }
  if (task.status === 'done') return 100;
  if (task.status === 'todo') return 0;
  return Math.max(5, Math.min(95, task.manualProgress || 50));
}

export function getSubtaskStats(task: Task): {
  completed: number;
  total: number;
  hasSubtasks: boolean;
} {
  const total = task.subtasks.length;
  const completed = task.subtasks.filter((s) => s.completed).length;
  return {
    completed,
    total,
    hasSubtasks: total > 0,
  };
}

export function isTaskOverdue(task: Task, todayIso = getTodayIsoDate()): boolean {
  return Boolean(task.dueDate && task.status !== 'done' && task.dueDate < todayIso);
}

export function isTaskDueToday(task: Task, todayIso = getTodayIsoDate()): boolean {
  return Boolean(task.dueDate && task.dueDate === todayIso);
}

export type DeadlineTone = 'overdue' | 'soon' | 'normal' | 'done' | 'none';

export interface DeadlineDisplay {
  label: string;
  shortDate: string;
  tone: DeadlineTone;
}

export function formatIsoDateShort(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function getDeadlineDisplay(
  dueDate: string | null,
  status: TaskStatus,
  todayIso = getTodayIsoDate()
): DeadlineDisplay {
  if (!dueDate) {
    return {
      label: 'Chưa đặt hạn',
      shortDate: '—',
      tone: 'none',
    };
  }

  const shortDate = formatIsoDateShort(dueDate);

  if (status === 'done') {
    return {
      label: shortDate,
      shortDate,
      tone: 'done',
    };
  }

  const todayMs = new Date(`${todayIso}T00:00:00`).getTime();
  const dueMs = new Date(`${dueDate}T00:00:00`).getTime();
  const diffDays = Math.round((dueMs - todayMs) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Quá hạn ${Math.abs(diffDays)} ngày`,
      shortDate,
      tone: 'overdue',
    };
  }
  if (diffDays === 0) {
    return {
      label: 'Hạn hôm nay',
      shortDate,
      tone: 'soon',
    };
  }
  if (diffDays === 1) {
    return {
      label: 'Hạn ngày mai',
      shortDate,
      tone: 'soon',
    };
  }
  if (diffDays <= 3) {
    return {
      label: `Còn ${diffDays} ngày`,
      shortDate,
      tone: 'soon',
    };
  }

  return {
    label: shortDate,
    shortDate,
    tone: 'normal',
  };
}
