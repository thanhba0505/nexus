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

Ứng dụng tuân theo chuẩn kiến trúc hướng sự kiện (Event-Driven) kết hợp mô hình hiển thị Stale-While-Revalidate:

- **UI Components Dùng Chung từ `@nexus/ui`**:
  - `MiniAppShell`: Khung layout chuẩn macOS (`Header` $\rightarrow$ `Main` $\rightarrow$ `Footer` + `Splash`).
  - `MiniAppHeader`: Header chuẩn macOS Overlay Titlebar, chừa 76px an toàn cho Traffic Lights và hỗ trợ kéo cửa sổ.
  - `MiniAppStatusBar`: Thanh trạng thái 28px hiển thị trạng thái kết nối GitHub CLI và AI Provider.
  - `AsyncContent` & `Loading`: Bộ điều phối trạng thái tải dữ liệu mượt mà, giữ bố cục ổn định khi làm mới dữ liệu.
  - `AppSplashScreen`: Màn hình khởi động tối giản với thanh tiến trình nạp cấu hình.
- **Hooks Chuẩn & Nghiệp Vụ**:
  - `src/hooks/use-app-settings.ts`: Quản lý cấu hình người dùng, cung cấp ref đồng bộ cho các luồng xử lý bất đồng bộ.
  - `src/hooks/use-github-report.ts`: Đóng gói toàn bộ luồng nghiệp vụ quét PRs, tóm tắt AI, sao chép clipboard và điều hướng trình duyệt.
  - `useAppBootstrap` & `useHotkeys` (từ `@nexus/ui`): Khởi động tuần tự và quản lý phím tắt macOS toàn cục.
- **Rust Backend**: Xử lý các tác vụ hệ thống (GitHub CLI, Local AI CLI, AppleScript) bất đồng bộ trong background thread qua `tauri::async_runtime::spawn_blocking`.

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
