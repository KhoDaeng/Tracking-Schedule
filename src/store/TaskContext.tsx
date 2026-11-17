import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createSeedTasks, DEFAULT_PROJECTS } from '../data/seedData';
import {
  PriorityFilter,
  Project,
  SmartFilter,
  SortOption,
  Subtask,
  Task,
  TaskPriority,
  TaskStatus,
  ViewMode,
} from '../types/task';
import {
  calculateTaskProgress,
  generateId,
  getTodayIsoDate,
  isTaskDueToday,
  isTaskOverdue,
  PRIORITY_WEIGHT,
} from '../utils/progress';

const STORAGE_KEY = 'tracking_schedule_workspace_v1';

interface PersistedWorkspace {
  version: 1;
  tasks: Task[];
  projects: Project[];
  viewMode: ViewMode;
}

export interface ToastState {
  id: string;
  message: string;
  tone?: 'info' | 'success' | 'error';
  undoLabel?: string;
  onUndo?: () => void;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  dueDate: string | null;
  subtaskTitles: string[];
}

interface TaskContextValue {
  tasks: Task[];
  filteredTasks: Task[];
  projects: Project[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  smartFilter: SmartFilter;
  setSmartFilter: (filter: SmartFilter) => void;
  selectedProjectId: string | 'all';
  setSelectedProjectId: (projectId: string | 'all') => void;
  priorityFilter: PriorityFilter;
  setPriorityFilter: (priority: PriorityFilter) => void;
  sortOption: SortOption;
  setSortOption: (sort: SortOption) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  activeTask: Task | null;
  createModalOpen: boolean;
  createModalDefaultStatus: TaskStatus;
  openCreateModal: (defaultStatus?: TaskStatus) => void;
  closeCreateModal: () => void;
  toast: ToastState | null;
  dismissToast: () => void;
  showToast: (toast: Omit<ToastState, 'id'>) => void;
  // Task actions
  addTask: (input: CreateTaskInput) => Task;
  updateTask: (taskId: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (taskId: string) => void;
  moveTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  // Subtask actions
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  updateSubtaskTitle: (taskId: string, subtaskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  moveSubtask: (taskId: string, index: number, direction: 'up' | 'down') => void;
  // Project actions
  addProject: (name: string, color: string) => Project;
  deleteProject: (projectId: string) => void;
  // Backup & reset
  exportJson: () => void;
  importJson: (rawJson: string) => { ok: boolean; error?: string };
  resetToSampleData: () => void;
  clearAllTasks: () => void;
  resetAllFilters: () => void;
  // Computed counts
  counts: {
    all: number;
    today: number;
    inProgress: number;
    overdue: number;
    done: number;
    byProject: Record<string, number>;
  };
  overallStats: {
    totalTasks: number;
    doneTasks: number;
    activeTasks: number;
    overdueTasks: number;
    avgProgress: number;
    completedSubtasks: number;
    totalSubtasks: number;
  };
}

const TaskContext = createContext<TaskContextValue | null>(null);

function loadInitialWorkspace(): PersistedWorkspace {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedWorkspace>;
      if (parsed && Array.isArray(parsed.tasks) && Array.isArray(parsed.projects)) {
        return {
          version: 1,
          tasks: parsed.tasks,
          projects: parsed.projects.length > 0 ? parsed.projects : DEFAULT_PROJECTS,
          viewMode: parsed.viewMode === 'kanban' ? 'kanban' : 'list',
        };
      }
    }
  } catch {
    // Fallback to seed data if storage is corrupted
  }
  return {
    version: 1,
    tasks: createSeedTasks(),
    projects: DEFAULT_PROJECTS,
    viewMode: 'list',
  };
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [initial] = useState<PersistedWorkspace>(() => loadInitialWorkspace());
  const [tasks, setTasks] = useState<Task[]>(initial.tasks);
  const [projects, setProjects] = useState<Project[]>(initial.projects);
  const [viewMode, setViewMode] = useState<ViewMode>(initial.viewMode);

  const [smartFilter, setSmartFilter] = useState<SmartFilter>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('updated_desc');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalDefaultStatus, setCreateModalDefaultStatus] = useState<TaskStatus>('todo');
  const [toast, setToast] = useState<ToastState | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      const payload: PersistedWorkspace = {
        version: 1,
        tasks,
        projects,
        viewMode,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors silently
    }
  }, [tasks, projects, viewMode]);

  // Auto-dismiss toast after 4.5s
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      setToast((current) => (current?.id === toast.id ? null : current));
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((next: Omit<ToastState, 'id'>) => {
    setToast({ ...next, id: generateId('toast') });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const openCreateModal = useCallback((defaultStatus: TaskStatus = 'todo') => {
    setCreateModalDefaultStatus(defaultStatus);
    setCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false);
  }, []);

  const addTask = useCallback((input: CreateTaskInput): Task => {
    const now = new Date().toISOString();
    const cleanSubtasks: Subtask[] = input.subtaskTitles
      .map((t) => t.trim())
      .filter(Boolean)
      .map((title) => ({
        id: generateId('sub'),
        title,
        completed: input.status === 'done',
      }));

    const newTask: Task = {
      id: generateId('task'),
      title: input.title.trim(),
      description: input.description.trim(),
      status: input.status,
      priority: input.priority,
      projectId: input.projectId,
      dueDate: input.dueDate || null,
      manualProgress: input.status === 'done' ? 100 : input.status === 'in_progress' ? 50 : 0,
      subtasks: cleanSubtasks,
      createdAt: now,
      updatedAt: now,
      completedAt: input.status === 'done' ? now : null,
    };

    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback(
    (taskId: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
      const now = new Date().toISOString();
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== taskId) return task;
          const updated: Task = {
            ...task,
            ...patch,
            updatedAt: now,
          };
          if (patch.status === 'done' && task.status !== 'done') {
            updated.completedAt = now;
          } else if (patch.status && patch.status !== 'done') {
            updated.completedAt = null;
          }
          return updated;
        })
      );
    },
    []
  );

  const moveTaskStatus = useCallback((taskId: string, newStatus: TaskStatus) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId || task.status === newStatus) return task;

        let nextSubtasks = task.subtasks;
        let nextManualProgress = task.manualProgress;

        if (newStatus === 'done') {
          nextSubtasks = task.subtasks.map((s) => ({ ...s, completed: true }));
          nextManualProgress = 100;
        } else if (newStatus === 'todo') {
          if (task.status === 'done') {
            nextSubtasks = task.subtasks.map((s) => ({ ...s, completed: false }));
          }
          nextManualProgress = 0;
        } else if (newStatus === 'in_progress') {
          if (task.status === 'done') {
            if (task.subtasks.length > 0 && task.subtasks.every((s) => s.completed)) {
              const lastIdx = task.subtasks.length - 1;
              nextSubtasks = task.subtasks.map((s, idx) =>
                idx === lastIdx ? { ...s, completed: false } : s
              );
            } else {
              nextManualProgress = 50;
            }
          } else if (task.subtasks.length === 0 && task.manualProgress === 0) {
            nextManualProgress = 50;
          }
        }

        return {
          ...task,
          status: newStatus,
          subtasks: nextSubtasks,
          manualProgress: nextManualProgress,
          updatedAt: now,
          completedAt: newStatus === 'done' ? now : null,
        };
      })
    );
  }, []);

  const deleteTask = useCallback(
    (taskId: string) => {
      const target = tasks.find((t) => t.id === taskId);
      if (!target) return;
      const targetIndex = tasks.findIndex((t) => t.id === taskId);

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setActiveTaskId((curr) => (curr === taskId ? null : curr));

      showToast({
        message: `Đã xóa "${target.title}"`,
        tone: 'info',
        undoLabel: 'Hoàn tác',
        onUndo: () => {
          setTasks((prev) => {
            if (prev.some((t) => t.id === target.id)) return prev;
            const copy = [...prev];
            copy.splice(Math.min(targetIndex, copy.length), 0, target);
            return copy;
          });
        },
      });
    },
    [tasks, showToast]
  );

  const syncStatusFromSubtasks = (task: Task, nextSubtasks: Subtask[], now: string): Task => {
    if (nextSubtasks.length === 0) {
      return {
        ...task,
        subtasks: nextSubtasks,
        updatedAt: now,
      };
    }

    const doneCount = nextSubtasks.filter((s) => s.completed).length;
    let nextStatus: TaskStatus = task.status;
    let completedAt = task.completedAt;

    if (doneCount === nextSubtasks.length) {
      nextStatus = 'done';
      completedAt = completedAt || now;
    } else if (doneCount > 0) {
      nextStatus = 'in_progress';
      completedAt = null;
    } else if (task.status === 'done') {
      nextStatus = 'in_progress';
      completedAt = null;
    }

    return {
      ...task,
      subtasks: nextSubtasks,
      status: nextStatus,
      completedAt,
      updatedAt: now,
    };
  };

  const addSubtask = useCallback((taskId: string, title: string) => {
    const clean = title.trim();
    if (!clean) return;
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const nextSubtasks: Subtask[] = [
          ...task.subtasks,
          { id: generateId('sub'), title: clean, completed: false },
        ];
        // Adding an incomplete subtask to a completed task moves it back to in_progress
        return syncStatusFromSubtasks(task, nextSubtasks, now);
      })
    );
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const nextSubtasks = task.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        return syncStatusFromSubtasks(task, nextSubtasks, now);
      })
    );
  }, []);

  const updateSubtaskTitle = useCallback((taskId: string, subtaskId: string, title: string) => {
    const clean = title.trim();
    if (!clean) return;
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subtasks: task.subtasks.map((s) => (s.id === subtaskId ? { ...s, title: clean } : s)),
          updatedAt: now,
        };
      })
    );
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const nextSubtasks = task.subtasks.filter((s) => s.id !== subtaskId);
        return syncStatusFromSubtasks(task, nextSubtasks, now);
      })
    );
  }, []);

  const moveSubtask = useCallback(
    (taskId: string, index: number, direction: 'up' | 'down') => {
      const now = new Date().toISOString();
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== taskId) return task;
          const targetIdx = direction === 'up' ? index - 1 : index + 1;
          if (targetIdx < 0 || targetIdx >= task.subtasks.length) return task;
          const copy = [...task.subtasks];
          const [item] = copy.splice(index, 1);
          copy.splice(targetIdx, 0, item);
          return {
            ...task,
            subtasks: copy,
            updatedAt: now,
          };
        })
      );
    },
    []
  );

  const addProject = useCallback((name: string, color: string): Project => {
    const newProject: Project = {
      id: generateId('proj'),
      name: name.trim(),
      color,
    };
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  }, []);

  const deleteProject = useCallback(
    (projectId: string) => {
      if (projects.length <= 1) return;
      const fallback = projects.find((p) => p.id !== projectId);
      if (!fallback) return;

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setTasks((prev) =>
        prev.map((t) => (t.projectId === projectId ? { ...t, projectId: fallback.id } : t))
      );
      setSelectedProjectId((curr) => (curr === projectId ? 'all' : curr));
      showToast({ message: 'Đã xóa nhóm và chuyển công việc sang nhóm mặc định', tone: 'info' });
    },
    [projects, showToast]
  );

  const exportJson = useCallback(() => {
    const payload: PersistedWorkspace = {
      version: 1,
      tasks,
      projects,
      viewMode,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracking-schedule-backup-${getTodayIsoDate()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast({ message: 'Đã xuất tệp sao lưu JSON thành công', tone: 'success' });
  }, [tasks, projects, viewMode, showToast]);

  const importJson = useCallback(
    (rawJson: string): { ok: boolean; error?: string } => {
      try {
        const parsed = JSON.parse(rawJson) as Partial<PersistedWorkspace>;
        if (!parsed || !Array.isArray(parsed.tasks)) {
          return { ok: false, error: 'Tệp JSON không đúng định dạng danh sách công việc.' };
        }
        const validTasks: Task[] = parsed.tasks.filter(
          (item): item is Task =>
            Boolean(item && typeof item.id === 'string' && typeof item.title === 'string')
        );
        const validProjects: Project[] =
          Array.isArray(parsed.projects) && parsed.projects.length > 0
            ? parsed.projects.filter(
                (p): p is Project => Boolean(p && typeof p.id === 'string' && typeof p.name === 'string')
              )
            : projects;

        setTasks(validTasks);
        if (validProjects.length > 0) setProjects(validProjects);
        setActiveTaskId(null);
        showToast({
          message: `Đã khôi phục ${validTasks.length} công việc từ tệp JSON`,
          tone: 'success',
        });
        return { ok: true };
      } catch {
        return { ok: false, error: 'Không thể đọc tệp JSON. Vui lòng kiểm tra lại cấu trúc tệp.' };
      }
    },
    [projects, showToast]
  );

  const resetToSampleData = useCallback(() => {
    setProjects(DEFAULT_PROJECTS);
    setTasks(createSeedTasks());
    setSelectedProjectId('all');
    setSmartFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
    setActiveTaskId(null);
    showToast({ message: 'Đã khôi phục dữ liệu mẫu ban đầu', tone: 'info' });
  }, [showToast]);

  const clearAllTasks = useCallback(() => {
    const previousTasks = tasks;
    setTasks([]);
    setActiveTaskId(null);
    showToast({
      message: 'Đã xóa toàn bộ công việc để bắt đầu mới',
      tone: 'info',
      undoLabel: 'Hoàn tác',
      onUndo: () => setTasks(previousTasks),
    });
  }, [tasks, showToast]);

  const resetAllFilters = useCallback(() => {
    setSmartFilter('all');
    setSelectedProjectId('all');
    setPriorityFilter('all');
    setSearchQuery('');
  }, []);

  const todayIso = getTodayIsoDate();

  const counts = useMemo(() => {
    const byProject: Record<string, number> = {};
    for (const p of projects) {
      byProject[p.id] = 0;
    }

    let today = 0;
    let inProgress = 0;
    let overdue = 0;
    let done = 0;

    for (const task of tasks) {
      byProject[task.projectId] = (byProject[task.projectId] || 0) + 1;
      if (isTaskDueToday(task, todayIso) && task.status !== 'done') today++;
      if (task.status === 'in_progress') inProgress++;
      if (isTaskOverdue(task, todayIso)) overdue++;
      if (task.status === 'done') done++;
    }

    return {
      all: tasks.length,
      today,
      inProgress,
      overdue,
      done,
      byProject,
    };
  }, [tasks, projects, todayIso]);

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const list = tasks.filter((task) => {
      if (selectedProjectId !== 'all' && task.projectId !== selectedProjectId) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      if (smartFilter === 'today') {
        if (!isTaskDueToday(task, todayIso) || task.status === 'done') return false;
      } else if (smartFilter === 'in_progress') {
        if (task.status !== 'in_progress') return false;
      } else if (smartFilter === 'overdue') {
        if (!isTaskOverdue(task, todayIso)) return false;
      } else if (smartFilter === 'done') {
        if (task.status !== 'done') return false;
      }

      if (query) {
        const inTitle = task.title.toLowerCase().includes(query);
        const inDesc = task.description.toLowerCase().includes(query);
        const inSubtasks = task.subtasks.some((s) => s.title.toLowerCase().includes(query));
        if (!inTitle && !inDesc && !inSubtasks) return false;
      }

      return true;
    });

    return [...list].sort((a, b) => {
      if (sortOption === 'due_asc') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      if (sortOption === 'progress_desc') {
        return calculateTaskProgress(b) - calculateTaskProgress(a);
      }
      if (sortOption === 'priority_desc') {
        return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      }
      // updated_desc
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [tasks, selectedProjectId, priorityFilter, smartFilter, searchQuery, sortOption, todayIso]);

  const overallStats = useMemo(() => {
    const scopeTasks =
      selectedProjectId === 'all'
        ? tasks
        : tasks.filter((t) => t.projectId === selectedProjectId);

    const totalTasks = scopeTasks.length;
    const doneTasks = scopeTasks.filter((t) => t.status === 'done').length;
    const overdueTasks = scopeTasks.filter((t) => isTaskOverdue(t, todayIso)).length;
    const activeTasks = totalTasks - doneTasks;

    let completedSubtasks = 0;
    let totalSubtasks = 0;
    let sumProgress = 0;

    for (const task of scopeTasks) {
      sumProgress += calculateTaskProgress(task);
      totalSubtasks += task.subtasks.length;
      completedSubtasks += task.subtasks.filter((s) => s.completed).length;
    }

    const avgProgress = totalTasks > 0 ? Math.round(sumProgress / totalTasks) : 0;

    return {
      totalTasks,
      doneTasks,
      activeTasks,
      overdueTasks,
      avgProgress,
      completedSubtasks,
      totalSubtasks,
    };
  }, [tasks, selectedProjectId, todayIso]);

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeTaskId) ?? null,
    [tasks, activeTaskId]
  );

  const value: TaskContextValue = {
    tasks,
    filteredTasks,
    projects,
    viewMode,
    setViewMode,
    smartFilter,
    setSmartFilter,
    selectedProjectId,
    setSelectedProjectId,
    priorityFilter,
    setPriorityFilter,
    sortOption,
    setSortOption,
    searchQuery,
    setSearchQuery,
    activeTaskId,
    setActiveTaskId,
    activeTask,
    createModalOpen,
    createModalDefaultStatus,
    openCreateModal,
    closeCreateModal,
    toast,
    dismissToast,
    showToast,
    addTask,
    updateTask,
    deleteTask,
    moveTaskStatus,
    addSubtask,
    toggleSubtask,
    updateSubtaskTitle,
    deleteSubtask,
    moveSubtask,
    addProject,
    deleteProject,
    exportJson,
    importJson,
    resetToSampleData,
    clearAllTasks,
    resetAllFilters,
    counts,
    overallStats,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error('useTasks phải được sử dụng bên trong TaskProvider');
  }
  return ctx;
}
