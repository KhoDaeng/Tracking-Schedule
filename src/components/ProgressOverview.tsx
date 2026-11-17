import { AlertTriangle } from 'lucide-react';
import { useTasks } from '../store/TaskContext';

export function ProgressOverview() {
  const { overallStats, setSmartFilter, smartFilter } = useTasks();

  const isComplete =
    overallStats.totalTasks > 0 && overallStats.avgProgress === 100;

  return (
    <section
      aria-label="Tổng quan tiến độ"
      className="bg-[#121620] border border-white/[0.08] rounded-lg grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]"
    >
      {/* Metric 1: Overall Progress */}
      <div className="p-4 sm:px-5 sm:py-4 flex flex-col justify-between gap-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-medium text-slate-400">
            Tiến độ trung bình
          </span>
          <span
            className={`font-mono tabular-nums text-xl font-semibold ${
              isComplete ? 'text-emerald-400' : 'text-slate-100'
            }`}
          >
            {overallStats.avgProgress}%
          </span>
        </div>
        <div
          className="w-full h-2 bg-[#0B0E14] rounded-sm overflow-hidden border border-white/[0.06]"
          role="progressbar"
          aria-valuenow={overallStats.avgProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Tiến độ trung bình toàn bộ công việc"
        >
          <div
            className={`h-full transition-[width] duration-300 ease-out ${
              isComplete ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
            style={{ width: `${overallStats.avgProgress}%` }}
          />
        </div>
      </div>

      {/* Metric 2: Tasks Completion */}
      <div className="p-4 sm:px-5 sm:py-4 flex flex-col justify-between gap-1">
        <span className="text-xs font-medium text-slate-400">
          Công việc hoàn thành
        </span>
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono tabular-nums text-xl font-semibold text-slate-100">
            {overallStats.doneTasks}/{overallStats.totalTasks}
          </span>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {overallStats.activeTasks} việc đang mở
          </span>
        </div>
      </div>

      {/* Metric 3: Subtasks Progress */}
      <div className="p-4 sm:px-5 sm:py-4 flex flex-col justify-between gap-1 sm:border-t xl:border-t-0 border-white/[0.08]">
        <span className="text-xs font-medium text-slate-400">
          Việc con đã xong
        </span>
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono tabular-nums text-xl font-semibold text-slate-100">
            {overallStats.completedSubtasks}/{overallStats.totalSubtasks}
          </span>
          <span className="text-xs text-slate-400">
            Tự động tính %
          </span>
        </div>
      </div>

      {/* Metric 4: Overdue Focus */}
      <div className="p-4 sm:px-5 sm:py-4 flex flex-col justify-between gap-1 sm:border-t xl:border-t-0 border-white/[0.08]">
        <span className="text-xs font-medium text-slate-400">
          Công việc quá hạn
        </span>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono tabular-nums text-xl font-semibold ${
                overallStats.overdueTasks > 0 ? 'text-red-400' : 'text-slate-100'
              }`}
            >
              {overallStats.overdueTasks}
            </span>
            {overallStats.overdueTasks > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Cần xử lý</span>
              </span>
            ) : (
              <span className="text-xs text-emerald-400">Đúng tiến độ</span>
            )}
          </div>

          {overallStats.overdueTasks > 0 && smartFilter !== 'overdue' && (
            <button
              type="button"
              onClick={() => setSmartFilter('overdue')}
              className="text-xs font-medium text-red-300 hover:text-red-200 underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Xem ngay
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
