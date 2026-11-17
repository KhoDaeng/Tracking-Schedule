import { Menu, Plus } from 'lucide-react';
import { useTasks } from '../store/TaskContext';
import { SmartFilter } from '../types/task';

const FILTER_TITLES: Record<SmartFilter, string> = {
  all: 'Tất cả công việc',
  today: 'Hạn hôm nay',
  in_progress: 'Đang thực hiện',
  overdue: 'Quá hạn',
  done: 'Đã hoàn thành',
};

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const { smartFilter, selectedProjectId, projects, openCreateModal } = useTasks();

  const currentProject =
    selectedProjectId === 'all'
      ? null
      : projects.find((p) => p.id === selectedProjectId) ?? null;

  return (
    <header className="h-14 px-4 sm:px-6 border-b border-white/[0.08] bg-[#0B0E14] flex items-center justify-between gap-4 shrink-0">
      {/* Left: Mobile drawer button + Contextual Breadcrumb Trail */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Mở menu điều hướng"
          className="lg:hidden p-2 -ml-2 text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav
          aria-label="Đường dẫn hiện tại"
          className="flex items-center gap-2 text-sm min-w-0"
        >
          <span className="text-slate-400 whitespace-nowrap hidden sm:inline">
            Không gian làm việc
          </span>
          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">
            /
          </span>
          {currentProject && (
            <>
              <span className="text-slate-300 truncate max-w-[140px] sm:max-w-[200px]">
                {currentProject.name}
              </span>
              <span className="text-slate-600" aria-hidden="true">
                /
              </span>
            </>
          )}
          <h1 className="font-display font-semibold text-slate-100 truncate">
            {FILTER_TITLES[smartFilter]}
          </h1>
        </nav>
      </div>

      {/* Right: Single Primary Action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={() => openCreateModal('todo')}
          className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E14]"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Thêm công việc</span>
        </button>
      </div>
    </header>
  );
}
