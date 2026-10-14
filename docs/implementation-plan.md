# Kế Hoạch Triển Khai Kỹ Thuật Chi Tiết (Nexus Monorepo)

> **Tài liệu**: Kế hoạch triển khai & Lộ trình kỹ thuật (Engineering Implementation Plan)  
> **Dự án**: Nexus Workspace  
> **Phiên bản kế hoạch**: v1.1.0 (Cập nhật giao diện Launchpad macOS & Coding Standards)  
> **Trạng thái**: Sẵn sàng thực thi (Ready for Execution)

---

## 1. Mục Tiêu & Tiêu Chí Hoàn Thành (Definition of Done - DoD)

Dự án chỉ được coi là hoàn thành giai đoạn khởi tạo khi đáp ứng đầy đủ 12 tiêu chí sau:

1. **Monorepo Hợp Lệ**: Cấu hình pnpm workspaces và Turborepo chuẩn xác, cấu trúc phân chia `apps/`, `packages/`, `tooling/` rõ ràng.
2. **`pnpm install` Thành Công**: Cài đặt dependency toàn bộ monorepo trơn tru, không có lỗi xung đột package.
3. **Nexus Chạy Development (Launchpad UI)**: Lệnh `pnpm dev:nexus` khởi chạy ứng dụng Nexus ở port 1420 với giao diện Launchpad kính mờ trong suốt (Frosted Acrylic Blur), Header (Search, Settings icons), Center App Grid (icon bo tròn squircle), Footer (danh mục icons).
4. **SlackBot Chạy Development**: Lệnh `pnpm dev:slackbot` khởi chạy ứng dụng SlackBot ở port 1421 hiển thị placeholder `SlackBot` và `Coming soon`.
5. **GitHub Report Chạy Development**: Lệnh `pnpm dev:github-report` khởi chạy ứng dụng GitHub Report ở port 1422 hiển thị placeholder `GitHub Report` và `Coming soon`.
6. **Type-Safety & Linting**: Lệnh `pnpm typecheck` và `pnpm lint` thực thi sạch sẽ, 0 lỗi TypeScript strict, 0 cảnh báo ESLint nghiêm trọng.
7. **Đóng Gói 3 Bundle `.app` Độc Lập**: Build được 3 file `.app` riêng biệt trên macOS (`Nexus.app`, `SlackBot.app`, `GitHub Report.app`).
8. **Định Danh & Icon Riêng Biệt**: 3 app sở hữu bundle identifier (`com.thanhba.nexus`, `com.thanhba.nexus.slackbot`, `com.thanhba.nexus.githubreport`) và icon riêng biệt chuẩn macOS `.icns`.
9. **Tuân Thủ Coding Standards & Lưu Trữ Cục Bộ (Local-First)**: Tất cả các file tuân thủ quy chuẩn đặt tên, không dùng enum số (dùng string union/`as const`), biến boolean có tiền tố `is/has/can/should`. Cài đặt người dùng lưu qua `tauri-plugin-store` tại `~/Library/Application Support/`, token/secrets lưu qua macOS Keychain (`keyring`), bản release không yêu cầu `.env`.
10. **Độc Lập Vòng Đời Tuyệt Đối**: Mini app mở được trực tiếp từ Dock/Spotlight mà không cần mở Nexus; tắt Nexus không ảnh hưởng đến mini app đang chạy.
11. **README & Docs Chuẩn Hóa**: Hướng dẫn đầy đủ cách cài đặt môi trường, dev, build từng app và quy chuẩn phát triển mã nguồn.
12. **Phạm Vi Tối Giản Tuyệt Đối**: Không triển khai tính năng nghiệp vụ, database, authentication, backend API ngoài phạm vi khởi tạo.

---

## 2. Lộ Trình Triển Khai 6 Giai Đoạn (6-Phase Roadmap)

### Phase 1: Môi Trường, Khung Monorepo Root & Cấu Hình Chuẩn

- **Mục tiêu**: Thiết lập cấu hình root monorepo, pnpm workspace, Turborepo, Cargo Workspace và tooling format/lint.
- **Nhiệm vụ cụ thể**:
  1. Kiểm tra môi trường bằng script `tooling/scripts/check-env.sh` (Node, pnpm, Xcode CLT, Rust).
  2. Tạo `.prettierrc.json` và `eslint.config.js` theo chuẩn Coding Standards.
  3. Tạo `package.json` tại root với các scripts:
     - `pnpm dev:nexus`, `pnpm dev:slackbot`, `pnpm dev:github-report`
     - `pnpm build:nexus`, `pnpm build:slackbot`, `pnpm build:github-report`
     - `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm format`
  4. Tạo `pnpm-workspace.yaml` (`apps/*`, `packages/*`, `tooling/*`).
  5. Tạo `turbo.json` định nghĩa pipeline build, typecheck, lint, dev.
  6. Tạo root `Cargo.toml` với `[workspace]` gồm 3 app backend để gom build cache `target/`.
  7. Tạo `.gitignore`, `.editorconfig`, `.nvmrc`.

### Phase 2: Xây Dựng Bộ Shared Packages & Launchpad Components

- **Mục tiêu**: Xây dựng các package dùng chung giữa các app mà không làm lộ runtime.
- **Nhiệm vụ cụ thể**:
  1. **`packages/config` (`@nexus/config`)**:
     - `tsconfig.base.json`: Base TypeScript compiler options (Strict mode).
     - `tsconfig.react.json`: React compiler options.
     - `tailwind.preset.js`: Preset giao diện macOS (SF Pro font, squircle radius, translucent glass palette).
  2. **`packages/shared` (`@nexus/shared`)**:
     - `src/types/app-registry.ts`: Interface `NexusAppMeta` (`id`, `name`, `description`, `bundleId`, `port`, `status`, `category`).
     - `src/constants/app-info.ts`: Metadata khai báo chính xác cho Nexus, SlackBot, GitHub Report và các slot placeholder.
     - String Literal Union types (`AppStatus`, `AppCategory`).
  3. **`packages/ui` (`@nexus/ui`)**:
     - **Bộ component Launchpad macOS**:
       - `LaunchpadLayout.tsx`: Container nền kính mờ (`bg-slate-950/40 backdrop-blur-2xl`), 3 tầng Header - Body - Footer.
       - `LaunchpadHeader.tsx`: Nút Grid, Search icon, Folder icon, Settings icon (dạng pill bán nguyệt).
       - `AppGrid.tsx`: Lưới responsive các mini-app (`grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9`).
       - `AppIconItem.tsx`: Icon squircle macOS (`rounded-[20px]`), hiệu ứng hover zoom, nhãn tên app màu trắng sắc nét bên dưới.
       - `LaunchpadFooter.tsx`: Thanh Floating Dock danh mục (`All`, `Dev`, `Chat`, `Games`, `+`) và nút nguồn.
     - **Component Placeholder**:
       - `PlaceholderView.tsx`: Màn hình placeholder chuẩn cho mini app độc lập.
       - `Badge.tsx`, `Button.tsx`, `Card.tsx`.

### Phase 3: Triển Khai Nexus Hub (Giao Diện Launchpad Kính Mờ)

- **Mục tiêu**: Dựng ứng dụng Nexus độc lập với vai trò Launchpad & Ecosystem Manager.
- **Nhiệm vụ cụ thể**:
  1. Khởi tạo `apps/nexus`:
     - `package.json` kết nối `@nexus/ui`, `@nexus/shared`, `@nexus/config`.
     - `.env.example` và `src/env.ts` (validate Zod schema).
     - `vite.config.ts`: port `1420`, `strictPort: true`.
     - `index.html` và `src/index.css` (cấu hình nền trong suốt `transparent !important`).
     - `src/App.tsx`: Tích hợp `LaunchpadLayout`, `LaunchpadHeader`, `AppGrid`, `LaunchpadFooter`.
  2. Cấu hình Tauri 2 (`apps/nexus/src-tauri`):
     - `tauri.conf.json`:
       - `identifier`: `"com.thanhba.nexus"`
       - `productName`: `"Nexus"`
       - `macOSPrivateApi`: `true`
       - `transparent`: `true`
       - `decorations`: `false`
       - `devUrl`: `"http://localhost:1420"`
       - `frontendDist`: `"../dist"`
     - `Cargo.toml`: Tích hợp `window-vibrancy = "0.5"`.
     - `src/lib.rs`: Áp dụng `apply_vibrancy(&window, NSVisualEffectMaterial::FullScreenUI, None, None)`.
     - `capabilities/default.json`: Khai báo quyền Tauri 2.

### Phase 4: Khởi Tạo 2 Mini Apps Độc Lập (`slackbot` & `github-report`)

- **Mục tiêu**: Dựng 2 mini apps độc lập hoàn toàn, có thể build và chạy riêng rẽ.
- **Nhiệm vụ cụ thể**:
  1. **`apps/slackbot`**:
     - `package.json`, `.env.example`, `src/env.ts`.
     - `vite.config.ts`: port `1421`, `strictPort: true`.
     - `tauri.conf.json`: `identifier: "com.thanhba.nexus.slackbot"`, `productName: "SlackBot"`, `devUrl: "http://localhost:1421"`.
     - Giao diện: Hiển thị `SlackBot` và `Coming soon` qua `PlaceholderView`.
  2. **`apps/github-report`**:
     - `package.json`, `.env.example`, `src/env.ts`.
     - `vite.config.ts`: port `1422`, `strictPort: true`.
     - `tauri.conf.json`: `identifier: "com.thanhba.nexus.githubreport"`, `productName: "GitHub Report"`, `devUrl: "http://localhost:1422"`.
     - Giao diện: Hiển thị `GitHub Report` và `Coming soon` qua `PlaceholderView`.

### Phase 5: Thiết Kế Icon Độc Lập & Tự Động Hóa Asset

- **Mục tiêu**: Cung cấp bộ icon riêng biệt, thẩm mỹ cao cho từng app chuẩn macOS `.icns`.
- **Nhiệm vụ cụ thể**:
  1. Thiết kế 3 icon tối giản, hiện đại mang bản sắc riêng:
     - **Nexus**: Biểu tượng đa liên kết trung tâm (Indigo / Violet).
     - **SlackBot**: Biểu tượng tự động hóa / robot cộng tác (Emerald / Teal).
     - **GitHub Report**: Biểu tượng biểu đồ phân tích / Git commit graph (Sky / Slate).
  2. Viết script `tooling/scripts/generate-icons.sh` tự động sinh trọn bộ:
     - `icon.icns` (macOS Dock, Spotlight, Finder).
     - `icon.ico` (Windows).
     - `32x32.png`, `128x128.png`, `128x128@2x.png` (Window icons).

### Phase 6: Kiểm Thử, Typecheck, Build macOS `.app` & Hoàn Thiện README

- **Mục tiêu**: Xác thực toàn bộ tiêu chí hoàn thành trên máy macOS.
- **Nhiệm vụ cụ thể**:
  1. Chạy `pnpm install` và kiểm tra toàn bộ workspace dependencies.
  2. Chạy `pnpm typecheck` xác nhận TypeScript strict sạch lỗi.
  3. Chạy `pnpm lint` kiểm tra chuẩn hóa code theo `docs/coding-standards.md`.
  4. Chạy dev từng app và kiểm tra dev song song (ports 1420, 1421, 1422).
  5. Chạy build tạo 3 bundle `.app`:
     - `target/release/bundle/macos/Nexus.app`
     - `target/release/bundle/macos/SlackBot.app`
     - `target/release/bundle/macos/GitHub Report.app`
  6. Kiểm tra mở độc lập từng `.app` trên macOS qua `open`.
  7. Viết `README.md` hướng dẫn toàn diện từ A-Z.

---

## 3. Ma Trận Quản Trị Rủi Ro Kỹ Thuật

|  STT  | Rủi ro kỹ thuật                                          |     Mức độ     | Hậu quả tiềm ẩn                                                 | Giải pháp phòng ngừa & Xử lý                                                                                                                                                  |
| :---: | :------------------------------------------------------- | :------------: | :-------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **Chưa cài đặt Rust trên máy host**                      |    **Cao**     | Không thể chạy `tauri dev` hoặc `tauri build`.                  | Cung cấp tài liệu `docs/prerequisites.md` và script `tooling/scripts/check-env.sh`. Hướng dẫn cài đặt rustup chỉ với 1 dòng lệnh. Frontend vẫn chạy dev bình thường qua Vite. |
| **2** | **Xung đột Port Dev**                                    |    **Cao**     | Vite tự động chuyển port khiến Tauri v2 kết nối nhầm webview.   | Cấu hình cứng `server.port` và `server.strictPort = true` trong `vite.config.ts` của cả 3 apps (1420, 1421, 1422).                                                            |
| **3** | **Phình dung lượng ổ cứng do build cache**               |    **Cao**     | Mỗi app build riêng tốn 4GB-5GB, tổng cộng ngốn 15GB ổ cứng.    | Sử dụng root `Cargo.toml` với `[workspace]`. Toàn bộ 3 apps dùng chung cache `/target/` tại root, giảm 65% dung lượng và tăng tốc build 3 lần.                                |
| **4** | **Lỗi hiển thị nền kính mờ trên các phiên bản macOS cũ** | **Trung bình** | Giao diện bị đen hoặc đục ngầu nếu macOS không hỗ trợ vibrancy. | Cấu hình CSS fallback với `bg-slate-950/70 backdrop-blur-xl` để đảm bảo giao diện luôn hiển thị mượt mà trên mọi máy Mac.                                                     |
| **5** | **Thiếu biến môi trường runtime**                        | **Trung bình** | App bị crash âm thầm khi khởi chạy.                             | Sử dụng Zod validate toàn bộ biến môi trường qua `src/env.ts` tại mỗi app ngay khi khởi động.                                                                                 |

---

## 4. Danh Sách Chi Tiết Cấu Trúc File Codebase

```text
/Users/lethanhba/workspace/app/nexus/
├── .editorconfig
├── .gitignore
├── .nvmrc
├── .prettierrc.json
├── eslint.config.js
├── Cargo.toml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── README.md
├── docs/
│   ├── architecture.md
│   ├── coding-standards.md
│   ├── implementation-plan.md
│   └── prerequisites.md
├── tooling/
│   └── scripts/
│       ├── check-env.sh
│       └── generate-icons.sh
├── packages/
│   ├── config/
│   │   ├── package.json
│   │   ├── tsconfig.base.json
│   │   ├── tsconfig.react.json
│   │   └── tailwind.preset.js
│   ├── shared/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── types/
│   │       │   └── app-registry.ts
│   │       └── constants/
│   │           └── app-info.ts
│   └── ui/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── components/
│           │   ├── LaunchpadLayout.tsx
│           │   ├── LaunchpadHeader.tsx
│           │   ├── AppGrid.tsx
│           │   ├── AppIconItem.tsx
│           │   ├── LaunchpadFooter.tsx
│           │   ├── PlaceholderView.tsx
│           │   ├── Badge.tsx
│           │   └── Button.tsx
│           └── styles/
│               └── base.css
└── apps/
    ├── nexus/
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── vite.config.ts           # Port 1420
    │   ├── index.html
    │   ├── .env.example
    │   ├── src/
    │   │   ├── env.ts
    │   │   ├── main.tsx
    │   │   ├── App.tsx
    │   │   └── index.css
    │   └── src-tauri/
    │       ├── Cargo.toml
    │       ├── tauri.conf.json      # com.thanhba.nexus (transparent: true)
    │       ├── capabilities/
    │       │   └── default.json
    │       ├── icons/
    │       └── src/
    │           ├── lib.rs           # window-vibrancy FullScreenUI
    │           └── main.rs
    ├── slackbot/
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── vite.config.ts           # Port 1421
    │   ├── index.html
    │   ├── .env.example
    │   ├── src/
    │   │   ├── env.ts
    │   │   ├── main.tsx
    │   │   ├── App.tsx
    │   │   └── index.css
    │   └── src-tauri/
    │       ├── Cargo.toml
    │       ├── tauri.conf.json      # com.thanhba.nexus.slackbot
    │       ├── capabilities/
    │       │   └── default.json
    │       ├── icons/
    │       └── src/
    │           ├── lib.rs
    │           └── main.rs
    └── github-report/
        ├── package.json
        ├── tsconfig.json
        ├── vite.config.ts           # Port 1422
        ├── index.html
        ├── .env.example
        ├── src/
        │   ├── env.ts
        │   ├── main.tsx
        │   ├── App.tsx
        │   └── index.css
        └── src-tauri/
            ├── Cargo.toml
            ├── tauri.conf.json      # com.thanhba.nexus.githubreport
            ├── capabilities/
            │   └── default.json
            ├── icons/
            └── src/
                ├── lib.rs
                └── main.rs
```
