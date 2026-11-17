import { Project, Task } from '../types/task';

export const DEFAULT_PROJECTS: Project[] = [
  { id: 'proj_product', name: 'Thiết kế & Sản phẩm', color: '#3B82F6' },
  { id: 'proj_engineering', name: 'Phát triển hệ thống', color: '#22C55E' },
  { id: 'proj_operations', name: 'Vận hành tuần', color: '#D97706' },
  { id: 'proj_personal', name: 'Cá nhân & Học tập', color: '#94A3B8' },
];

export function createSeedTasks(): Task[] {
  return [];
}
