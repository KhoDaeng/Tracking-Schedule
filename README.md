<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/cafd5669-9c72-4608-ac77-52afd41f557b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Bản đóng gói dùng ngay (không cần cài đặt)

File `Tiendo-Studio.html` (hoặc `Tiendo-Studio.zip`) là bản đã build xong: chỉ cần tải về, bấm đúp để mở trong trình duyệt là dùng được ngay, không cần Node.js hay server.

Dữ liệu được lưu tự động trên trình duyệt của người dùng (localStorage). Dùng **Xuất JSON / Nhập JSON** trong Sidebar để sao lưu hoặc chuyển dữ liệu.

Để tạo lại bản đóng gói sau khi sửa mã nguồn:

```bash
npm install
npm run build:single
```
