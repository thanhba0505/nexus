# 📊 GitHub Report

Ứng dụng macOS tự động tổng hợp GitHub Pull Request & báo cáo Daily Standup / Parabol bằng **Local AI (Zero-Token Cost)** trong hệ sinh thái **Nexus**.

---

## 📖 Tài Liệu Chi Tiết

Xem đầy đủ kiến trúc, cơ chế Unified Titlebar, lưu trữ `tauri-plugin-store` & macOS Keychain tại:
👉 **[Tài Liệu Đặc Tả GitHub Report](../../docs/github-report.md)**  
👉 **[Hướng Dẫn Kiến Trúc Mini App](../../docs/mini-app-guide.md)**  
👉 **[Quy Chuẩn Lập Trình Monorepo](../../docs/coding-standards.md)**

---

## 🏛️ Kiến Trúc & Cấu Trúc Mã Nguồn

Ứng dụng tuân theo chuẩn kiến trúc Mini App Nexus bất đồng bộ, triệt tiêu hoàn toàn vòng lặp API và chớp giật giao diện:

- **UI Components Dùng Chung từ `@nexus/ui`**:
  - `MiniAppShell`: Khung layout chuẩn macOS (`Header` $\rightarrow$ `Main` $\rightarrow$ `Footer` + `Splash`).
  - `MiniAppHeader`: Chừa khoảng trống an toàn 76px cho 3 nút Traffic Lights, tích hợp kéo cửa sổ.
  - `MiniAppStatusBar`: Thanh trạng thái 28px kết nối chỉ báo CLI.
  - `AsyncContent` & `Loading`: Ngăn chặn chớp giao diện (Stale-while-revalidate, chỉ hiện thanh mảnh khi refresh).
  - `AppSplashScreen`: Màn hình khởi động tối giản.
- **Hooks Chuẩn & Nghiệp Vụ**:
  - `src/hooks/use-app-settings.ts`: Quản lý cấu hình, cung cấp `settingsRef` ổn định cho các luồng async.
  - `src/hooks/use-github-report.ts`: Quản lý quét PR và AI tóm tắt hoàn toàn theo hướng sự kiện (Event-Driven), không có `useEffect` gây vòng lặp.
  - `useAppBootstrap` & `useHotkeys` (từ `@nexus/ui`): Khởi động app tuần tự 1 lần và bắt phím tắt macOS toàn cục.
- **Rust Backend Async**: Mọi lệnh shell (`gh`, `claude`, `agy`, AppleScript) chạy qua `tauri::async_runtime::spawn_blocking`, tuyệt đối không khóa luồng IPC hay gây hiện tượng chuột xoay 7 màu (beachball).

---

## 🚀 Khởi Chạy Nhanh (Development)

```bash
# Từ thư mục gốc dự án
pnpm dev:github-report

# Hoặc chạy trực tiếp từ thư mục app
cd apps/github-report
pnpm dev
```

---

## 🛠️ Công Nghệ & Cấu Hình

- **Port Web**: `1422`
- **Bundle ID**:
  - Dev: `com.thanhba.nexus.githubreport.dev`
  - Prod: `com.thanhba.nexus.githubreport`
- **Frontend**: React 19, Tailwind CSS, Lucide Icons, `@nexus/ui`, `@tauri-apps/plugin-store`
- **Backend**: Tauri 2, Rust (`keyring`, `tauri-plugin-store`, `opener`)
- **Lưu trữ Cài đặt & Prompt**:
  - Dev: `~/Library/Application Support/com.thanhba.nexus.githubreport.dev/settings.json`
  - Prod: `~/Library/Application Support/com.thanhba.nexus.githubreport/settings.json`
- **Lưu trữ Token Bảo mật**:
  - Dev: macOS Keychain Service `nexus-github-report-dev` (Account: `nexus_user_dev`)
  - Prod: macOS Keychain Service `nexus-github-report` (Account: `nexus_user`)
