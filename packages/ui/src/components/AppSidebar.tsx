import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export interface AppSidebarTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  badge?: string | number;
}

export interface AppSidebarProps {
  tabs: AppSidebarTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  /** Tiêu đề của thanh bên khi mở rộng (mặc định: 'Điều Hướng') */
  title?: string;
  /** Cho phép thu gọn/mở rộng (mặc định: true) */
  collapsible?: boolean;
  /** Slot nội dung bổ sung ở đầu thanh bên */
  headerSlot?: React.ReactNode;
  /** Slot nội dung bổ sung ở chân thanh bên (widget, status...) */
  footerSlot?: React.ReactNode;
  className?: string;
}

export function AppSidebar({
  tabs,
  activeTab,
  onTabChange,
  isExpanded: controlledExpanded,
  onToggleExpand,
  title = 'Điều Hướng',
  collapsible = true,
  headerSlot,
  footerSlot,
  className,
}: AppSidebarProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded((prev) => !prev);
    }
  };

  return (
    <aside
      className={twMerge(
        clsx(
          'relative flex flex-col shrink-0 border-r border-[var(--app-tone-3)]/20 bg-[var(--app-tone-5)]/90 backdrop-blur-md z-20 transition-all duration-300 ease-in-out',
          isExpanded ? 'w-56' : 'w-16',
          className,
        ),
      )}
    >
      {/* Top Section: Toggle button / Header */}
      {collapsible ? (
        <div className="px-2 py-3 border-b border-[var(--app-tone-3)]/15 shrink-0 flex items-center h-14">
          <button
            onClick={handleToggle}
            data-no-drag
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className="group relative flex items-center w-full h-10 rounded-xl text-[var(--app-tone-2)] hover:text-[var(--app-tone-1)] hover:bg-[var(--app-tone-3)]/15 transition-colors"
            title={isExpanded ? 'Thu gọn thanh bên' : 'Mở rộng thanh bên'}
          >
            {/* Fixed Icon Anchor (X=32px zero-jitter) */}
            <div className="w-12 h-10 shrink-0 flex items-center justify-center">
              {isExpanded ? (
                <PanelLeftClose className="w-4 h-4 text-[var(--app-tone-3)] shrink-0" />
              ) : (
                <PanelLeftOpen className="w-4 h-4 text-[var(--app-tone-3)] shrink-0" />
              )}
            </div>

            {/* Smooth Title Slide-out */}
            <div
              className={`flex items-center flex-1 min-w-0 pr-2.5 overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded
                  ? 'opacity-100 max-w-[160px] translate-x-0'
                  : 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--app-tone-2)] truncate">
                {title}
              </span>
            </div>

            {/* Floating Tooltip in Collapsed Mode */}
            {!isExpanded && (
              <div className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg border border-[var(--app-tone-3)]/40 bg-[var(--app-tone-5)]/95 px-2.5 py-1 text-xs font-medium text-[var(--app-tone-1)] shadow-2xl backdrop-blur-xl opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
                Mở rộng thanh bên
              </div>
            )}
          </button>
        </div>
      ) : (
        headerSlot && (
          <div className="px-2 py-3 border-b border-[var(--app-tone-3)]/15 shrink-0">
            {headerSlot}
          </div>
        )
      )}

      {/* Sidebar Navigation Items - overflow-visible ensures no horizontal scrollbar */}
      <div className="flex-1 px-2 py-3 space-y-1.5 overflow-visible">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <div key={tab.id} className="relative">
              <button
                onClick={() => onTabChange(tab.id)}
                title={tab.label}
                data-no-drag
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                className={clsx(
                  'group relative flex items-center w-full h-11 rounded-xl transition-all',
                  isActive
                    ? 'bg-[var(--app-tone-3)] text-[var(--app-tone-5)] font-bold shadow-[0_2px_12px_rgba(var(--app-tone-3-rgb),0.45)]'
                    : 'text-[var(--app-tone-2)] hover:bg-[var(--app-tone-3)]/15 hover:text-[var(--app-tone-1)]',
                )}
              >
                {/* Fixed Icon Anchor (X=32px) */}
                <div className="w-12 h-11 shrink-0 flex items-center justify-center">
                  <Icon
                    className={clsx(
                      'w-4 h-4 shrink-0 transition-colors',
                      isActive
                        ? 'text-[var(--app-tone-5)] stroke-[2.5]'
                        : 'text-[var(--app-tone-3)]',
                    )}
                  />
                </div>

                {/* Smooth Title Slide-out */}
                <div
                  className={`flex items-center justify-between flex-1 min-w-0 pr-2.5 overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? 'opacity-100 max-w-[160px] translate-x-0'
                      : 'opacity-0 max-w-0 -translate-x-2 pointer-events-none'
                  }`}
                >
                  <span
                    className={clsx(
                      'text-xs font-medium truncate tracking-tight',
                      isActive ? 'text-[var(--app-tone-5)] font-bold' : 'text-[var(--app-tone-1)]',
                    )}
                  >
                    {tab.label}
                  </span>
                  {tab.badge !== undefined && (
                    <span
                      className={clsx(
                        'text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0',
                        isActive
                          ? 'bg-[var(--app-tone-5)]/20 text-[var(--app-tone-5)]'
                          : 'bg-[var(--app-tone-3)]/15 text-[var(--app-tone-2)] border border-[var(--app-tone-3)]/25',
                      )}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>

                {/* Floating Tooltip in Collapsed Mode */}
                {!isExpanded && (
                  <div className="pointer-events-none absolute left-full ml-3 z-50 flex items-center gap-2 whitespace-nowrap rounded-lg border border-[var(--app-tone-3)]/40 bg-[var(--app-tone-5)]/95 px-2.5 py-1 text-xs font-medium text-[var(--app-tone-1)] shadow-2xl backdrop-blur-xl opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
                    <span>{tab.label}</span>
                    {tab.shortcut && (
                      <span className="text-[10px] font-mono text-[var(--app-tone-3)] bg-[var(--app-tone-3)]/15 px-1 py-0.5 rounded border border-[var(--app-tone-3)]/25">
                        {tab.shortcut}
                      </span>
                    )}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Section: Optional footer slot */}
      {footerSlot && (
        <div className="p-2 border-t border-[var(--app-tone-3)]/15 shrink-0">{footerSlot}</div>
      )}
    </aside>
  );
}
