# Hướng Dẫn Phát Triển Mini App Chuẩn Trong Monorepo Nexus

> **Tài liệu**: Quy chuẩn & Hướng dẫn xây dựng Mini App (Desktop Mini-App Architecture Guide)  
> **Áp dụng cho**: Toàn bộ ứng dụng độc lập trong thư mục `apps/` (`github-report`, `slackbot`, v.v.)  
> **Thư viện dùng chung**: `@nexus/ui`, `@nexus/shared`, `@nexus/config`  
> **Quy chuẩn thiết kế UI/UX**: 👉 [`docs/ui-ux-design-system.md`](file:///Users/lethanhba/workspace/app/nexus/docs/ui-ux-design-system.md)  
> **Mục tiêu**: Trải nghiệm macOS mượt mà chuẩn native, luồng dữ liệu hướng sự kiện nhất quán (Event-Driven), hiển thị chuyển tiếp ổn định (Stale-While-Revalidate), và tối ưu hóa xử lý nền bất đồng bộ (Non-blocking IPC).

---

## 1. Ba Nguyên Lý Thiết Kế Nền Tảng Trong Nexus

| Thách thức kỹ thuật                                   | Tác động giao diện / Hiệu năng                     | Nguyên nhân gốc rễ                                                                      | Giải pháp chuẩn Nexus                                                                                                                                           |
| :---------------------------------------------------- | :------------------------------------------------- | :-------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vòng lặp yêu cầu dữ liệu (Infinite Request Loop)**  | Gửi request liên tục, tiêu tốn tài nguyên CPU/mạng | Sử dụng `useEffect` phụ thuộc vào hàm callback hoặc object/array tái tạo sau mỗi render | **Event-Driven**: Chỉ kích hoạt tác vụ từ sự kiện người dùng hoặc sự kiện `onReady` của `useAppBootstrap`. Không dùng `useEffect` để kích hoạt logic nghiệp vụ. |
| **Chuyển dịch bố cục khi tải lại (Layout Shift)**     | Mất dữ liệu cũ và nhảy layout khi nạp lại dữ liệu  | Xóa trắng dữ liệu (`setData([])`) và dựng lại `Skeleton` toàn phần trong lúc re-fetch   | **Stale-While-Revalidate**: `useAsyncTask` duy trì dữ liệu hiện có, `AsyncContent` giữ layout hiển thị mượt mà kèm thanh `LoadingBar` thanh mảnh ở mép trên.    |
| **Khóa luồng giao diện (Main / IPC Thread Blocking)** | Ứng dụng ngưng phản hồi tạm thời                   | Thực thi lệnh shell CLI (`gh`, `claude`, `osascript`) đồng bộ trực tiếp trên luồng IPC  | **Non-blocking Worker**: Mọi lệnh Rust là `async fn` kết hợp `tauri::async_runtime::spawn_blocking(...)`.                                                       |

---

## 2. Các Thành Phần Nền Tảng Trong `@nexus/ui`

Mọi mini app trong monorepo Nexus bắt buộc kế thừa bộ công cụ có sẵn từ `@nexus/ui`:

```text
packages/ui/
├── components/
│   ├── AppLayout.tsx           # Khung ứng dụng 2 cột chuẩn mực: Header -> Sidebar -> Main -> Footer
│   ├── AppSidebar.tsx          # Thanh điều hướng thu gọn zero-jitter (w-16 -> w-56), icon anchor X=32px
│   ├── ContentCard.tsx         # Thẻ kính mờ acrylic 5-tone, tiêu đề, actions, padding đối xứng p-4.5 sm:p-5
│   ├── AppButton.tsx           # Nút bấm chuẩn macOS (primary Tone 3, secondary, glass, ghost, danger)
│   ├── AppTabs.tsx             # Bộ chuyển tab phong cách macOS Native (segmented, pills)
│   ├── AppSelect.tsx           # Dropdown select macOS Dark Glassmorphism thay thế hoàn toàn <select> native
│   ├── MiniAppShell.tsx        # Khung ứng dụng wrapper: Header -> Main -> Footer + Splash & Overlays
│   ├── MiniAppHeader.tsx       # Titlebar Overlay macOS (an toàn 76px Traffic Lights, data-tauri-drag-region)
│   ├── MiniAppStatusBar.tsx    # Thanh trạng thái chân trang (h-7, dóng thẳng hàng mép card với px-4.5 sm:px-5)
│   ├── AppSplashScreen.tsx     # Màn hình khởi động tối giản (Glowing Icon + Progress bar)
│   ├── AsyncContent.tsx        # Điều phối hiển thị chuyển tiếp mượt mà (Stale-While-Revalidate)
│   ├── Badge.tsx               # Huy hiệu trạng thái viền mỏng 1px ngâm màu thương hiệu
│   ├── Modal.tsx               # Cửa sổ hội thoại nổi backdrop blur acrylic
│   ├── Tooltip.tsx             # Chú thích nổi desktop với phím tắt kbd
│   └── Loading.tsx             # Skeleton, LoadingBar, Spinner
└── hooks/
    ├── use-async-task.ts       # Quản lý task IPC: latest-wins, in-flight dedupe, stale-while-revalidate
    ├── use-app-bootstrap.ts    # Khởi động tuần tự 1 lần duy nhất (StrictMode-safe), phát sự kiện onReady
    ├── use-hotkeys.ts          # Đăng ký phím tắt toàn cục 1 listener, nhận diện input/textarea
    ├── use-latest-ref.ts       # Ổn định reference tránh effect re-run
    └── use-transient-value.ts  # Trạng thái tự hủy sau t (ms) cho thông báo ngắn & nút copy
```

---

## 3. Quy Chuẩn Kiến Trúc Bố Cục 2 Cột & Nguyên Tắc Thiết Kế Giao Diện

### Cấu Trúc Bố Cục 2 Cột Thẳng Hàng Trục Dọc

Mọi mini app được cấu tạo từ bộ khung chuẩn `AppLayout` kết hợp `AppSidebar` và `ContentCard`:

```tsx
import {
  AppLayout,
  AppSidebar,
  ContentCard,
  AppButton,
  AppSelect,
  MiniAppHeader,
  MiniAppStatusBar,
} from '@nexus/ui';

export function MiniAppView() {
  return (
    <AppLayout
      theme="slackbot" // Tự động inject biến CSS 5-Tone của miniapp
      header={
        <MiniAppHeader
          leftSlot={<span className="text-xs font-semibold">SlackBot Desktop</span>}
          rightSlot={
            <AppButton size="sm" variant="glass">
              Cài đặt
            </AppButton>
          }
        />
      }
      sidebar={
        <AppSidebar
          items={navigationItems}
          activeId={currentTab}
          onSelect={(id) => setCurrentTab(id)}
        />
      }
      footer={<MiniAppStatusBar message="Kết nối Socket Mode ổn định" />}
    >
      {/* Vùng <main> đón nhận trực tiếp các ContentCard */}
      <ContentCard
        title="Trạng Thái Hoạt Động"
        badge={<Badge variant="success">Online</Badge>}
        actions={
          <AppButton size="sm" variant="primary">
            Làm mới
          </AppButton>
        }
      >
        <p className="text-xs text-[var(--app-tone-1)]/80">Nội dung thẻ chính...</p>
      </ContentCard>
    </AppLayout>
  );
}
```

### Quy Tắc Khóa Chết Lưới Đệm (Mathematical Padding Grid & Anti-Double-Padding)

1. **Lưới đệm `<main>` cố định**: Vùng nội dung `<main>` có class cố định `p-4.5 sm:p-5 space-y-4 overflow-y-auto custom-scrollbar` (tương đương $18\text{px} - 20\text{px}$).
2. **Nghiêm cấm Double-Padding**: Tuyệt đối không bọc thêm bất kỳ thẻ `div` nào có padding (`p-3`, `p-4`, `px-5`) bên trong `<main>`. Mọi thẻ `ContentCard` phải là con trực tiếp trong luồng để khoảng cách từ mép cửa sổ luôn đồng nhất toán học.
3. **Thẳng hàng trục dọc chân trang (Vertical Footer Alignment)**: `MiniAppStatusBar` được cấu hình `px-4.5 sm:px-5` để icon và text ở thanh trạng thái dóng thẳng hàng tuyệt đối 100% với mép của thẻ `ContentCard` phía trên.
4. **Cân bằng đệm dọc trong `ContentCard`**: Dùng hairline divider `border-b border-[var(--app-tone-3)]/15 pb-2.5 mb-3` khi có Header/Actions và Empty State căn giữa với `py-7 text-center` nhằm loại bỏ hiện tượng đỉnh card dày hơn đáy.

### Quy Tắc Giới Hạn Đóng Khung (Anti-Nesting Rule — Tối Đa 1 Lớp Khung)

- **Cấm đóng hộp lồng hộp (No Box-in-a-Box)**: Bên trong một thẻ chính `ContentCard`, tối đa chỉ được phép có **thêm 1 lớp block có khung viền** duy nhất (ví dụ: khối Preview tin nhắn, khối Terminal/Log, hoặc Code snippet).
- **Phẳng hóa tiêu đề (Flattening)**: Tiêu đề nhóm, bộ lọc, metadata phải được trình bày dưới dạng text header phẳng thanh thoát (`text-xs font-semibold text-[var(--app-tone-1)]`), không được bọc vào một container có viền thứ hai.

### Quy Chuẩn Dropdown `AppSelect`

- **Thay thế hoàn toàn `<select>` HTML**: Tuyệt đối không dùng `<select>` native OS. Luôn dùng `AppSelect` từ `@nexus/ui`.
- **Nền phẳng đơn sắc Tone 5**: Popover và nút trigger dùng `bg-[var(--app-tone-5,#070714)] border border-[var(--app-border)]`, không dùng gradient dọc chống hiện tượng loang màu.
- **Option Items phẳng tương phản cao**: Không có viền ô. Selected dùng nền Tone 3 đặc 100% `bg-[var(--app-tone-3)] text-white font-semibold shadow-xs`. Hover dùng nền Tone 3 mờ 30% `bg-[var(--app-tone-3)]/30 text-white font-medium`.

---

## 4. Quy Trình 4 Bước Xây Dựng Một Mini App Mới

### Bước 1: Khai báo lớp API kiểu dữ liệu tĩnh (`src/services/<app>-api.ts`)

Đóng gói toàn bộ lệnh `invoke` của Tauri vào một object duy nhất:

```typescript
// apps/my-app/src/services/my-app-api.ts
import { invoke } from '@tauri-apps/api/core';
import type { UserProfile, ItemData } from '../types';

export const myAppApi = {
  checkEnv: () => invoke<UserProfile>('check_env'),
  fetchItems: (filter: string) => invoke<ItemData[]>('fetch_items', { filter }),
  processItem: (id: string) => invoke<void>('process_item', { id }),
};
```

### Bước 2: Xây dựng Hook nghiệp vụ hướng sự kiện (`src/hooks/use-<feature>.ts`)

Sử dụng `useAsyncTask` để quản lý các tác vụ bất đồng bộ. **Tuyệt đối không viết `useEffect` tự gọi fetch**:

```typescript
// apps/my-app/src/hooks/use-my-feature.ts
import { useCallback, useMemo, useRef } from 'react';
import { useAsyncTask, useLatestRef, useTransientValue } from '@nexus/ui';
import { myAppApi } from '../services/my-app-api';

export function useMyFeature() {
  const [notice, showNotice] = useTransientValue<string>(2500);
  const generationRef = useRef(0);

  // 1. Khai báo tác vụ IPC với useAsyncTask
  const itemsTask = useAsyncTask((filter: string) => myAppApi.fetchItems(filter));

  // 2. Hàm kích hoạt nghiệp vụ (Event Handler)
  const loadData = useCallback(
    async (filter: string) => {
      const gen = ++generationRef.current;
      const data = await itemsTask.run(filter);

      // Latest-wins: bỏ qua nếu đã có lần gọi mới hơn
      if (!data || gen !== generationRef.current) return;
    },
    [itemsTask.run],
  );

  return {
    itemsTask,
    items: itemsTask.data,
    isLoading: itemsTask.isRunning,
    loadData,
    notice,
    showNotice,
  };
}
```

### Bước 3: Tổ chức Component hiển thị với `AsyncContent`

Không tự viết logic kiểm tra `if (loading) return <Skeleton />`. Sử dụng `AsyncContent`:

```tsx
import { AsyncContent, Skeleton } from '@nexus/ui';

export function ItemsList({ items, isLoading, error }: Props) {
  return (
    <AsyncContent
      isLoading={isLoading}
      hasData={Boolean(items && items.length > 0)}
      error={error}
      skeleton={
        <div className="space-y-2 p-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      }
      empty={<p className="text-white/40 p-4">Chưa có dữ liệu.</p>}
    >
      <ul className="space-y-2 p-4">
        {items?.map((item) => (
          <li key={item.id} className="p-2 rounded bg-white/5">
            {item.title}
          </li>
        ))}
      </ul>
    </AsyncContent>
  );
}
```

### Bước 4: Lắp ráp vào `MiniAppShell` và `useAppBootstrap` tại `App.tsx`

`App.tsx` chỉ đóng vai trò ghép nối, giữ mã nguồn tinh gọn (<120 dòng):

```tsx
// apps/my-app/src/App.tsx
import { useState } from 'react';
import {
  MiniAppShell,
  MiniAppHeader,
  MiniAppStatusBar,
  AppSplashScreen,
  useAppBootstrap,
  useHotkeys,
} from '@nexus/ui';
import { useMyFeature } from './hooks/use-my-feature';

export default function App() {
  const [filter, setFilter] = useState('all');
  const feature = useMyFeature();

  // Khởi động 1 lần duy nhất: nạp settings -> phát onReady
  const boot = useAppBootstrap({
    steps: [
      {
        label: 'Nạp cài đặt...',
        run: async () => {
          /* nạp config */
        },
      },
      {
        label: 'Kiểm tra hệ thống...',
        run: async () => {
          /* check env */
        },
      },
    ],
    onReady: () => void feature.loadData(filter),
  });

  // Phím tắt toàn cục
  useHotkeys(
    {
      'mod+r': () => void feature.loadData(filter),
    },
    { enabled: boot.isReady },
  );

  return (
    <MiniAppShell
      splash={
        !boot.isReady && (
          <AppSplashScreen
            icon={<div className="text-sky-400">⚡</div>}
            title="My Mini App"
            progress={boot.progress}
            message={boot.message}
            isExiting={boot.phase === 'exiting'}
          />
        )
      }
      header={
        <MiniAppHeader
          leftSlot={<span className="text-xs font-semibold">My Mini App</span>}
          rightSlot={<button onClick={() => void feature.loadData(filter)}>Quét lại</button>}
        />
      }
      footer={<MiniAppStatusBar message="Sẵn sàng" />}
    >
      <ItemsList
        items={feature.items}
        isLoading={feature.isLoading}
        error={feature.itemsTask.error}
      />
    </MiniAppShell>
  );
}
```

---

## 5. Bảng Kiểm Tra Chất Lượng (Quality Checklist)

Trước khi gửi PR hoặc release bất kỳ Mini App nào, bắt buộc kiểm tra các tiêu chí sau:

- [ ] **Bố cục 2 cột chuẩn mực**: Sử dụng `AppLayout` + `AppSidebar` (`w-16` / `w-56`), `<main>` có padding `p-4.5 sm:p-5`, và footer `MiniAppStatusBar` có `px-4.5 sm:px-5` thẳng hàng tuyệt đối với mép thẻ `ContentCard`.
- [ ] **Anti-Double-Padding**: Vùng `<main>` không chứa container bọc ngoài có padding thừa (`p-3`, `p-4`); các thẻ `ContentCard` là con trực tiếp trong luồng.
- [ ] **Anti-Nesting (Giới hạn đóng khung)**: Bên trong thẻ chính `ContentCard`, tối đa chỉ có thêm 1 lớp block có khung viền; tiêu đề nhóm và metadata được phẳng hóa thành text header thanh lịch.
- [ ] **Zero Native `<select>`**: 100% dropdown trong ứng dụng sử dụng component `AppSelect` từ `@nexus/ui`, cấm dùng thẻ HTML `<select>` native.
- [ ] **Zero Tailwind Preflight Border Leak**: Không có đường viền xám sáng `#e5e7eb` ngoài ý muốn; mọi viền đều tuân thủ `--app-border` ngâm màu thương hiệu Tone 3.
- [ ] **Luồng dữ liệu Event-Driven**: Không đặt hàm fetch hoặc trigger logic nghiệp vụ bất đồng bộ vào dependency array của `useEffect`.
- [ ] **Bố cục hiển thị ổn định**: Khi làm mới dữ liệu (Refresh/Re-fetch), dữ liệu hiện tại vẫn hiển thị kèm thanh `LoadingBar`, không làm nhảy bố cục hoặc mất vị trí cuộn.
- [ ] **Khởi động một lần (StrictMode-safe)**: Màn hình splash nạp tuần tự 0% $\rightarrow$ 100%, an toàn với React StrictMode.
- [ ] **Tương tác liên tục**: Khi tác vụ nền đang chạy, người dùng vẫn tương tác được với giao diện (mở Cài đặt, cuộn trang).
- [ ] **Backend Rust Async**: Toàn bộ tác vụ I/O nặng (CLI, AppleScript, Network) chạy qua `tauri::async_runtime::spawn_blocking`, bảo toàn độ phản hồi tức thì của cửa sổ.
