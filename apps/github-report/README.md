# 📊 GitHub Report

Ứng dụng macOS tự động tổng hợp GitHub Pull Request & báo cáo Daily Standup / Parabol bằng **Local AI (Zero-Token Cost)** trong hệ sinh thái **Nexus**.

---

## 📖 Tài Liệu Chi Tiết

Xem đầy đủ kiến trúc, cơ chế Unified Titlebar, lưu trữ `tauri-plugin-store` & macOS Keychain tại:
👉 **[Tài Liệu Đặc Tả GitHub Report](../../docs/github-report.md)**

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
- **Frontend**: React 19, Tailwind CSS, Lucide Icons, `@tauri-apps/plugin-store`
- **Backend**: Tauri 2, Rust (`keyring`, `tauri-plugin-store`, `opener`)
- **Lưu trữ Cài đặt & Prompt**:
  - Dev: `~/Library/Application Support/com.thanhba.nexus.githubreport.dev/settings.json`
  - Prod: `~/Library/Application Support/com.thanhba.nexus.githubreport/settings.json`
- **Lưu trữ Token Bảo mật**:
  - Dev: macOS Keychain Service `nexus-github-report-dev` (Account: `nexus_user_dev`)
  - Prod: macOS Keychain Service `nexus-github-report` (Account: `nexus_user`)
