import { Project, Task } from '../types/task';
import { addDaysToTodayIso } from '../utils/progress';

export const DEFAULT_PROJECTS: Project[] = [
  { id: 'proj_product', name: 'Thiết kế & Sản phẩm', color: '#3B82F6' },
  { id: 'proj_engineering', name: 'Phát triển hệ thống', color: '#22C55E' },
  { id: 'proj_operations', name: 'Vận hành tuần', color: '#D97706' },
  { id: 'proj_personal', name: 'Cá nhân & Học tập', color: '#94A3B8' },
];

export function createSeedTasks(): Task[] {
  const now = new Date().toISOString();
  const yesterday = addDaysToTodayIso(-1);
  const today = addDaysToTodayIso(0);
  const tomorrow = addDaysToTodayIso(1);
  const plus3Days = addDaysToTodayIso(3);
  const plus6Days = addDaysToTodayIso(6);

  return [
    {
      id: 'task_seed_1',
      title: 'Hoàn thiện giao diện trang tổng quan tiến độ Q4',
      description:
        'Rà soát lại độ tương phản nền tối, khoảng cách bảng dữ liệu và đồng bộ bộ lọc theo nhóm công việc.',
      status: 'in_progress',
      priority: 'high',
      projectId: 'proj_product',
      dueDate: today,
      manualProgress: 60,
      subtasks: [
        { id: 'sub_1_1', title: 'Chuẩn hóa bảng màu nền tối & viền mảnh 1px', completed: true },
        { id: 'sub_1_2', title: 'Thiết lập kiểu chữ số tabular-nums cho cột %', completed: true },
        { id: 'sub_1_3', title: 'Kiểm tra kéo-thả Kanban trên màn hình 1440px', completed: true },
        { id: 'sub_1_4', title: 'Rà soát hiển thị responsive trên thiết bị di động', completed: false },
      ],
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    },
    {
      id: 'task_seed_2',
      title: 'Tối ưu API đồng bộ dữ liệu báo cáo tuần',
      description:
        'Giảm thời gian phản hồi truy vấn tổng hợp và bổ sung kiểm tra dữ liệu đầu vào trước khi lưu.',
      status: 'in_progress',
      priority: 'high',
      projectId: 'proj_engineering',
      dueDate: yesterday,
      manualProgress: 40,
      subtasks: [
        { id: 'sub_2_1', title: 'Đo hiệu năng truy vấn hiện tại trên tập dữ liệu lớn', completed: true },
        { id: 'sub_2_2', title: 'Thêm bộ nhớ đệm cho các bộ lọc thường dùng', completed: false },
        { id: 'sub_2_3', title: 'Viết kiểm thử đơn vị cho hàm tính tiến độ', completed: false },
      ],
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    },
    {
      id: 'task_seed_3',
      title: 'Chuẩn bị tài liệu họp rà soát mục tiêu tháng',
      description:
        'Tổng hợp các hạng mục đã xong, các đầu việc đang chậm tiến độ và đề xuất phân bổ nguồn lực tuần tới.',
      status: 'todo',
      priority: 'medium',
      projectId: 'proj_operations',
      dueDate: tomorrow,
      manualProgress: 0,
      subtasks: [
        { id: 'sub_3_1', title: 'Xuất số liệu hoàn thành từ các nhóm dự án', completed: false },
        { id: 'sub_3_2', title: 'Liệt kê 3 điểm nghẽn chính cần xử lý', completed: false },
        { id: 'sub_3_3', title: 'Gửi lịch mời họp trước 17:00', completed: false },
      ],
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    },
    {
      id: 'task_seed_4',
      title: 'Nghiên cứu mô hình kiến trúc State Machine cho luồng phê duyệt',
      description:
        'Ghi chú các trạng thái chuyển tiếp hợp lệ và cách xử lý hoàn tác khi người dùng đổi trạng thái.',
      status: 'in_progress',
      priority: 'medium',
      projectId: 'proj_engineering',
      dueDate: plus3Days,
      manualProgress: 50,
      subtasks: [
        { id: 'sub_4_1', title: 'Vẽ sơ đồ các trạng thái chuyển tiếp cốt lõi', completed: true },
        { id: 'sub_4_2', title: 'Thử nghiệm hàm reducer thuần không phát sinh lỗi', completed: false },
      ],
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    },
    {
      id: 'task_seed_5',
      title: 'Hoàn thành bài đọc hệ thống thiết kế Typography nâng cao',
      description:
        'Tóm tắt nguyên tắc phân cấp tiêu đề và bù quang học khi hiển thị chữ sáng trên nền tối.',
      status: 'todo',
      priority: 'low',
      projectId: 'proj_personal',
      dueDate: plus6Days,
      manualProgress: 0,
      subtasks: [],
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    },
    {
      id: 'task_seed_6',
      title: 'Thiết lập quy trình sao lưu dữ liệu cục bộ JSON',
      description:
        'Đảm bảo người dùng có thể xuất file dự phòng và nhập lại toàn bộ công việc không mất việc con.',
      status: 'done',
      priority: 'medium',
      projectId: 'proj_engineering',
      dueDate: today,
      manualProgress: 100,
      subtasks: [
        { id: 'sub_6_1', title: 'Định nghĩa cấu trúc JSON theo phiên bản schema', completed: true },
        { id: 'sub_6_2', title: 'Kiểm tra khôi phục đầy đủ danh sách việc con', completed: true },
      ],
      createdAt: now,
      updatedAt: now,
      completedAt: now,
    },
  ];
}
