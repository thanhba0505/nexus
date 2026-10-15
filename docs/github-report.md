# 📊 GitHub Report - Tài Liệu Đặc Tả & Thiết Kế Kiến Trúc

> **GitHub Report** là ứng dụng độc lập trong hệ sinh thái **Nexus**, hỗ trợ lập trình viên tự động quét Pull Request & commit trên GitHub, tóm tắt nội dung Daily Standup bằng **Local AI (Zero-Token Cost)** và kích hoạt tab **Parabol / Slack / Notion** chỉ với một thao tác.

---

## 1. Tổng Quan & Triết Lý Sản Phẩm

Mỗi buổi sáng họp **Daily Standup** hoặc viết cập nhật trên **Parabol**, lập trình viên thường mất từ 5-15 phút để mở từng PR trên GitHub nhằm nhớ lại hôm qua mình đã hoàn thành những gì.

**GitHub Report** kế thừa và nâng cấp toàn diện từ dự án gốc `PR-report` với 4 giá trị cốt lõi:

1. **Zero-Token Cost (Local AI First)**: Ưu tiên dùng phiên đăng nhập CLI có sẵn trên máy Mac (`claude` Code CLI hoặc `agy` Antigravity CLI), không tốn tiền API token và không yêu cầu cấu hình phức tạp.
2. **Giao Diện Chuẩn macOS & Nexus Aesthetic**: Ngôn ngữ thiết kế Glassmorphism tối mờ (Dark Acrylic Vibrancy), điểm nhấn màu xanh Sky Blue `#0ea5e9`, bo góc squircle tinh tế.
3. **Unified Window Titlebar (Thanh Header Tuỳ Biến)**: Tích hợp 3 nút Traffic Lights gốc macOS (Đỏ 🔴, Vàng 🟡, Xanh 🟢) trực tiếp trên thanh công cụ đa năng của ứng dụng.
4. **Local-First & Bảo Mật Tuyệt Đối**: Cài đặt và Prompt lưu dạng JSON Key-Value Store (`tauri-plugin-store`), token nhạy cảm được bảo vệ an toàn trong **macOS Keychain** qua Secure Enclave.

---

## 2. Kiến Trúc Giao Diện & Hooks (UI & State Architecture)

### 2.1. Tái Sử Dụng Thành Phần Chuẩn Từ `@nexus/ui`

Để đảm bảo tính nhất quán trên toàn bộ hệ sinh thái Nexus, `github-report` kế thừa trực tiếp các thành phần cốt lõi từ thư viện `@nexus/ui`:

1. **`MiniAppHeader`**:
   - Tự động tích hợp khoảng trống an toàn 76px (`leftSafeWidth={76}`) cho 3 nút Traffic Lights gốc macOS.
   - Hỗ trợ kéo di chuyển cửa sổ thông qua `data-tauri-drag-region` và phân lập các nút bấm bằng `data-no-drag`.
   - Chia 3 vùng rõ ràng: `leftSlot` (Logo, Title, Bộ chọn ngày), `centerSlot`, `rightSlot` (Fetch ⌘R, Copy, Parabol, Settings ⌘,).
2. **`AppSplashScreen`**:
   - Màn hình khởi động tối giản gồm Glowing App Icon, Title, Version badge và thanh tiến trình (Progress bar).
   - Chỉ đảm nhiệm nạp `settings.json` và kiểm tra môi trường hệ thống trong ~300ms rồi transition mượt mà vào giao diện chính.

### 2.2. Kiến Trúc Phân Rã Custom Hooks

Thay vì dồn toàn bộ state vào `App.tsx`, ứng dụng được phân tách thành 3 hooks chuyên biệt theo Single Responsibility Principle:

```text
apps/github-report/src/
├── hooks/
│   ├── use-splash-screen.ts    # Quản lý tiến trình splash, nạp settings.json & check CLI
│   ├── use-github-report.ts    # Quản lý fetch PRs, filter commits, AI summary, clipboard & browser reveal
│   └── use-global-shortcuts.ts # Quản lý toàn bộ phím tắt macOS (⌘R, ⌘C, ⌘P, ⌘,, ⌘Enter, Esc)
├── components/
│   ├── UnifiedHeader.tsx       # Bọc MiniAppHeader từ @nexus/ui
│   ├── AISummaryCard.tsx       # Hiển thị AI Summary, inline edit & loading spinner
│   ├── PRTimelineCard.tsx      # Danh sách PR/Commit checkboxes & skeleton pulse loading
│   ├── SettingsModal.tsx       # Modal cấu hình prompt, AI provider, Keychain PAT
│   └── StatusBar.tsx           # Thanh trạng thái tối giản dưới chân trang
└── App.tsx                     # Component điều phối gọn nhẹ (<150 dòng)
```

- **`useSplashScreen`**:
  - Tải cấu hình từ `settings.json` qua `tauri-plugin-store`.
  - Kiểm tra điều kiện tiên quyết (GitHub CLI, Antigravity CLI, Keychain).
  - Trả về `isSplashActive`, `settings`, `updateSettings`.
- **`useGitHubReport`**:
  - Tiếp nhận `settings` sau khi splash hoàn tất.
  - Tự động kích hoạt quét PRs bất đồng bộ khi vào app.
  - Khi PRs nạp xong, tự động trigger AI tóm tắt ngầm ở background thread.
  - Cung cấp trạng thái loading cục bộ: `isLoadingPRs`, `isGeneratingSummary`.
- **`useGlobalShortcuts`**:
  - Đăng ký listeners phím tắt macOS chuẩn xác, tự động dọn dẹp (cleanup) khi unmount.

### 2.3. Wireframe Bố Cục Ứng Dụng

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│ 🔴 🟡 🟢  [ 📅 Hôm nay ▾ ]  2 PRs • 6 commits  │  🔄 Fetch (⌘R)   📋 Copy   🚀 Parabol  ⚙ │ <- Unified Header (48px)
├───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ┌─ ✨ AI Daily Summary (✦ by Claude CLI / Antigravity) ───────────────────────┐  │
│  │ • Triển khai tính năng kéo cửa sổ launcher và đồng bộ 2 chiều miniapps       │  │
│  │ • Khắc phục lỗi pathspec release-artifacts trên CI/CD workflow               │  │
│  │ • Tối ưu animation fade-in ContextMenu mượt mà theo toạ độ click            │  │
│  │                                          [✏️ Sửa nhanh]  [📋 Sao chép (⌘C)]  │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                   │
│  ┌─ 📦 Pull Requests & Commits Trong Ngày ─────────────────────────────────────┐  │
│  │  [☑] 🔀 [nexus] feat: sync miniapp open/close state & context menu (PR #42) │  │
│  │      ├── [☑] feat: sync miniapp open/close state and update context menu    │  │
│  │      └── [☑] fix(nexus): enable window dragging with proper permissions     │  │
│  │                                                                             │  │
│  │  [☑] 🔀 [PR-report] fix: update draft release workflow (PR #15)            │  │
│  │      └── [☑] fix(ci): remove ignored release-artifacts pathspec             │  │
│  │                                 (Hiển thị Skeleton Pulse khi đang tải)      │  │
│  └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                   │
│  Trạng thái: ✓ Đã sao chép vào Clipboard • Đã kích hoạt tab Parabol • 09:30       │ <- Minimal Status Footer (32px)
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Luồng Nghiệp Vụ & Nạp Dữ Liệu Bất Đồng Bộ (Web-Like Async Flow)

Quy trình nạp dữ liệu được thiết kế hoàn toàn bất đồng bộ (non-blocking). Mọi lệnh nặng trong Rust đều chạy qua `tauri::async_runtime::spawn_blocking`, đảm bảo không bao giờ khóa luồng giao diện hay gây hiện tượng con trỏ xoay 7 màu (beachball):

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Lập trình viên
    participant Splash as AppSplashScreen
    participant UI as GitHub Report (React)
    participant Rust as Backend (Tauri Native Async)
    participant GH as GitHub CLI (`gh`)
    participant AI as Local AI (`claude` / `agy`)
    participant OS as macOS (Clipboard / AppleScript)

    Dev->>Splash: Mở ứng dụng
    Splash->>Rust: Nạp settings.json & check prerequisites (~300ms)
    Splash-->>UI: Fade-out transition -> Vào ngay giao diện chính!

    Note over UI: Người dùng tự do bấm Settings (⌘,), cuộn xem, v.v.

    par Bất đồng bộ 1: Quét PRs
        UI->>UI: PRTimelineCard hiển thị Skeleton Loading Pulse
        UI->>Rust: invoke("fetch_github_prs", { sinceDate }) (spawn_blocking)
        Rust->>GH: gh search prs & gh pr view (song song std::thread::scope)
        GH-->>Rust: Trả về PRs & commits
        Rust-->>UI: Cập nhật danh sách PRs (Tắt skeleton)
    end

    par Bất đồng bộ 2: Tự động tóm tắt AI
        UI->>UI: AISummaryCard hiển thị Spinner Loading
        UI->>Rust: invoke("generate_ai_summary", { prs, prompt }) (spawn_blocking)
        alt Có Claude Code CLI (`claude`)
            Rust->>AI: claude -p <prompt>
        else Fallback Antigravity CLI (`agy`)
            Rust->>AI: agy -p "<prompt>"
        end
        AI-->>Rust: Trả về kết quả tóm tắt
        Rust-->>UI: Cập nhật Card AI Summary (Tắt spinner)
    end

    opt Nếu bật autoCopy / revealBrowser
        UI->>OS: Tự động sao chép Clipboard & kích hoạt tab Parabol
    end
```

---

## 4. Cơ Chế Lưu Trữ Dữ Liệu (Storage Architecture)

Ứng dụng tuân thủ nghiêm ngặt mô hình **Local-First** và phân loại dữ liệu rõ ràng, đồng thời phân tách độc lập giữa môi trường **Development** và **Production**:

```
+---------------------------------------------------------------------------------------+
|                                    MÁY MAC NGƯỜI DÙNG                                 |
+---------------------------------------------------------------------------------------+
|  [ Nhóm 1: Dữ Liệu Nhạy Cảm / Token ]      |  [ Nhóm 2: Cài Đặt & Prompt Templates ]   |
|  - GitHub Personal Access Token (PAT)       |  - Prompt tóm tắt AI (Prompt Template)   |
|  - API Key dự phòng (Claude / OpenAI)       |  - Tùy chọn trình duyệt (Brave/Chrome...) |
|  -----------------------------------------  |  - Bộ lọc bỏ commit (Prefix blacklist)  |
|  NƠI LƯU: macOS Keychain                   |  NƠI LƯU: ~/Library/Application Support/ |
|  CÔNG NGHỆ: Crate Rust `keyring`            |  CÔNG NGHỆ: `tauri-plugin-store` (JSON)  |
|  BẢO MẬT: Apple Secure Enclave              |  TỆP TIN: settings.json                  |
+---------------------------------------------------------------------------------------+
```

### 4.1. Quy Chuẩn Phân Tách Môi Trường Dev & Prod (Isolation)

Để tránh tình trạng cấu hình hoặc token trong lúc dev ghi đè hoặc làm hỏng dữ liệu bản phát hành chính thức:

| Mục                             | Môi trường Dev                                                      | Môi trường Production                                           |
| :------------------------------ | :------------------------------------------------------------------ | :-------------------------------------------------------------- |
| **App Bundle ID**               | `com.thanhba.nexus.githubreport.dev`                                | `com.thanhba.nexus.githubreport`                                |
| **Tên ứng dụng hiển thị**       | `GitHub Report (Dev)`                                               | `GitHub Report`                                                 |
| **Thư mục Application Support** | `~/Library/Application Support/com.thanhba.nexus.githubreport.dev/` | `~/Library/Application Support/com.thanhba.nexus.githubreport/` |
| **File cấu hình Store**         | `settings.json` (trong thư mục dev)                                 | `settings.json` (trong thư mục prod)                            |
| **macOS Keychain Service**      | `nexus-github-report-dev`                                           | `nexus-github-report`                                           |
| **macOS Keychain Account**      | `nexus_user_dev`                                                    | `nexus_user`                                                    |
| **Web Fallback (LocalStorage)** | `nexus_github_report_settings_dev`                                  | `nexus_github_report_settings`                                  |

- **Cơ chế Dev**: Khi chạy `pnpm dev:github-report` hoặc `pnpm desktop`, Tauri CLI đọc file `src-tauri/tauri.dev.conf.json` để override `identifier` thành `com.thanhba.nexus.githubreport.dev`.
- **Cơ chế Rust**: Macro `cfg!(debug_assertions)` tự động chuyển tiếp Keychain sang `nexus-github-report-dev` khi chạy ở chế độ debug/dev.

### 4.2. Cấu Trúc File `settings.json` (`tauri-plugin-store`)

Đường dẫn file:

- Dev: `~/Library/Application Support/com.thanhba.nexus.githubreport.dev/settings.json`
- Prod: `~/Library/Application Support/com.thanhba.nexus.githubreport/settings.json`

```json
{
  "ai": {
    "provider": "auto",
    "promptTemplate": "Below are the pull requests I worked on today, each with today's commit titles. Write a summary for my daily standup in 3 to 4 lines total: group related work, describe outcomes in plain English, skip merges and trivial comment/doc tweaks. Each line is one short sentence, starting with '- '.",
    "customInstructions": "Tập trung vào kết quả nghiệp vụ bàn giao, bỏ qua các commit merge và format",
    "language": "vi",
    "maxLines": 4
  },
  "workflow": {
    "destination": "parabol",
    "browser": "brave",
    "autoCopy": true,
    "revealBrowser": true,
    "parabolUrl": "https://action.parabol.co"
  },
  "filters": {
    "excludedRepos": [],
    "ignoredCommitPrefixes": ["chore(release)", "style", "docs"],
    "dateRangeMode": "today"
  }
}
```

---

## 5. Đặc Tả Native IPC Commands (Rust Core)

Các lệnh được đăng ký trong `tauri::generate_handler!`:

| Command               | Tham Số Đầu Vào                                                        | Kết Quả Trả Về           | Mô Tả                                                                                                   |
| :-------------------- | :--------------------------------------------------------------------- | :----------------------- | :------------------------------------------------------------------------------------------------------ |
| `check_prerequisites` | Không có                                                               | `PrereqStatus`           | Kiểm tra tình trạng `gh` CLI, tài khoản login, và các Local AI CLI (`claude`, `agy`) trên máy.          |
| `fetch_github_prs`    | `since_iso: String`                                                    | `Vec<PRReportItem>`      | Quét toàn bộ PR và commit của user từ mốc thời gian chỉ định qua `gh search prs`.                       |
| `generate_ai_summary` | `prs: Vec<PRReportItem>`, `prompt: String`, `provider: Option<String>` | `AISummaryResult`        | Gửi danh sách commit vào Local AI CLI hoặc API để lấy bản tóm tắt 3-4 bullet points.                    |
| `reveal_browser_tab`  | `target: String`, `browser: String`                                    | `Result<(), String>`     | Dùng AppleScript kích hoạt tab đang mở của Parabol/Slack trên trình duyệt (Brave, Chrome, Safari, Arc). |
| `save_github_token`   | `token: String`                                                        | `Result<(), String>`     | Lưu GitHub PAT vào macOS Keychain an toàn (`keyring`).                                                  |
| `get_github_token`    | Không có                                                               | `Result<String, String>` | Lấy GitHub PAT từ macOS Keychain.                                                                       |

---

## 6. Tính Năng Nâng Cấp So Với Bản Gốc (`PR-report`)

| Tiêu Chí            | Bản Gốc `PR-report`                                                                | Bản Mới `GitHub Report (Nexus)`                                                                           |
| :------------------ | :--------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **Công Nghệ UI**    | Python Tkinter (Giao diện cũ)                                                      | React 19 + Tailwind CSS + Lucide Icons (Hiện đại, siêu mượt)                                              |
| **Cửa Sổ & Header** | Thanh tiêu đề chuẩn OS đơn điệu                                                    | **Unified Header**: 3 nút Traffic Lights gốc macOS lồng ghép nút hành động                                |
| **Báo Cáo Thứ Hai** | ❌ Luôn cố định từ `00:00` sáng hôm nay (sáng thứ Hai không lấy được việc thứ Sáu) | ✅ **Nút chuyển đổi thông minh**: `Hôm nay` \| `Ngày làm việc gần nhất (Last Workday)` \| `Tùy chọn ngày` |
| **Bộ Lọc Commit**   | ❌ Luôn tóm tắt tất cả                                                             | ✅ **Hộp kiểm (Checkboxes)**: Bật/tắt từng commit hoặc repo trước khi AI tóm tắt                          |
| **Chỉnh Sửa Nhanh** | ❌ Textbox chỉ đọc                                                                 | ✅ **Inline Edit**: Sửa trực tiếp từng bullet point trước khi bấm Copy                                    |
| **Đích Đến**        | Chỉ mở Parabol trên Brave                                                          | Hỗ trợ chọn **Parabol**, **Slack Web/App**, **Notion**, hoặc **Chỉ Copy**                                 |
| **Cơ Chế Dự Phòng** | Phụ thuộc hoàn toàn vào CLI                                                        | Nếu không có CLI, hỗ trợ nhập GitHub PAT & API Key vào macOS Keychain                                     |

---

## 7. Bộ Phím Tắt Tiêu Chuẩn macOS

- <kbd>⌘</kbd> + <kbd>R</kbd>: Quét & Tải lại danh sách PRs (`Fetch PRs`).
- <kbd>⌘</kbd> + <kbd>C</kbd>: Sao chép bản tóm tắt AI vào Clipboard.
- <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd>: Sao chép danh sách commit thô dạng text.
- <kbd>⌘</kbd> + <kbd>P</kbd>: Nhảy tới tab Parabol / Slack trên trình duyệt.
- <kbd>⌘</kbd> + <kbd>,</kbd>: Mở Modal Cài đặt (Prompt, Trình duyệt, AI Provider).
- <kbd>Esc</kbd>: Đóng Modal đang mở hoặc hủy chế độ chỉnh sửa.

---

## 8. Lộ Trình Phát Triển (Roadmap)

- [x] **Giai đoạn 1**: Cấu hình Tauri 2 `titleBarStyle: "Overlay"`, tích hợp macOS Vibrancy, chuẩn hóa `MiniAppHeader` trong `@nexus/ui`.
- [x] **Giai đoạn 2**: Xây dựng Rust async commands non-blocking: `check_prerequisites`, `fetch_github_prs`, `generate_ai_summary`, `reveal_browser_tab`.
- [x] **Giai đoạn 3**: Hoàn thiện UI Glassmorphism: Card AI Summary (hỗ trợ Inline Edit & trigger lại), Timeline PR & Commits (hỗ trợ Checkbox exclusion & skeleton pulse loading).
- [x] **Giai đoạn 4**: Xây dựng Modal Settings (`⌘,`): Quản lý Prompt templates qua `tauri-plugin-store`, quản lý Token qua Keychain, cấu hình Browser.
- [x] **Giai đoạn 5 (Refactor Chuẩn Monorepo)**:
  - Tách `MiniAppHeader` & `AppSplashScreen` vào package dùng chung `@nexus/ui`.
  - Phân rã hooks (`useSplashScreen`, `useGitHubReport`, `useGlobalShortcuts`), thu gọn `App.tsx` dưới 150 dòng.
  - Chuyển toàn bộ tác vụ Rust sang Non-blocking Async (`spawn_blocking`) triệt tiêu hoàn toàn hiện tượng Beachball Cursor.
- [ ] **Giai đoạn 6**: Viết test hồi quy, bổ sung caching PRs cục bộ và đóng gói bundle `.dmg` cho Production.
