# 📊 GitHub Report

Ứng dụng macOS tự động tổng hợp GitHub Pull Request & báo cáo Daily Standup / Parabol bằng **Local AI (Zero-Token Cost)** trong hệ sinh thái **Nexus**.

---

## 📖 Tài Liệu Chi Tiết

Xem đầy đủ kiến trúc, cơ chế Unified Titlebar, lưu trữ `tauri-plugin-store` & macOS Keychain tại:
👉 **[Tài Liệu Đặc Tả GitHub Report](../../docs/github-report.md)**  
👉 **[Quy Chuẩn Lập Trình Monorepo](../../docs/coding-standards.md)**

---

## 🏛️ Kiến Trúc & Cấu Trúc Mã Nguồn

Ứng dụng tuân theo chuẩn kiến trúc Web-Dashboard bất đồng bộ non-blocking:

- **UI Components Dùng Chung**: Kế thừa `MiniAppHeader` (Traffic lights 76px safe margin) và `AppSplashScreen` từ gói `@nexus/ui`.
- **Phân Rã Hooks Chuyên Biệt**:
  - `src/hooks/use-splash-screen.ts`: Quản lý nạp cấu hình `settings.json` và kiểm tra môi trường trong ~300ms rồi transition vào main view.
  - `src/hooks/use-github-report.ts`: Quét PRs/commits bất đồng bộ, tự động kích hoạt Local AI tóm tắt ngầm ở background thread.
  - `src/hooks/use-global-shortcuts.ts`: Quản lý phím tắt macOS toàn cục (`⌘R`, `⌘C`, `⌘P`, `⌘,`, `⌘Enter`, `Esc`).
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
