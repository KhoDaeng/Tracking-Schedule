import { Columns3, List, Search, X } from 'lucide-react';
import { useTasks } from '../store/TaskContext';
import { PriorityFilter, SortOption } from '../types/task';

export function Toolbar() {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    sortOption,
    setSortOption,
    filteredTasks,
  } = useTasks();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      {/* Left: Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 min-w-0">
        {/* Live Search */}
        <div className="relative flex-1 max-w-md min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm công việc hoặc việc con..."
            aria-label="Tìm kiếm công việc"
            className="w-full h-10 pl-9 pr-8 text-sm bg-[#121620] border border-white/[0.08] rounded-md text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-100 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Priority & Sort Selectors */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
            aria-label="Lọc theo mức độ ưu tiên"
            className="h-10 px-3 text-sm bg-[#121620] border border-white/[0.08] rounded-md text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Mọi mức ưu tiên</option>
            <option value="high">Ưu tiên cao</option>
            <option value="medium">Ưu tiên trung bình</option>
            <option value="low">Ưu tiên thấp</option>
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            aria-label="Sắp xếp công việc"
            className="h-10 px-3 text-sm bg-[#121620] border border-white/[0.08] rounded-md text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="updated_desc">Mới cập nhật</option>
            <option value="due_asc">Hạn chót gần nhất</option>
            <option value="progress_desc">Tiến độ % cao nhất</option>
            <option value="priority_desc">Ưu tiên cao nhất</option>
          </select>
        </div>
      </div>

      {/* Right: Result Count + Segmented View Mode Switcher */}
      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
        <span className="text-xs text-slate-400 font-mono tabular-nums whitespace-nowrap">
          {filteredTasks.length} công việc
        </span>

        <div
          role="tablist"
          aria-label="Chế độ hiển thị"
          className="inline-flex items-center p-1 bg-[#121620] border border-white/[0.08] rounded-md"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'list'}
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[32px] text-xs font-medium rounded transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              viewMode === 'list'
                ? 'bg-[#1E2638] text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5 shrink-0" />
            <span>Danh sách</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'kanban'}
            onClick={() => setViewMode('kanban')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[32px] text-xs font-medium rounded transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              viewMode === 'kanban'
                ? 'bg-[#1E2638] text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5 shrink-0" />
            <span>Bảng Kanban</span>
          </button>
        </div>
      </div>
    </div>
  );
}
