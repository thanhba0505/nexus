# Hướng Dẫn Thiết Lập Môi Trường Phát Triển Cho macOS

> **Tài liệu**: Yêu cầu môi trường & Hướng dẫn cài đặt (Developer Environment Setup Guide)  
> **Dự án**: Nexus Workspace  
> **Nền tảng hỗ trợ**: macOS Ventura (13+), macOS Sonoma (14+), macOS Sequoia (15+)  
> **Kiến trúc chip**: Apple Silicon (M1/M2/M3/M4) & Intel (x86_64)

---

## 1. Yêu Cầu Hệ Thống Tối Thiểu

- **Hệ điều hành**: macOS 13.0 (Ventura) trở lên.
- **Bộ vi xử lý**: Apple Silicon (khuyến nghị ưu tiên) hoặc Intel Core i5/i7.
- **Bộ nhớ RAM**: Tối thiểu 8GB (khuyến nghị 16GB trở lên để biên dịch Rust mượt mà).
- **Dung lượng ổ cứng trống**: Tối thiểu 10GB dung lượng SSD khả dụng.

---

## 2. Hướng Dẫn Cài Đặt Từng Bước

### Bước 1: Cài đặt Xcode Command Line Tools

Xcode Command Line Tools cung cấp trình biên dịch C/C++, Apple LLVM compiler, linker và macOS SDK headers cần thiết để biên dịch native code của Tauri:

```bash
# Mở Terminal và thực thi lệnh:
xcode-select --install
```

_Lưu ý: Nếu một cửa sổ popup xuất hiện yêu cầu xác nhận cài đặt, hãy bấm "Install" và đợi quá trình tải về hoàn tất._

Kiểm tra lại sau khi cài đặt:

```bash
xcode-select -p
# Kết quả mong đợi: /Library/Developer/CommandLineTools hoặc /Applications/Xcode.app/Contents/Developer
```

---

### Bước 2: Kiểm Tra Node.js & Kích Hoạt pnpm

Máy tính của bạn hiện đã có sẵn **Node.js (v24.19.0)**. Để sử dụng `pnpm`, chỉ cần kích hoạt qua **Corepack** đã tích hợp sẵn trong Node.js:

```bash
# Kích hoạt pnpm qua Corepack:
corepack enable pnpm

# Kiểm tra phiên bản pnpm:
pnpm -v
# Kết quả mong đợi: >= 9.x.x
```

Nếu gặp thông báo về quyền ghi, bạn có thể chạy:

```bash
corepack enable --install-directory ~/.local/bin pnpm
```

hoặc cài đặt pnpm qua Homebrew:

```bash
brew install pnpm
```

---

### Bước 3: Cài Đặt Rust Toolchain Chính Thức (Bắt Buộc cho Tauri)

Tauri yêu cầu Rust toolchain stable chính thức từ `rustup`. Trên máy tính hiện tại, Rust chưa được cài đặt. Hãy thực thi lệnh cài đặt tự động:

```bash
# Cài đặt rustup và công cụ dòng lệnh Rust:
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

- Khi màn hình hiện lựa chọn cài đặt `1) Proceed with standard installation (default-selected)`, bạn chỉ cần nhấn **Enter**.
- Sau khi cài đặt hoàn tất, nạp biến môi trường vào shell hiện tại:

```bash
source "$HOME/.cargo/env"
```

Đảm bảo biến môi trường Rust luôn tự động tải khi mở Terminal mới bằng cách kiểm tra file `~/.zshrc`:

```bash
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.zshrc
```

Kiểm tra phiên bản Rust sau khi cài đặt:

```bash
rustc --version
cargo --version
# Kết quả mong đợi: rustc 1.80+ và cargo 1.80+
```

---

## 3. Script Kiểm Tra Sức Khỏe Môi Trường Tự Động

Dự án cung cấp sẵn script tự động hóa tại `tooling/scripts/check-env.sh` để kiểm tra nhanh toàn bộ môi trường phát triển.

### Chạy kiểm tra:

```bash
chmod +x tooling/scripts/check-env.sh
./tooling/scripts/check-env.sh
```

Nếu tất cả các mục đều hiển thị `[ PASS ]`, hệ thống của bạn đã sẵn sàng 100% để chạy development và build các ứng dụng macOS trong Nexus!

---

## 4. Xử Lý Các Sự Cố Môi Trường Thường Gặp (Troubleshooting)

### 4.1. Lỗi: `xcrun: error: invalid active developer path`

- **Nguyên nhân**: Thường xảy ra sau khi cập nhật hệ điều hành macOS khiến đường dẫn Command Line Tools bị lệch.
- **Khắc phục**:
  ```bash
  sudo xcode-select --reset
  ```

### 4.2. Lỗi: `cargo: command not found` sau khi cài đặt rustup

- **Nguyên nhân**: Phiên shell hiện tại chưa nạp biến môi trường `$HOME/.cargo/bin`.
- **Khắc phục**:
  ```bash
  source "$HOME/.cargo/env"
  ```

### 4.3. Lỗi Corepack: `Signature verification failed`

- **Nguyên nhân**: Phiên bản Corepack cũ chưa cập nhật khóa ký mã mới.
- **Khắc phục**:
  ```bash
  npm install -g corepack@latest
  corepack enable pnpm
  ```
