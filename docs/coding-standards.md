# Quy Chuẩn Lập Trình & Tiêu Chuẩn Kỹ Thuật (Coding Standards)

> **Tài liệu**: Quy chuẩn phát triển mã nguồn toàn dự án (Engineering Coding Standards & Guidelines)  
> **Dự án**: Nexus Workspace  
> **Áp dụng cho**: Toàn bộ lập trình viên, subagents và automated pipelines  
> **Phiên bản**: v1.0.0  
> **Trạng thái**: Hiệu lực bắt buộc (Mandatory)

---

## 1. Định Dạng Mã Nguồn, Linter & Style Guides

### 1.1. Cấu hình Prettier (`.prettierrc.json`)

Toàn bộ mã nguồn (TypeScript, JavaScript, JSON, CSS, Markdown) trong monorepo phải tuân theo cấu hình Prettier chung tại root:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### 1.2. ESLint Flat Config (`eslint.config.js`)

- Áp dụng cấu hình ESLint 9 Flat Config tại root và kế thừa qua các packages/apps.
- **Cấm triệt để kiểu dữ liệu `any`**: Bật `@typescript-eslint/no-explicit-any: error`. Nếu bắt buộc phải xử lý dữ liệu chưa rõ kiểu (ví dụ payload từ IPC hoặc webhook), phải sử dụng `unknown` và kiểm tra type guard bằng Zod hoặc TypeScript type predicates.
- **Không cho phép biến không sử dụng**: Cấu hình cảnh báo biến chưa dùng với ngoại lệ tiền tố gạch dưới `_` (`argsIgnorePattern: "^_"`).

### 1.3. TypeScript Strict Mode

Tất cả các project trong `apps/` và `packages/` bắt buộc phải kế thừa cấu hình từ `packages/config/tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "isolatedModules": true
  }
}
```

---

## 2. Quy Ước Cấu Trúc Thư Mục & Đặt Tên File

```text
nexus/
├── apps/
│   ├── [app-name]/                  # kebab-case (ví dụ: nexus, slackbot, github-report)
│   │   ├── src/
│   │   │   ├── components/          # PascalCase cho file component (ví dụ: LaunchpadGrid.tsx)
│   │   │   ├── hooks/               # kebab-case bắt đầu bằng use- (ví dụ: use-app-launcher.ts)
│   │   │   ├── utils/               # kebab-case (ví dụ: format-date.ts)
│   │   │   ├── types/               # kebab-case (ví dụ: app-state.ts)
│   │   │   ├── env.ts               # File validate biến môi trường runtime
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── src-tauri/               # Thư mục backend Rust của Tauri
│   │   ├── .env.example             # Bắt buộc commit vào git
│   │   ├── .env                     # Bắt buộc nằm trong .gitignore
│   │   ├── vite.config.ts
│   │   └── package.json
├── packages/
│   ├── config/                      # @nexus/config
│   ├── shared/                      # @nexus/shared
│   └── ui/                          # @nexus/ui
├── tooling/
│   └── scripts/                     # kebab-case cho shell scripts (check-env.sh, generate-icons.sh)
└── docs/                            # kebab-case cho tài liệu (architecture.md, coding-standards.md)
```

### Quy tắc đặt tên file:

1. **React Components**: `PascalCase.tsx` (ví dụ: `LaunchpadLayout.tsx`, `AppIconItem.tsx`).
2. **React Hooks**: `use-[feature-name].ts` (ví dụ: `use-app-launcher.ts`, `use-window-size.ts`).
3. **Modules / Utilities / Helpers**: `kebab-case.ts` (ví dụ: `app-registry.ts`, `ipc-client.ts`).
4. **CSS Files**: `kebab-case.css` (ví dụ: `base.css`, `index.css`).
5. **Shell Scripts**: `kebab-case.sh` (ví dụ: `check-env.sh`, `generate-icons.sh`).

---

## 3. Quy Chuẩn Đặt Tên Mã Nguồn (Naming Conventions)

### 3.1. Components & Props

- Tên Component: `PascalCase` (danh từ hoặc cụm danh từ mô tả đúng giao diện).
- Tên Props Interface: `[ComponentName]Props` (ví dụ: `LaunchpadHeaderProps`, `AppIconItemProps`).
- **Tuyệt đối KHÔNG sử dụng tiền tố `I`** cho Interface (dùng `AppMeta`, KHÔNG dùng `IAppMeta`).

```typescript
// ✅ ĐÚNG:
export interface AppIconItemProps {
  app: NexusAppMeta;
  isSelected?: boolean;
  onLaunch: (appId: string) => void;
}

export function AppIconItem({ app, isSelected = false, onLaunch }: AppIconItemProps) {
  // ...
}

// ❌ SAI:
export interface IAppIconItemProps { ... }
export const app_icon_item = () => { ... }
```

### 3.2. Custom Hooks

- Luôn bắt đầu bằng từ khóa `use` dạng `camelCase` (ví dụ: `useAppLauncher`, `useFrostedVibrancy`).
- Giá trị trả về phải là một Object được định kiểu rõ ràng hoặc một tuple có `as const`.

### 3.3. Enums vs String Literal Union Types (Quy định bắt buộc)

Trong toàn bộ hệ thống Nexus, **KHÔNG sử dụng TypeScript `enum` truyền thống**. Thay vào đó, bắt buộc sử dụng **`as const` Object kết hợp String Literal Union Type**.

#### Lý do kỹ thuật:

1. **Zero Runtime Overhead**: String union chỉ tồn tại ở thời điểm compile-time của TypeScript; khi chuyển sang JavaScript không sinh ra mã thừa (hỗ trợ Tree-Shaking 100%).
2. **Bảo toàn an toàn kiểu dữ liệu**: Numeric enum trong TypeScript tiềm ẩn lỗ hổng cho phép gán số bất kỳ mà không bị compiler chặn.
3. **Tương thích tuyệt đối với Tauri IPC & Serde**: String literal map chính xác 1:1 với Rust `#[serde(rename_all = "kebab-case")] enum` qua JSON IPC payload.

```typescript
// ✅ ĐÚNG CHUẨN NEXUS:
export const APP_CATEGORY = {
  ALL: 'all',
  DEV_TOOLS: 'dev-tools',
  MESSAGING: 'messaging',
  GAMES: 'games',
  UTILITIES: 'utilities',
} as const;

export type AppCategory = (typeof APP_CATEGORY)[keyof typeof APP_CATEGORY];

export const APP_STATUS = {
  READY: 'ready',
  COMING_SOON: 'coming-soon',
  MAINTENANCE: 'maintenance',
} as const;

export type AppStatus = (typeof APP_STATUS)[keyof typeof APP_STATUS];

// ❌ SAI (CẤM SỬ DỤNG):
export enum AppCategory {
  ALL,
  DEV_TOOLS,
}
```

### 3.4. Biến (Variables), Hàm (Functions) & Quy tắc Tiền Tố Boolean

- Tên biến & hàm: `camelCase`.
- **Biến Boolean bắt buộc phải có tiền tố thể hiện câu hỏi điều kiện**:
  - `is*`: `isReady`, `isVisible`, `isHovered`, `isTranslucent`
  - `has*`: `hasNotification`, `hasUpdate`, `hasError`
  - `can*`: `canLaunch`, `canMinimize`, `canDrag`
  - `should*`: `shouldAutoLaunch`, `shouldCloseOnSelect`
- **Quy tắc Event Handlers**:
  - Hàm xử lý sự kiện nội bộ: Tiền tố `handle*` (ví dụ: `handleAppClick`, `handleSearchChange`, `handleKeyDown`).
  - Callback props truyền từ ngoài vào: Tiền tố `on*` (ví dụ: `onAppLaunch`, `onFilterChange`, `onClose`).

### 3.5. Hằng Số (Constants)

- **Hằng số toàn cục** (Global Configuration Constants): `UPPER_SNAKE_CASE` (ví dụ: `DEFAULT_PORT`, `MAX_RECENT_APPS`, `MACOS_BUNDLE_PREFIX`).
- **Hằng số cục bộ trong hàm**: `camelCase` (ví dụ: `const matchedApps = ...`).

---

## 4. Quản Lý Biến Môi Trường (.env, .env.example)

### 4.1. Phân Tách Phạm Vi Biến Môi Trường

- **Biến Frontend (`VITE_*`)**:
  - Vite chỉ nạp và đóng gói các biến có tiền tố `VITE_` vào bundle client (`import.meta.env.VITE_*`).
  - **CẢNH BÁO AN NINH**: Tuyệt đối KHÔNG lưu secret keys, private API tokens, private webhook secrets vào các biến có tiền tố `VITE_` vì chúng sẽ bị lộ công khai trong mã nguồn client.
- **Biến Backend Rust / Build Time**:
  - Các biến không có tiền tố `VITE_` chỉ được đọc trong scripts Node.js hoặc backend Rust.

### 4.2. Chuẩn Hóa Cấu Trúc File `.env` & `.env.example`

Mỗi ứng dụng (`apps/nexus`, `apps/slackbot`, `apps/github-report`) đều phải duy trì cặp file:

#### 1. File mẫu commit lên git: `.env.example`

```bash
# ==============================================================================
# Nexus Hub Configuration Template
# ==============================================================================
VITE_APP_TITLE="Nexus"
VITE_APP_PORT=1420
VITE_ENABLE_VIBRANCY=true
VITE_DEFAULT_CATEGORY="all"
VITE_LOG_LEVEL="debug"
```

#### 2. File cấu hình thực tế: `.env`

- Chứa giá trị thực tế của developer trên máy local.
- **BẮT BUỘC nằm trong file `.gitignore` root**. Tuyệt đối không bao giờ commit `.env` lên Git repo.

### 4.3. Xác Thực Biến Môi Trường Khi Runtime (Runtime Validation)

Để ngăn chặn lỗi ứng dụng chạy ngầm do thiếu hoặc sai cấu hình biến môi trường, mỗi app phải xây dựng file `src/env.ts` sử dụng **Zod**:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_TITLE: z.string().min(1).default('Nexus'),
  VITE_APP_PORT: z.coerce.number().default(1420),
  VITE_ENABLE_VIBRANCY: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  VITE_DEFAULT_CATEGORY: z.enum(['all', 'dev-tools', 'messaging', 'games']).default('all'),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export const env = envSchema.parse(import.meta.env);
```

---

## 5. Lưu Trữ Dữ Liệu Cục Bộ & Bảo Mật Token Trên macOS

### 5.1. Phân Định Giữa Môi Trường Dev (.env) và Bản Release Của Người Dùng

- **Bản Release Cho Người Dùng Cuối**:
  - Người dùng tải bản release (`.app` / `.dmg`) về máy **hoàn toàn KHÔNG CẦN và KHÔNG DÙNG file `.env`**.
  - Người dùng cấu hình tài khoản, nhập token trực tiếp trên form giao diện (UI). Dữ liệu được app tự động lưu trên máy cục bộ của người đó (Local-First).
- **Môi Trường Phát Triển Của Developer**:
  - File `.env` / `.env.example` **CHỈ phục vụ cho lập trình viên** lúc code cục bộ để cấu hình cổng dev (`VITE_APP_PORT`), bật/tắt debug logs (`VITE_LOG_LEVEL`) hoặc cờ tính năng thử nghiệm.

### 5.2. Lưu Trữ Cài Đặt Thông Thường (Settings, Preferences, UI State)

- **Công nghệ chuẩn**: Sử dụng **`tauri-plugin-store`** (plugin chính thức từ Tauri Team).
- **Vị trí lưu trữ native trên macOS**:
  Tự động lưu vào file JSON tại thư mục chuẩn của hệ điều hành:  
  `~/Library/Application Support/<bundle-id>/settings.json`
- **Ví dụ phân vùng cho 3 apps**:
  - Nexus: `~/Library/Application Support/com.thanhba.nexus/settings.json`
  - SlackBot: `~/Library/Application Support/com.thanhba.nexus.slackbot/settings.json`
  - GitHub Report: `~/Library/Application Support/com.thanhba.nexus.githubreport/settings.json`
- **Mã nguồn mẫu sử dụng trong TypeScript**:
  ```typescript
  import { LazyStore } from '@tauri-apps/plugin-store';

  const store = new LazyStore('settings.json');

  // Lưu cấu hình người dùng
  await store.set('theme', 'dark');
  await store.set('refreshIntervalMinutes', 15);
  await store.save();

  // Đọc cấu hình
  const theme = await store.get<string>('theme');
  ```
- **Lưu ý**: Tuyệt đối **không sử dụng `localStorage`** của trình duyệt làm nơi lưu trữ chính vì WebKit có thể dọn cache hoặc reset bất ngờ khi nâng cấp hệ điều hành, đồng thời backend Rust không truy cập trực tiếp được.

### 5.3. Lưu Trữ Token & Bí Mật Nhạy Cảm (Secrets, Tokens, Passwords)

- **Công nghệ chuẩn**: Sử dụng **macOS Keychain** (Hệ thống Móc Khóa macOS) thông qua crate Rust **`keyring`**.
- **Mục tiêu bảo mật**:
  - Không bao giờ lưu token thô (plain-text) ra file JSON hoặc ổ đĩa.
  - Tận dụng bảo mật phần cứng Apple Secure Enclave trên chip Apple Silicon và mã hóa cấp hệ điều hành macOS.
- **Ví dụ áp dụng**:
  - GitHub Personal Access Token (PAT)
  - Slack Bot Token / Webhook Signing Secret
  - API Keys
- **Mã nguồn mẫu IPC trong Rust Backend**:
  ```rust
  use keyring::Entry;

  #[tauri::command]
  pub fn save_secure_secret(service: String, secret: String) -> Result<(), String> {
      let entry = Entry::new(&service, "nexus_user").map_err(|e| e.to_string())?;
      entry.set_password(&secret).map_err(|e| e.to_string())?;
      Ok(())
  }

  #[tauri::command]
  pub fn get_secure_secret(service: String) -> Result<String, String> {
      let entry = Entry::new(&service, "nexus_user").map_err(|e| e.to_string())?;
      entry.get_password().map_err(|e| e.to_string())
  }
  ```

---

## 6. Quy Chuẩn Lập Trình Backend Rust & Tauri v2

### 6.1. Naming Conventions trong Rust

- Functions, methods, modules, local variables: `snake_case` (ví dụ: `launch_mini_app`, `check_bundle_status`).
- Structs, Enums, Traits: `PascalCase` (ví dụ: `AppRegistry`, `TauriCommandResponse`).
- Constants & Statics: `SCREAMING_SNAKE_CASE` (ví dụ: `DEFAULT_WINDOW_WIDTH`).

### 6.2. Quản Trị Lỗi (Error Handling & Robustness)

- **CẤM SỬ DỤNG `.unwrap()` hoặc `.expect()` TRONG RUNTIME CODE**:
  Việc gọi `.unwrap()` khi gặp lỗi sẽ làm panic và crash toàn bộ tiến trình desktop app của người dùng.
- Sử dụng mô hình `Result<T, E>` tường minh kết hợp crate `thiserror`:

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Mini app with bundle ID '{0}' not found on macOS system")]
    AppNotFound(String),
    #[error("Failed to execute native launch command: {0}")]
    ProcessError(#[from] std::io::Error),
    #[error("Invalid capability permission: {0}")]
    PermissionDenied(String),
}

// Map sang Result<T, String> thân thiện khi trả về qua Tauri Command:
#[tauri::command]
pub fn launch_mini_app(bundle_id: String) -> Result<String, String> {
    internal_launch(&bundle_id).map_err(|err| err.to_string())
}
```

### 6.3. Bảo Mật Tauri v2 Capabilities

- Không bao giờ cấp quyền wildcard (`"*"`) trong file `capabilities/default.json`.
- Chỉ khai báo chính xác các lệnh IPC được phép gọi từ frontend webview tương ứng.

---

## 7. Tiêu Chí Kiểm Duyệt Pull Request (PR Review Checklist)

Mọi đóng góp mã nguồn mới bắt buộc phải thỏa mãn checklist sau trước khi được merge:

- [ ] Chạy `pnpm typecheck` thành công với 0 lỗi.
- [ ] Chạy `pnpm lint` thành công với 0 cảnh báo nghiêm trọng.
- [ ] Không có file `.env`, token, secret hoặc file rác trong commit.
- [ ] Biến môi trường mới (nếu có) đã được cập nhật tương ứng vào `.env.example` và `src/env.ts`.
- [ ] Token và secret nhạy cảm được lưu qua macOS Keychain (`keyring`), không lưu plain-text trong file json hay localStorage.
- [ ] Cài đặt người dùng được lưu qua `tauri-plugin-store` tại thư mục chuẩn `~/Library/Application Support/`.
- [ ] Đặt tên đúng chuẩn (kebab-case cho files, PascalCase cho Components, `is/has/can/should` cho booleans).
- [ ] Không sử dụng `enum` số; đã dùng `as const` hoặc string literal unions.
- [ ] Code Rust không chứa `.unwrap()` ở runtime context.
