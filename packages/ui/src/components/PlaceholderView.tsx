import React, { useState } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { APP_STATUS } from '@nexus/shared';
import { Box, RefreshCw, ArrowDownCircle, CheckCircle2, Download } from 'lucide-react';

export interface PlaceholderViewProps {
  appName: string;
  description: string;
  icon?: React.ReactNode;
  currentVersion?: string;
  newVersion?: string;
  downloadUrl?: string;
}

export function PlaceholderView({
  appName,
  description,
  icon,
  currentVersion = '0.1.0',
  newVersion = '0.2.0',
  downloadUrl,
}: PlaceholderViewProps) {
  const [displayedVersion, setDisplayedVersion] = useState(currentVersion);
  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'checking' | 'available' | 'updating' | 'updated'
  >(() => (currentVersion !== newVersion ? 'available' : 'idle'));

  const handleCheckUpdate = () => {
    setUpdateStatus('checking');
    setTimeout(() => {
      if (displayedVersion !== newVersion) {
        setUpdateStatus('available');
      } else {
        setUpdateStatus('updated');
        setTimeout(() => setUpdateStatus('idle'), 3000);
      }
    }, 1200);
  };

  const handleApplyUpdate = () => {
    setUpdateStatus('updating');
    setTimeout(() => {
      setDisplayedVersion(newVersion);
      setUpdateStatus('updated');
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
    }, 1800);
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-2xl select-none">
      <Card className="max-w-md w-full flex flex-col items-center text-center p-8 border-white/15">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-white/20 flex items-center justify-center mb-4 shadow-xl">
          {icon || <Box className="w-10 h-10 text-indigo-300" />}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">{appName}</h1>
        <p className="text-sm text-white/70 mb-4">{description}</p>

        {/* Thông tin phiên bản và trạng thái */}
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/10 text-white/80 border border-white/10">
            v{displayedVersion}
          </span>
          <Badge status={APP_STATUS.COMING_SOON} className="text-xs px-2.5 py-1" />
        </div>

        {/* Khung chức năng Cập nhật phiên bản */}
        <div className="w-full pt-4 border-t border-white/10 flex flex-col items-center space-y-3">
          {updateStatus === 'available' && (
            <div className="w-full p-3 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-left flex items-start space-x-3">
              <ArrowDownCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">
                  Có bản cập nhật mới v{newVersion}
                </p>
                <p className="text-[11px] text-white/60 mt-0.5">
                  Đồng bộ nâng cấp với hệ sinh thái Nexus
                </p>
              </div>
            </div>
          )}

          {updateStatus === 'updated' && (
            <div className="w-full p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-left flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-300 font-medium">
                Ứng dụng đang ở phiên bản mới nhất (v{displayedVersion})
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2 w-full justify-center">
            {updateStatus === 'available' || updateStatus === 'updating' ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleApplyUpdate}
                disabled={updateStatus === 'updating'}
                className="w-full text-xs py-2 flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-500/20"
              >
                {updateStatus === 'updating' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tải bản cập nhật...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Cập nhật ứng dụng (.dmg)</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="glass"
                size="sm"
                onClick={handleCheckUpdate}
                disabled={updateStatus === 'checking'}
                className="text-xs py-2 px-4 flex items-center space-x-1.5"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${updateStatus === 'checking' ? 'animate-spin text-indigo-400' : ''}`}
                />
                <span>
                  {updateStatus === 'checking' ? 'Đang kiểm tra...' : 'Kiểm tra phiên bản'}
                </span>
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
