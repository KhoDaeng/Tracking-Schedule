import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
} from 'lucide-react';
import { useTasks } from '../store/TaskContext';
import { Task, TaskStatus } from '../types/task';
import {
  calculateTaskProgress,
  getDeadlineDisplay,
  getSubtaskStats,
  PRIORITY_SHORT_LABELS,
  STATUS_LABELS,
} from '../utils/progress';

const KANBAN_COLUMNS: Array<{
  status: TaskStatus;
  title: string;
  description: string;
}> = [
  {
    status: 'todo',
    title: 'Cần làm',
    description: 'Các đầu việc đang chờ triển khai',
  },
  {
    status: 'in_progress',
    title: 'Đang thực hiện',
    description: 'Đang xử lý và cập nhật việc con',
  },
  {
    status: 'done',
    title: 'Hoàn thành',
    description: 'Đã đạt 100% tiến độ',
  },
];

export function KanbanView() {
  const {
    filteredTasks,
    tasks,
    projects,
    moveTaskStatus,
    toggleSubtask,
    setActiveTaskId,
    openCreateModal,
    resetAllFilters,
  } = useTasks();

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      moveTaskStatus(taskId, targetStatus);
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const renderColumnIcon = (status: TaskStatus) => {
    if (status === 'done') return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    if (status === 'in_progress') return <Clock className="w-4 h-4 text-blue-400 shrink-0" />;
    return <Circle className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  if (filteredTasks.length === 0 && tasks.length > 0) {
    return (
      <div className="bg-[#121620] border border-white/[0.08] rounded-lg p-10 text-center space-y-4">
        <div className="max-w-md mx-auto space-y-2">
          <h2 className="font-display text-base font-semibold text-slate-100">
            Không có thẻ công việc nào khớp bộ lọc
          </h2>
          <p className="text-sm text-slate-400">
            Đặt lại bộ lọc để hiển thị lại toàn bộ các cột trên bảng Kanban.
          </p>
        </div>
        <button
          type="button"
          onClick={resetAllFilters}
          className="px-4 py-2 min-h-[40px] text-sm font-medium text-slate-200 bg-[#0B0E14] hover:bg-white/[0.06] border border-white/[0.08] rounded-md transition-colors whitespace-nowrap"
        >
          Đặt lại bộ lọc
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      {KANBAN_COLUMNS.map((col) => {
        const colTasks = filteredTasks.filter((t) => t.status === col.status);
        const isDropTarget = dragOverColumn === col.status;

        return (
          <section
            key={col.status}
            aria-label={`Cột ${col.title}`}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={() => {
              if (dragOverColumn === col.status) setDragOverColumn(null);
            }}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`flex flex-col rounded-lg border transition-colors duration-150 min-h-[420px] ${
              isDropTarget
                ? 'bg-[#151C2C] border-blue-500/60'
                : 'bg-[#0F131C] border-white/[0.08]'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 min-w-0">
                {renderColumnIcon(col.status)}
                <h2 className="font-display text-sm font-semibold text-slate-100 truncate">
                  {col.title}
                </h2>
                <span className="font-mono tabular-nums text-xs text-slate-400">
                  {colTasks.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => openCreateModal(col.status)}
                aria-label={`Thêm công việc vào cột ${col.title}`}
                title={`Thêm vào ${col.title}`}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Column Cards */}
            <div className="p-3 space-y-3 flex-1">
              {colTasks.length === 0 ? (
                <div className="py-10 px-4 text-center border border-dashed border-white/[0.08] rounded-md">
                  <p className="text-xs text-slate-500">{col.description}</p>
                  <button
                    type="button"
                    onClick={() => openCreateModal(col.status)}
                    className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm vào cột này</span>
                  </button>
                </div>
              ) : (
                colTasks.map((task: Task) => {
                  const progress = calculateTaskProgress(task);
                  const { completed, total, hasSubtasks } = getSubtaskStats(task);
                  const deadline = getDeadlineDisplay(task.dueDate, task.status);
                  const project = projectMap[task.projectId];
                  const isDragging = draggedTaskId === task.id;

                  const priorityColorClass =
                    task.priority === 'high'
                      ? 'text-red-400'
                      : task.priority === 'medium'
                      ? 'text-amber-400'
                      : 'text-slate-400';

                  const deadlineColorClass =
                    deadline.tone === 'overdue'
                      ? 'text-red-400'
                      : deadline.tone === 'soon'
                      ? 'text-amber-400'
                      : deadline.tone === 'done'
                      ? 'text-slate-500'
                      : 'text-slate-400';

                  return (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      className={`bg-[#121620] border border-white/[0.08] hover:border-white/[0.18] rounded-md p-3.5 space-y-3 cursor-grab active:cursor-grabbing transition-all duration-150 ${
                        isDragging ? 'opacity-45 scale-[0.98]' : 'opacity-100'
                      }`}
                    >
                      {/* Top Metadata Kicker (Zero-Pill) + Accessible Quick Move */}
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0 text-slate-400">
                          {project && (
                            <span className="inline-flex items-center gap-1.5 text-slate-300 truncate max-w-[130px]">
                              <span
                                className="w-2 h-2 rounded-[2px] shrink-0"
                                style={{ backgroundColor: project.color }}
                                aria-hidden="true"
                              />
                              <span className="truncate">{project.name}</span>
                            </span>
                          )}
                          {project && <span aria-hidden="true">·</span>}
                          <span className={`whitespace-nowrap ${priorityColorClass}`}>
                            {PRIORITY_SHORT_LABELS[task.priority]}
                          </span>
                        </div>

                        <select
                          value={task.status}
                          onChange={(e) =>
                            moveTaskStatus(task.id, e.target.value as TaskStatus)
                          }
                          aria-label={`Chuyển cột cho ${task.title}`}
                          className="h-6 px-1.5 text-[11px] bg-[#0B0E14] border border-white/[0.08] rounded text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer shrink-0"
                        >
                          <option value="todo">{STATUS_LABELS.todo}</option>
                          <option value="in_progress">{STATUS_LABELS.in_progress}</option>
                          <option value="done">{STATUS_LABELS.done}</option>
                        </select>
                      </div>

                      {/* Card Title */}
                      <button
                        type="button"
                        onClick={() => setActiveTaskId(task.id)}
                        className={`block w-full text-left font-display text-sm font-semibold leading-snug hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:underline ${
                          task.status === 'done'
                            ? 'text-slate-400 line-through'
                            : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </button>

                      {/* Inline Subtask Checklist Preview (Up to 3 items) */}
                      {hasSubtasks && (
                        <div className="space-y-1 pt-0.5">
                          {task.subtasks.slice(0, 3).map((sub) => (
                            <label
                              key={sub.id}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-start gap-2 py-0.5 cursor-pointer group/ksub"
                            >
                              <input
                                type="checkbox"
                                checked={sub.completed}
                                onChange={() => toggleSubtask(task.id, sub.id)}
                                className="sr-only"
                              />
                              <span
                                aria-hidden="true"
                                className={`mt-0.5 w-3.5 h-3.5 rounded-[3px] flex items-center justify-center border transition-colors shrink-0 ${
                                  sub.completed
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                    : 'bg-[#0B0E14] border-white/[0.2] group-hover/ksub:border-blue-400'
                                }`}
                              >
                                {sub.completed && <Check className="w-2.5 h-2.5 stroke-[2.5]" />}
                              </span>
                              <span
                                className={`text-xs leading-snug line-clamp-1 ${
                                  sub.completed
                                    ? 'text-slate-500 line-through'
                                    : 'text-slate-300'
                                }`}
                              >
                                {sub.title}
                              </span>
                            </label>
                          ))}
                          {task.subtasks.length > 3 && (
                            <button
                              type="button"
                              onClick={() => setActiveTaskId(task.id)}
                              className="text-xs text-slate-400 hover:text-blue-400 pl-5"
                            >
                              + {task.subtasks.length - 3} việc con khác
                            </button>
                          )}
                        </div>
                      )}

                      {/* Progress Bar & Subtask Ratio */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono tabular-nums text-slate-400">
                            {hasSubtasks ? `${completed}/${total} việc con` : 'Tiến độ'}
                          </span>
                          <span
                            className={`font-mono tabular-nums font-medium ${
                              progress === 100 ? 'text-emerald-400' : 'text-slate-200'
                            }`}
                          >
                            {progress}%
                          </span>
                        </div>
                        <div
                          className="w-full h-1.5 bg-[#0B0E14] rounded-sm overflow-hidden border border-white/[0.06]"
                          role="progressbar"
                          aria-valuenow={progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className={`h-full transition-[width] duration-200 ${
                              progress === 100
                                ? 'bg-emerald-500'
                                : progress > 0
                                ? 'bg-blue-500'
                                : 'bg-slate-700'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Card Footer: Deadline */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                        <span className={`inline-flex items-center gap-1.5 font-mono tabular-nums ${deadlineColorClass}`}>
                          {deadline.tone === 'overdue' ? (
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span>{deadline.label}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => setActiveTaskId(task.id)}
                          className="text-slate-400 hover:text-slate-100 transition-colors whitespace-nowrap"
                        >
                          Chi tiết
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
