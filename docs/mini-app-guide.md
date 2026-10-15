# Hướng Dẫn Phát Triển Mini App Chuẩn Trong Monorepo Nexus

> **Tài liệu**: Quy chuẩn & Hướng dẫn xây dựng Mini App (Desktop Mini-App Architecture Guide)  
> **Áp dụng cho**: Toàn bộ ứng dụng độc lập trong thư mục `apps/` (`github-report`, `slackbot`, v.v.)  
> **Thư viện dùng chung**: `@nexus/ui`, `@nexus/shared`, `@nexus/config`  
> **Mục tiêu**: Trải nghiệm macOS mượt mà, không chớp giật (Flicker-Free), triệt tiêu vòng lặp API (Loop-Free), và không bao giờ khóa luồng IPC (Beachball-Free).

---

## 1. Ba Vấn Đề Kinh Điển & Giải Pháp Kiến Trúc Nexus

| Vấn đề               | Hiện tượng                                       | Nguyên nhân gốc rễ                                                                          | Giải pháp chuẩn Nexus                                                                                                                                              |
| :------------------- | :----------------------------------------------- | :------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **API Loop**         | Gọi API vô tận, máy nóng, log tràn ngập          | Dùng `useEffect` phụ thuộc vào callback (`fetchData`) hoặc mảng/object mới tạo ở mỗi render | **Event-Driven**: Chỉ kích hoạt tác vụ từ sự kiện người dùng hoặc sự kiện `onReady` duy nhất của `useAppBootstrap`. Không dùng `useEffect` để chạy business logic. |
| **UI Flicker**       | Màn hình chớp trắng, layout giật cục khi tải lại | Xoá sạch dữ liệu cũ (`setData([])`), render lại `Skeleton` toàn phần mỗi lần bấm Refresh    | **Stale-While-Revalidate**: `useAsyncTask` giữ nguyên dữ liệu cũ, component `AsyncContent` giữ UI hiển thị (mờ nhẹ) kèm `LoadingBar` mảnh ở mép trên.              |
| **Beachball Cursor** | Chuột xoay 7 màu của macOS bị treo               | Chạy lệnh shell CLI (`gh`, `claude`, `osascript`) đồng bộ trên luồng IPC của Tauri          | **Async Backend**: Mọi lệnh Rust là `async fn` + `tauri::async_runtime::spawn_blocking(...)`.                                                                      |

---

## 2. Các Thành Phần Nền Tảng Trong `@nexus/ui`

Mọi mini app trong monorepo Nexus bắt buộc kế thừa bộ công cụ có sẵn từ `@nexus/ui`:

```text
packages/ui/
├── components/
│   ├── MiniAppShell.tsx        # Khung ứng dụng chuẩn: Header -> Main -> Footer + Splash & Overlays
│   ├── MiniAppHeader.tsx       # Titlebar Overlay macOS (an toàn 76px Traffic Lights, data-tauri-drag-region)
│   ├── MiniAppStatusBar.tsx    # Thanh trạng thái 28px dưới chân trang
│   ├── AppSplashScreen.tsx     # Màn hình khởi động tối giản (Glowing Icon + Progress bar)
│   ├── AsyncContent.tsx        # Bộ điều phối hiển thị chống chớp giật layout
│   └── Loading.tsx             # Skeleton, LoadingBar, Spinner
└── hooks/
    ├── use-async-task.ts       # Quản lý task IPC: latest-wins, in-flight dedupe, stale-while-revalidate
    ├── use-app-bootstrap.ts    # Khởi động tuần tự 1 lần duy nhất (StrictMode-safe), phát sự kiện onReady
    ├── use-hotkeys.ts          # Đăng ký phím tắt toàn cục 1 listener, nhận diện input/textarea
    ├── use-latest-ref.ts       # Ổn định reference tránh effect re-run
    └── use-transient-value.ts  # Trạng thái tự hủy sau t (ms) cho thông báo ngắn & nút copy
```

---

## 3. Quy Trình 4 Bước Xây Dựng Một Mini App Mới

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

## 4. Bảng Kiểm Tra Chất Lượng (Quality Checklist)

Trước khi gửi PR hoặc release bất kỳ Mini App nào, bắt buộc kiểm tra các tiêu chí sau:

- [ ] **Không vòng lặp API**: Không có `useEffect` nào nhận hàm `fetch` hay `generate` trong dependency array.
- [ ] **Không chớp giật giao diện**: Bấm `⌘R` khi app đã có dữ liệu, danh sách cũ vẫn hiển thị mờ nhẹ kèm thanh `LoadingBar` mảnh, không bị nhảy giật khung xương Skeleton.
- [ ] **Khởi động một lần (StrictMode-safe)**: Màn hình splash nạp tuần tự 0% $\rightarrow$ 100%, không bị reset progress 2 lần ở chế độ React StrictMode.
- [ ] **Tương tác liên tục**: Khi đang quét dữ liệu hoặc AI đang suy nghĩ, người dùng vẫn bấm mở được Modal Settings (`⌘,`) và cuộn danh sách bình thường.
- [ ] **Backend Rust Async**: Toàn bộ `Command::new` hoặc AppleScript chạy qua `tauri::async_runtime::spawn_blocking`, không làm xuất hiện con trỏ xoay 7 màu của macOS.
