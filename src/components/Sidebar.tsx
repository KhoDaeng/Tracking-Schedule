import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Download,
  FolderPlus,
  Inbox,
  PlayCircle,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useTasks } from '../store/TaskContext';
import { SmartFilter } from '../types/task';

const PROJECT_COLORS = [
  '#3B82F6',
  '#22C55E',
  '#D97706',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
  '#94A3B8',
];

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const {
    projects,
    smartFilter,
    setSmartFilter,
    selectedProjectId,
    setSelectedProjectId,
    counts,
    addProject,
    deleteProject,
    exportJson,
    importJson,
    resetToSampleData,
    clearAllTasks,
    showToast,
  } = useTasks();

  const [addingProject, setAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0]);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const quickFilters: Array<{
    id: SmartFilter;
    label: string;
    count: number;
    icon: React.ReactNode;
    alert?: boolean;
  }> = [
    {
      id: 'all',
      label: 'Tất cả công việc',
      count: counts.all,
      icon: <Inbox className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'today',
      label: 'Hạn hôm nay',
      count: counts.today,
      icon: <CalendarClock className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'in_progress',
      label: 'Đang thực hiện',
      count: counts.inProgress,
      icon: <PlayCircle className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'overdue',
      label: 'Quá hạn',
      count: counts.overdue,
      icon: <AlertTriangle className="w-4 h-4 shrink-0" />,
      alert: counts.overdue > 0,
    },
    {
      id: 'done',
      label: 'Đã hoàn thành',
      count: counts.done,
      icon: <CheckCircle2 className="w-4 h-4 shrink-0" />,
    },
  ];

  const handleSelectFilter = (filterId: SmartFilter) => {
    setSmartFilter(filterId);
    onCloseMobile();
  };

  const handleSelectProject = (projectId: string | 'all') => {
    setSelectedProjectId(projectId);
    onCloseMobile();
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newProjectName.trim();
    if (!trimmed) return;
    const created = addProject(trimmed, newProjectColor);
    setSelectedProjectId(created.id);
    setNewProjectName('');
    setAddingProject(false);
    showToast({ message: `Đã tạo nhóm "${created.name}"`, tone: 'success' });
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const res = importJson(text);
      if (!res.ok) {
        showToast({ message: res.error || 'Không thể nhập dữ liệu', tone: 'error' });
      }
    } catch {
      showToast({ message: 'Không thể đọc tệp đã chọn', tone: 'error' });
    } finally {
      e.target.value = '';
    }
  };

  const sidebarContent = (
    <aside className="flex flex-col h-full w-64 bg-[#121620] border-r border-white/[0.08] select-none">
      {/* Brand Zone */}
      <div className="flex items-center justify-between h-14 px-5 border-b border-white/[0.08] shrink-0">
        <span className="font-display text-base font-bold tracking-tight text-slate-100 whitespace-nowrap">
          Tiến Độ Studio
        </span>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Đóng thanh điều hướng"
          className="lg:hidden p-2 -mr-2 text-slate-400 hover:text-slate-100 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-7">
        {/* Smart Filters */}
        <div>
          <p className="px-2.5 mb-2 text-xs font-medium text-slate-400">
            Bộ lọc tiến độ
          </p>
          <nav className="space-y-0.5" aria-label="Bộ lọc tiến độ">
            {quickFilters.map((item) => {
              const active = smartFilter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectFilter(item.id)}
                  className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 min-h-[40px] rounded-md text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    active
                      ? 'bg-[#1A2130] text-slate-100 font-medium'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={
                        item.alert
                          ? 'text-red-400'
                          : active
                          ? 'text-blue-400'
                          : 'text-slate-500'
                      }
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span
                    className={`font-mono tabular-nums text-xs shrink-0 ${
                      item.alert
                        ? 'text-red-400 font-semibold'
                        : active
                        ? 'text-slate-200'
                        : 'text-slate-500'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Projects / Nhóm công việc */}
        <div>
          <div className="flex items-center justify-between px-2.5 mb-2">
            <p className="text-xs font-medium text-slate-400">Nhóm công việc</p>
            <button
              type="button"
              onClick={() => setAddingProject((v) => !v)}
              aria-label="Thêm nhóm công việc mới"
              title="Thêm nhóm mới"
              className="p-1 text-slate-400 hover:text-slate-100 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {addingProject && (
            <form
              onSubmit={handleCreateProject}
              className="mb-3 p-2.5 rounded-md bg-[#0B0E14] border border-white/[0.08] space-y-2.5"
            >
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Tên nhóm mới..."
                autoFocus
                className="w-full px-2.5 py-1.5 text-sm bg-[#121620] border border-white/[0.1] rounded text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewProjectColor(color)}
                      aria-label={`Chọn màu ${color}`}
                      className={`w-4 h-4 rounded-sm transition-transform ${
                        newProjectColor === color
                          ? 'ring-2 ring-white ring-offset-1 ring-offset-[#0B0E14] scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAddingProject(false);
                      setNewProjectName('');
                    }}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200 rounded"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded whitespace-nowrap"
                  >
                    Tạo
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => handleSelectProject('all')}
              className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 min-h-[40px] rounded-md text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                selectedProjectId === 'all'
                  ? 'bg-[#1A2130] text-slate-100 font-medium'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`}
            >
              <span className="truncate">Tất cả các nhóm</span>
              <span className="font-mono tabular-nums text-xs text-slate-500 shrink-0">
                {counts.all}
              </span>
            </button>

            {projects.map((proj) => {
              const active = selectedProjectId === proj.id;
              return (
                <div key={proj.id} className="group flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSelectProject(proj.id)}
                    className={`flex-1 min-w-0 flex items-center justify-between gap-2 px-2.5 py-2 min-h-[40px] rounded-md text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      active
                        ? 'bg-[#1A2130] text-slate-100 font-medium'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-[2px] shrink-0"
                        style={{ backgroundColor: proj.color }}
                        aria-hidden="true"
                      />
                      <span className="truncate">{proj.name}</span>
                    </span>
                    <span className="font-mono tabular-nums text-xs text-slate-500 shrink-0">
                      {counts.byProject[proj.id] || 0}
                    </span>
                  </button>
                  {projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteProject(proj.id)}
                      aria-label={`Xóa nhóm ${proj.name}`}
                      title={`Xóa nhóm ${proj.name}`}
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 text-slate-500 hover:text-red-400 rounded transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Local Data Backup & Maintenance */}
      <div className="p-3 border-t border-white/[0.08] space-y-1 shrink-0">
        <p className="px-2.5 pb-1 text-xs text-slate-500">
          Dữ liệu lưu trên trình duyệt
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={exportJson}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 min-h-[36px] text-xs font-medium text-slate-300 bg-[#0B0E14] hover:bg-white/[0.06] border border-white/[0.08] rounded-md transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Xuất JSON</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 px-2.5 py-2 min-h-[36px] text-xs font-medium text-slate-300 bg-[#0B0E14] hover:bg-white/[0.06] border border-white/[0.08] rounded-md transition-colors whitespace-nowrap"
          >
            <Upload className="w-3.5 h-3.5 shrink-0" />
            <span>Nhập JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>

        <div className="flex items-center justify-between pt-1 gap-1">
          <button
            type="button"
            onClick={resetToSampleData}
            className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3 h-3 shrink-0" />
            <span>Dữ liệu mẫu</span>
          </button>

          {!confirmClearAll ? (
            <button
              type="button"
              onClick={() => setConfirmClearAll(true)}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-slate-400 hover:text-red-400 rounded transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-3 h-3 shrink-0" />
              <span>Xóa hết</span>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  clearAllTasks();
                  setConfirmClearAll(false);
                }}
                className="px-2 py-1 text-xs font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded whitespace-nowrap"
              >
                Xác nhận xóa
              </button>
              <button
                type="button"
                onClick={() => setConfirmClearAll(false)}
                className="px-1.5 py-1 text-xs text-slate-400 hover:text-slate-200 rounded"
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <div className="hidden lg:block shrink-0">{sidebarContent}</div>

      {/* Mobile slide-over sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
