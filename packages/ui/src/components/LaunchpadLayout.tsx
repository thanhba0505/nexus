import React from 'react';

export interface LaunchpadLayoutProps {
  children: React.ReactNode;
}

export function LaunchpadLayout({ children }: LaunchpadLayoutProps) {
  return (
    <div className="relative w-screen h-screen flex flex-col justify-between overflow-hidden rounded-[14px] border border-[var(--app-tone-3,#6366f1)]/30 theme-nexus nexus-ambient-canvas text-white select-none">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[var(--app-tone-3,#6366f1)]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[var(--app-tone-2,#a5b4fc)]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">{children}</div>
    </div>
  );
}
