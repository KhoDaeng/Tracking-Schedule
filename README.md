# Tiến Độ Studio

Ứng dụng quản lý công việc giao diện nền tối: xem theo **Danh sách** hoặc **Bảng Kanban**, tự động tính phần trăm hoàn thành từ việc con, lọc/tìm kiếm/sắp xếp, và lưu dữ liệu ngay trên trình duyệt.

## Dùng ngay — không cần cài đặt

1. Tải **`Tiendo-Studio.html`** (hoặc `Tiendo-Studio.zip` rồi giải nén).
2. Bấm đúp file `.html` để mở bằng Chrome / Edge / Opera.
3. Dùng luôn — **không cần Node.js, không cần server, không cần đăng nhập, dùng được offline**.

Dữ liệu tự động lưu trên trình duyệt của bạn (localStorage) sau mỗi thao tác. Đóng tab hay khởi động lại máy không mất dữ liệu.

### Sao lưu / chuyển dữ liệu

Trên thanh bên: **Xuất JSON** → tải file backup; **Nhập JSON** → khôi phục trên máy khác.

> Lưu ý: bản file HTML (`file://`) và bản chạy `http://localhost:3000` là **hai kho dữ liệu riêng**. Dùng Xuất/Nhập JSON để chuyển giữa chúng. Nếu xóa site data của trình duyệt, dữ liệu cũng bị xóa.

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
| `npm run build:single` | Build rồi gộp toàn bộ JS/CSS thành `Tiendo-Studio.html` |
| `npm run preview` | Xem thử bản đã build |
| `npm run lint` | Kiểm tra TypeScript |

## Đóng gói lại file dùng ngay

Sau khi sửa mã nguồn:

```bash
npm run build:single
```

Lệnh này chạy Vite build, sau đó `scripts/build-single-file.mjs` nhét toàn bộ JavaScript và CSS vào `index.html`, tạo ra một file duy nhất có thể gửi cho người khác.

## Cấu trúc chính

```text
src/
  main.tsx              Điểm vào React
  App.tsx               Bố cục tổng của ứng dụng
  store/TaskContext.tsx Toàn bộ state, thao tác dữ liệu, localStorage, xuất/nhập JSON
  components/           Sidebar, Header, ListView, KanbanView, modal, drawer, toast...
  data/seedData.ts      Dữ liệu mẫu ban đầu
  types/task.ts         Kiểu dữ liệu TypeScript
  utils/progress.ts     Hàm tính tiến độ, ngày hạn, ID...
scripts/
  build-single-file.mjs Tạo bản đóng gói một file
Tiendo-Studio.html      Bản dùng ngay (kết quả build)
Tiendo-Studio.zip       Bản nén để gửi qua email
```

Công nghệ: React 19, TypeScript, Vite 8, Tailwind CSS 4, lucide-react.
