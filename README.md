# Tracking Schedule

Ứng dụng quản lý công việc giao diện nền tối: xem theo **Danh sách** hoặc **Bảng Kanban**, tự động tính phần trăm hoàn thành từ việc con, lọc/tìm kiếm/sắp xếp, và lưu dữ liệu ngay trên trình duyệt.

**Repo:** https://github.com/KhoDaeng/Tracking-Schedule  
**Tải bản mới nhất:** https://github.com/KhoDaeng/Tracking-Schedule/releases/latest

## Dùng ngay — không cần cài đặt

1. Tải **`release/Tracking-Schedule.html`** (hoặc `release/Tracking-Schedule.zip` rồi giải nén).
2. Bấm đúp file `.html` để mở bằng Chrome / Edge / Opera.
3. Dùng luôn — **không cần Node.js, không cần server, không cần đăng nhập, dùng được offline**.

App mở ra ở trạng thái **trống: chưa có công việc nào**. Bốn nhóm mặc định (Thiết kế & Sản phẩm, Phát triển hệ thống, Vận hành tuần, Cá nhân & Học tập) đã có sẵn để bạn chọn; bạn tự tạo công việc đầu tiên bằng nút **Thêm công việc**.

Dữ liệu tự động lưu trên trình duyệt của bạn (localStorage, key `tracking_schedule_workspace_v1`) sau mỗi thao tác. Đóng tab hay khởi động lại máy không mất dữ liệu.

> Từ `v1.0.2`, key lưu trữ đổi từ `tiendo_studio_workspace_v1` sang `tracking_schedule_workspace_v1`. Dữ liệu của các bản trước không tự động hiện. Nếu cần giữ lại, mở bản cũ → **Xuất JSON**, rồi mở bản mới → **Nhập JSON**.
>
> Bản file HTML (`file://`) và bản chạy `http://localhost:3000` là **hai kho dữ liệu riêng**. Dùng Xuất/Nhập JSON để chuyển giữa chúng.

### Sao lưu / chuyển dữ liệu

Trên thanh bên: **Xuất JSON** → tải file backup `tracking-schedule-backup-YYYY-MM-DD.json`; **Nhập JSON** → khôi phục trên máy khác. Khi nhập, các trường bị thiếu sẽ được điền giá trị an toàn, mục trùng lặp/không hợp lệ sẽ được bỏ qua và ứng dụng sẽ báo số lượng đã nhập.

Nếu xóa site data của trình duyệt, dữ liệu cũng bị xóa. Nếu trình duyệt từ chối lưu (hết dung lượng, chế độ riêng tư…), góc phải sẽ hiện thông báo lỗi — lúc đó hãy bấm **Xuất JSON** ngay để sao lưu.

## Phát triển từ mã nguồn

Yêu cầu: **Node.js 22+** (khuyến nghị bản LTS) và npm.

```bash
npm install
npm run dev        # http://localhost:3000
```

| Lệnh | Mục đích |
| --- | --- |
| `npm run dev` | Chạy server phát triển, có hot-reload |
| `npm run build` | Build bản production vào `dist/` |
| `npm run build:single` | Build rồi gộp toàn bộ JS/CSS thành `release/Tracking-Schedule.html` |
| `npm run preview` | Xem thử bản đã build |
| `npm run lint` | Kiểm tra TypeScript |

## Đóng gói lại file dùng ngay

Sau khi sửa mã nguồn:

```bash
npm run build:single
```

Lệnh này chạy Vite build, sau đó `scripts/build-single-file.mjs` nhét toàn bộ JavaScript và CSS vào `index.html`, tạo ra một file duy nhất trong `release/` có thể gửi cho người khác. Nén file đó lại nếu cần gửi qua email.

## Cấu trúc chính

```text
src/
  main.tsx              Điểm vào React
  App.tsx               Bố cục tổng của ứng dụng
  store/TaskContext.tsx Toàn bộ state, thao tác dữ liệu, localStorage, xuất/nhập JSON
  components/           Sidebar, Header, ListView, KanbanView, modal, drawer, toast...
  data/seedData.ts      Nhóm mặc định; danh sách công việc khởi tạo để trống
  types/task.ts         Kiểu dữ liệu TypeScript
  utils/progress.ts     Hàm tính tiến độ, ngày hạn, ID...
scripts/
  build-single-file.mjs Tạo bản đóng gói một file
release/
  Tracking-Schedule.html  Bản dùng ngay (kết quả build)
  Tracking-Schedule.zip   Bản nén để gửi qua email
implementation_plan.md  Bản thiết kế gốc
```

Công nghệ: React 19, TypeScript, Vite 8, Tailwind CSS 4, lucide-react.
