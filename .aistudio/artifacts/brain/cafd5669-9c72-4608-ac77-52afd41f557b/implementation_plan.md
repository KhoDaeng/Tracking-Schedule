# Kế Hoạch Xây Dựng Ứng Dụng Quản Lý Tiến Độ Công Việc

Ứng dụng quản lý công việc và theo dõi tiến độ theo phong cách Studio nền tối tập trung cao, kết hợp song song hai chế độ xem **Danh sách việc** và **Bảng Kanban tiến độ**, tự động tính phần trăm hoàn thành từ danh sách việc con (subtasks) và lưu trữ dữ liệu trực tiếp trên trình duyệt để sử dụng ngay lập tức.

---

## Quyết Định Đã Thống Nhất Với Người Dùng

> [!IMPORTANT]
> Toàn bộ 4 quyết định cốt lõi dưới đây đã được xác nhận trong bước làm rõ yêu cầu và là nền tảng thiết kế của ứng dụng:

- **Chế độ hiển thị chính**: Hỗ trợ đồng thời **Danh sách việc (List View)** và **Bảng Kanban tiến độ (Kanban Board)** dùng chung một nguồn dữ liệu thời gian thực, chuyển đổi tức thì ngay trên thanh công cụ.
- **Lưu trữ dữ liệu**: Lưu trực tiếp trên trình duyệt qua **localStorage** (không cần đăng nhập, mở lên dùng ngay, tự động khôi phục trạng thái sau khi tải lại trang), kèm tính năng xuất/nhập file JSON dự phòng.
- **Cơ chế tính tiến độ**: Tự động tính `%` tiến độ dựa trên số lượng **việc con (subtasks)** đã hoàn thành (`số việc con xong / tổng số việc con`), đồng thời tự đồng bộ trạng thái công việc khi đạt `0%` hoặc `100%`.
- **Phong cách giao diện**: **Studio nền tối tập trung cao** — nền đen slate sâu, đường viền mảnh độ tương phản vừa phải, chữ số dạng bảng (`tabular-nums`) cho mọi chỉ số `%` và hạn chót.

---

## 1. Tổng Quan & Giá Trị Cốt Lõi

- **Mục tiêu sản phẩm**: Giúp cá nhân lập kế hoạch, chia nhỏ đầu việc phức tạp thành các bước cụ thể (việc con) và quan sát ngay lập tức mức độ hoàn thành tổng thể lẫn từng hạng mục mà không bị phân tâm bởi giao diện rườm rà.
- **Đối tượng sử dụng**: Cá nhân làm việc chuyên sâu (lập trình viên, nhà thiết kế, quản lý dự án, sinh viên) cần một không gian gọn, phản hồi nhanh và rõ ràng về tiến độ thực tế.
- **Giá trị chính**:
  - **Nhìn là hiểu tiến độ**: Thanh tiến độ và phần trăm hoàn thành cập nhật tức thì mỗi khi đánh dấu hoàn thành một việc con.
  - **Linh hoạt góc nhìn**: Chuyển đổi mượt mà giữa *Danh sách chi tiết* (phù hợp rà soát nhanh, lọc, sắp xếp) và *Bảng Kanban* (phù hợp điều phối luồng công việc theo 3 cột: *Cần làm*, *Đang thực hiện*, *Hoàn thành*).
  - **An toàn dữ liệu cục bộ**: Toàn bộ dữ liệu được lưu tự động tại trình duyệt kèm tùy chọn khôi phục hoặc xuất sao lưu.

---

## 2. Trải Nghiệm Người Dùng & Thiết Kế Giao Diện

### Luồng Thao Tác Chính

1. **Khởi động tức thì**: Khi mở ứng dụng lần đầu, hệ thống hiển thị một bộ công việc mẫu thực tế bằng tiếng Việt (có thể xóa sạch bằng một nút bấm nếu muốn bắt đầu trắng) cùng thanh tổng quan tiến độ chung ngay phía trên.
2. **Tạo công việc mới**: Nhấn nút `+ Thêm công việc` ở góc trên bên phải (hoặc thêm nhanh ngay trong cột Kanban / đầu danh sách) để nhập tiêu đề, chọn dự án/nhóm, mức ưu tiên, hạn chót và thêm nhanh các việc con ban đầu.
3. **Theo dõi & cập nhật tiến độ**:
   - Ở **Danh sách việc**: Mở rộng trực tiếp các việc con ngay trên dòng hoặc bấm vào tên công việc để mở ngăn chi tiết trượt từ bên phải (*Detail Drawer*), tích chọn từng việc con để thấy thanh `%` tăng lên theo thời gian thực.
   - Ở **Bảng Kanban**: Kéo-thả thẻ công việc giữa 3 cột (*Cần làm*, *Đang thực hiện*, *Hoàn thành*) hoặc dùng nút chuyển trạng thái nhanh trên thẻ (hỗ trợ cả bàn phím và cảm ứng).
4. **Lọc, tìm kiếm & sắp xếp**: Lọc theo nhóm công việc ở thanh bên trái, lọc theo mức ưu tiên/trạng thái, tìm kiếm tức thì theo từ khóa và sắp xếp theo hạn chót hoặc `%` tiến độ.

### Ngôn Ngữ Thị Giác & Hệ Thống Màu Sắc (Dark Studio)

- **Phân bổ màu 60-30-10**:
  - **60% Nền chính**: Đen Slate sâu (`#0B0E14`) tạo chiều sâu tập trung và giảm mỏi mắt.
  - **30% Bề mặt cấu trúc**: Xám than mờ (`#121620`) cho thanh bên, bảng và thẻ công việc, phân tách bằng viền mảnh `1px` (`rgba(255, 255, 255, 0.08)`), tuyệt đối không lồng thẻ trong thẻ và không dùng dải màu dày bên trái thẻ.
  - **10% Điểm nhấn & Trạng thái ngữ nghĩa**:
    - Điểm nhấn tương tác chính: Xanh Cobalt dịu (`#3B82F6` / `#60A5FA`) cho nút hành động chính, tab đang chọn và thanh tiến độ đang chạy.
    - Ngữ nghĩa dữ liệu (luôn đi kèm nhãn chữ rõ ràng, không phân biệt chỉ bằng màu): Xanh lá (`#22C55E`) cho *Hoàn thành 100%*, Hổ phách (`#D97706`) cho *Sắp đến hạn*, Đỏ thẫm (`#EF4444`) cho *Quá hạn / Ưu tiên cao*.
- **Hệ thống Kiểu chữ (2+1 Font Rule)**:
  - **Tiêu đề & Thương hiệu**: `Plus Jakarta Sans` (SemiBold/Bold, giãn chữ nhẹ trong nền tối để tránh mảnh nét).
  - **Nội dung & Điều khiển**: `DM Sans` (dễ đọc ở cỡ 13px–15px).
  - **Số liệu, Phần trăm & Ngày tháng**: `JetBrains Mono` kết hợp `tabular-nums` để các cột số `40%`, `3/5 việc con`, hạn chót thẳng hàng tuyệt đối.
- **Kỷ luật giao diện tối giản**:
  - Mọi thông tin phụ (tên nhóm, số việc con, hạn chót, mức ưu tiên) trình bày bằng chữ gọn gàng phân tách bởi dấu `·`, không bọc khung viên thuốc (zero-pill) gây rối mắt.
  - Thanh đầu trang giữ đúng cấu trúc gọn: bên trái là đường dẫn ngữ cảnh (`Không gian làm việc / ...`), bên phải chỉ có nút hành động chính `+ Thêm công việc`.
  - Phản hồi tương tác dưới `200ms`, hiệu ứng chuyển mượt chỉ tác động lên `transform` và `opacity`.

---

## 3. Quyết Định Sản Phẩm & Đánh Đổi Kỹ Thuật

- **Quyết định 1: Quy tắc đồng bộ Tiến độ Việc con ↔ Trạng thái Kanban**
  - *Giải pháp chọn*: Khi công việc **có việc con**, phần trăm tiến độ luôn tính tự động (`Math.round(done / total * 100)`). Khi người dùng tích xong toàn bộ việc con (`100%`), công việc tự chuyển sang cột *Hoàn thành*; nếu bỏ tích một việc con, công việc tự quay về *Đang thực hiện*. Khi kéo thẻ trực tiếp sang *Hoàn thành* trên Kanban, hệ thống đánh dấu hoàn thành toàn bộ việc con (và giữ nguyên khả năng hoàn tác nếu kéo ngược lại). Với công việc **không có việc con**, tiến độ theo trạng thái (`Cần làm: 0%`, `Đang thực hiện: 50%` có thể kéo thanh trượt tùy chỉnh, `Hoàn thành: 100%`).
  - *Lý do*: Tránh mâu thuẫn dữ liệu giữa bảng Kanban và tỷ lệ `%` hoàn thành của việc con.
- **Quyết định 2: Quản lý trạng thái & Lưu trữ cục bộ (`localStorage`)**
  - *Giải pháp chọn*: Dùng React Context + Reducer thuần kết hợp lưu đồng bộ xuống `localStorage` theo phiên bản schema rõ ràng, kèm nút **Xuất dữ liệu (JSON)** và **Nhập dữ liệu (JSON)**.
  - *Lý do*: Phản hồi tức thì 0ms, không phụ thuộc mạng hay tài khoản, đồng thời vẫn cho phép người dùng sao lưu hoặc chuyển dữ liệu sang máy khác dễ dàng.
- **Quyết định 3: Kéo-thả Kanban kết hợp nút chuyển nhanh**
  - *Giải pháp chọn*: Hỗ trợ kéo-thả trực tiếp trên desktop bằng HTML5 Drag & Drop mượt mà, đồng thời tích hợp menu/nút chuyển cột nhanh ngay trong thẻ và trong ngăn chi tiết.
  - *Lý do*: Đảm bảo thao tác trơn tru trên cả chuột desktop, trackpad, thiết bị cảm ứng và bàn phím.

---

## 4. Kiến Trúc Hệ Thống & Dữ Liệu

### Sơ Đồ Kiến Trúc & Luồng Dữ Liệu

```text
┌───────────────────────────────────────────────────────────────────────────┐
│                         Bộ Lưu Trữ Trình Duyệt                            │
│              localStorage (Key theo schema + JSON Backup)                 │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │ Đọc / Ghi đồng bộ
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                       Trung Tâm Trạng Thái (Store)                        │
│   • Danh sách Công việc & Việc con    • Hàm tính % Tiến độ tự động        │
│   • Danh sách Nhóm / Dự án            • Bộ lọc, Tìm kiếm, Sắp xếp         │
└──────────────┬──────────────────────┬──────────────────────┬──────────────┘
               │                      │                      │
               ▼                      ▼                      ▼
┌──────────────────────────┐ ┌─────────────────┐ ┌──────────────────────────┐
│   Thanh Bên & Đầu Trang  │ │ Vùng Làm Việc   │ │ Ngăn Chi Tiết Công Việc  │
│                          │ │                 │ │ (Slide-over Drawer)      │
│ • Chọn nhóm / dự án      │ │ • Thanh chỉ số  │ │                          │
│ • Bộ lọc nhanh           │ │   tiến độ tổng  │ │ • Sửa tiêu đề, ghi chú   │
│   (Hôm nay, Quá hạn...)  │ │ • Đổi góc nhìn: │ │ • Quản lý danh sách      │
│ • Tạo nhóm mới           │ │   [Danh sách]   │ │   việc con (thêm, xóa,   │
│ • Xuất / Nhập JSON       │ │   [Kanban]      │ │   đảo thứ tự, tích chọn) │
└──────────────────────────┘ └────────┬────────┘ │ • Chọn ưu tiên, hạn chót │
                                      │          └──────────────────────────┘
                        ┌─────────────┴─────────────┐
                        ▼                           ▼
           ┌─────────────────────────┐ ┌─────────────────────────┐
           │   Chế Độ Danh Sách      │ │   Chế Độ Bảng Kanban    │
           │                         │ │                         │
           │ • Dòng gọn, dễ quét     │ │ • 3 cột trạng thái:     │
           │ • Mở rộng việc con      │ │   Cần làm / Đang làm /  │
           │   ngay tại chỗ          │ │   Hoàn thành            │
           │ • Thanh % & hạn chót    │ │ • Kéo-thả cập nhật      │
           └─────────────────────────┘ └─────────────────────────┘
```

### Mô Hình Dữ Liệu Cốt Lõi

- **Công việc (`Task`)**:
  - `id`, `title` (tiêu đề), `description` (mô tả chi tiết)
  - `status`: `'todo' | 'in_progress' | 'done'`
  - `priority`: `'low' | 'medium' | 'high'`
  - `projectId` (nhóm công việc), `dueDate` (hạn chót ISO date)
  - `manualProgress` (dùng khi chưa có việc con, mặc định theo trạng thái)
  - `subtasks`: mảng các `Subtask` (`id`, `title`, `completed`)
  - `createdAt`, `updatedAt`, `completedAt`
- **Nhóm / Dự án (`Project`)**:
  - `id`, `name`, `colorToken` (màu nhận diện tinh tế ở biểu tượng thư mục/chỉ mục)

### Ánh Xạ Tương Tác & Xử Lý Trạng Thái

- **Tạo / Sửa công việc (`TaskFormModal` & `TaskDetailDrawer`)**: Kiểm tra tiêu đề không rỗng, tự động cập nhật `updatedAt`, đồng bộ ngay lên cả Danh sách, Kanban và thanh thống kê tổng.
- **Thao tác việc con (`SubtaskChecklist`)**: Thêm việc con bằng phím `Enter`, tích chọn hoàn thành, sửa nội dung tại chỗ hoặc xóa; mỗi thay đổi tính lại `%` tiến độ và cập nhật trạng thái cột nếu đạt `100%` hoặc rời `100%`.
- **Trạng thái rỗng & Tìm kiếm không khớp**: Hiển thị hướng dẫn rõ ràng kèm nút tạo việc mới hoặc xóa bộ lọc hiện tại để tránh màn hình trống khó hiểu.
- **Bảo vệ thao tác xóa**: Xác nhận nhẹ trong giao diện (inline confirm hoặc toast hoàn tác — không dùng `window.alert`/`confirm`) khi xóa công việc hoặc xóa toàn bộ dữ liệu.
