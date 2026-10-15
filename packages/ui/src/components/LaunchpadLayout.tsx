import React from 'react';

export interface LaunchpadLayoutProps {
  children: React.ReactNode;
}

export function LaunchpadLayout({ children }: LaunchpadLayoutProps) {
  return (
    <div className="relative w-screen h-screen flex flex-col justify-between overflow-hidden rounded-[24px] border border-white/[0.12] bg-slate-950/40 backdrop-blur-3xl text-white select-none shadow-2xl shadow-black/50">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">{children}</div>
    </div>
  );
}
