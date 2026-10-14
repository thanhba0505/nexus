import React from 'react';
import { NexusAppMeta } from '@nexus/shared';
import { Modal } from './Modal';
import { Info, ExternalLink, Cpu, HardDrive, ShieldCheck } from 'lucide-react';

export interface AppInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: NexusAppMeta | null;
}

export function AppInfoModal({ isOpen, onClose, app }: AppInfoModalProps) {
  if (!app) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thông tin ứng dụng"
      subtitle={`Chi tiết định danh và cấu hình của ${app.name}`}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col space-y-5">
        {/* App Header Box */}
        <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div
            style={{
              background: `linear-gradient(135deg, ${app.accentColor}dd, ${app.accentColor}99)`,
            }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md border border-white/20"
          >
            <Info className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-white">{app.name}</h4>
            <p className="text-xs text-white/60">{app.description}</p>
            <div className="flex items-center space-x-2 mt-1.5">
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v{app.version || '0.1.0'}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {app.status}
              </span>
            </div>
          </div>
        </div>

        {/* Specs Details */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center space-x-1.5 text-white/50 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bundle Identifier</span>
            </div>
            <p className="font-mono text-white/90 truncate">{app.bundleId}</p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center space-x-1.5 text-white/50 mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Port Development</span>
            </div>
            <p className="font-mono text-white/90">
              {app.port > 0 ? `localhost:${app.port}` : 'Independent'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center space-x-1.5 text-white/50 mb-1">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Vị trí dữ liệu</span>
            </div>
            <p className="text-white/90 truncate">~/Library/Application Support/</p>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center space-x-1.5 text-white/50 mb-1">
              <Info className="w-3.5 h-3.5" />
              <span>Kiến trúc nền</span>
            </div>
            <p className="text-white/90">Tauri v2 + Rust + React 19</p>
          </div>
        </div>

        {/* Footer note */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-white/50">
          <span>Nexus macOS Ecosystem</span>
          <a
            href="https://github.com/thanhba0505/nexus"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </Modal>
  );
}
