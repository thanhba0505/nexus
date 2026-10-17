# 🐾 2D Pet — Anime Chibi Desktop Companion & Control Center

<p align="center">
  <img src="../../tooling/assets/pet-2d.svg" width="96" height="96" alt="2D Pet Logo" />
</p>

<p align="center">
  <strong>Nhân vật ảo Anime Chibi (Shimeji) di chuyển tự do trên macOS, quản lý tập trung qua Dashboard Control Center</strong><br />
  Xây dựng bằng <strong>Tauri v2 + Rust + React 19 + TypeScript + Vite + Tailwind CSS + @nexus/ui</strong> trong hệ sinh thái Monorepo Nexus.
</p>

---

## ✨ Tính Năng Nổi Bật

- 🎛️ **Control Center Dashboard (800x550)**: Giao diện Dark Acrylic chuẩn phong cách `slackbot` và `github-report` với thanh tiêu đề macOS an toàn 76px Traffic Lights.
- ⚡ **Công Tắc Master (Spawn / Hide)**: Gạt công tắc 1-click để thả hoặc thu hồi Pet ngoài desktop tức thì.
- 🎨 **Thư Viện Nhân Vật (Pet Gallery)**: Quản lý các nhân vật có sẵn (Anya, Miku, Bé Mèo Neko), xem trước hoạt ảnh chuyển động khi hover và 1-click chọn làm Pet chính.
- 📂 **Kéo Thả Upload Shimeji**: Nhập thư mục ảnh PNG Shimeji bất kỳ từ máy tính và lưu trữ bền vững vào `Application Support`.
- 🦘 **Vật Lý & Tự Hành Tinh Tế**: Rơi tự do có gia tốc trọng lực, chạm sàn nảy nhẹ, leo trèo hai bên viền màn hình và nhảy dù xuống.
- 🤏 **Kéo Thả Native macOS**: Click giữ chuột trái để nhấc bổng nhân vật đi khắp màn hình qua API `startDragging()`.
- ⚙️ **Cấu Hình Chuyên Sâu**: Chỉnh kích thước (1.0x - 2.0x), tốc độ, bật/tắt trọng lực, bật/tắt leo tường và tự động thả Pet khi mở máy.

---

## 🚀 Khởi Chạy

```bash
# Chạy Dashboard trên giao diện Web (Port 1423)
pnpm --filter pet-2d dev

# Khởi chạy Desktop App macOS (Dashboard + Pet Overlay)
pnpm --filter pet-2d desktop

# Hoặc khởi chạy từ thư mục gốc
pnpm dev:pet-2d
```

---

## 📖 Tài Liệu Đặc Tả Kiến Trúc

Xem chi tiết kiến trúc Dual-Window và IPC events tại: 👉 **[`docs/pet-2d.md`](../../docs/pet-2d.md)**
