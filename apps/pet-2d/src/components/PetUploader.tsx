import React, { useState } from 'react';
import { FolderPlus, FolderSearch, Check, AlertCircle, Plus } from 'lucide-react';
import { petApi } from '../services/pet-api';
import { PetItem } from '../types/pet';

interface PetUploaderProps {
  onPetImported: (pet: PetItem) => void;
}

export function PetUploader({ onPetImported }: PetUploaderProps) {
  const [folderPath, setFolderPath] = useState('');
  const [petName, setPetName] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedFiles, setScannedFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderPath.trim()) return;

    setIsScanning(true);
    setError(null);
    setSuccess(null);

    try {
      const files = await petApi.scanShimejiFolder(folderPath.trim());
      if (files.length === 0) {
        setError('Không tìm thấy file ảnh .png nào trong thư mục này');
      } else {
        setScannedFiles(files);
        setSuccess(`Hợp lệ! Tìm thấy ${files.length} file ảnh PNG Shimeji.`);
        if (!petName) {
          // Auto guess name from folder name
          const guessed = folderPath.trim().replace(/\/$/, '').split('/').pop() || '';
          setPetName(guessed.replace(/[-_]/g, ' '));
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    if (!folderPath.trim()) return;
    setIsScanning(true);
    setError(null);

    try {
      const newPet = await petApi.importCustomPet(
        folderPath.trim(),
        petName.trim() || 'Custom Pet',
      );
      onPetImported(newPet);
      setSuccess(`Đã thêm thành công nhân vật "${newPet.name}" vào Thư viện!`);
      setFolderPath('');
      setPetName('');
      setScannedFiles([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="relative shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#082620]/85 via-[#061c18]/90 to-[#031411]/95 border border-[#00c49a]/30 p-4.5 sm:p-5 shadow-2xl backdrop-blur-xl">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#00c49a]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2 relative z-10">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#00c49a]/35 bg-[#00c49a]/15 text-[#00c49a] shadow-xs">
          <FolderPlus className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#f0fdf9]">
            Thêm Nhân Vật Mới (Import Shimeji)
          </h3>
          <p className="text-[11px] text-[#5eead4]/70">
            Nạp thư mục ảnh Shimeji từ máy tính (hỗ trợ các gói tải từ Shimejis.xyz hoặc DeviantArt)
          </p>
        </div>
      </div>

      <p className="text-xs text-[#5eead4]/80 leading-relaxed mb-3.5 relative z-10">
        Nhập đường dẫn đến thư mục chứa các file ảnh Shimeji (
        <code className="text-[#00c49a] bg-[#00c49a]/15 px-1 py-0.5 rounded border border-[#00c49a]/30 font-mono text-[11px]">
          shime1.png
        </code>{' '}
        ...{' '}
        <code className="text-[#00c49a] bg-[#00c49a]/15 px-1 py-0.5 rounded border border-[#00c49a]/30 font-mono text-[11px]">
          shime13.png
        </code>
        ):
      </p>

      <form onSubmit={handleScan} className="space-y-3 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <input
            type="text"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            placeholder="Tên nhân vật (vd: Nezuko, Gojo)"
            className="bg-[#041613]/85 border border-[#00c49a]/25 rounded-xl px-3 py-2 text-xs text-[#f0fdf9] placeholder-[#5eead4]/40 focus:outline-none focus:border-[#00c49a] focus:ring-1 focus:ring-[#00c49a]/40 transition-colors"
          />

          <input
            type="text"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            placeholder="/Users/.../Downloads/MyShimeji/img"
            className="sm:col-span-2 bg-[#041613]/85 border border-[#00c49a]/25 rounded-xl px-3 py-2 text-xs text-[#f0fdf9] placeholder-[#5eead4]/40 focus:outline-none focus:border-[#00c49a] focus:ring-1 focus:ring-[#00c49a]/40 transition-colors"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="text-xs">
            {error && (
              <span className="flex items-center gap-1.5 text-red-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </span>
            )}
            {success && (
              <span className="flex items-center gap-1.5 text-[#00c49a]">
                <Check className="w-3.5 h-3.5" />
                <span>{success}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="submit"
              disabled={isScanning || !folderPath.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#061c18]/90 hover:bg-[#0c332b] disabled:opacity-40 text-xs font-medium text-[#f0fdf9] rounded-xl border border-[#00c49a]/25 hover:border-[#00c49a]/45 transition-all shadow-sm"
            >
              <FolderSearch className="w-3.5 h-3.5 text-[#00c49a]" />
              <span>{isScanning ? 'Đang quét...' : 'Kiểm tra thư mục'}</span>
            </button>

            {scannedFiles.length > 0 && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isScanning}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#00c49a] to-teal-500 hover:brightness-110 text-xs font-bold text-[#031411] rounded-xl shadow-md shadow-[#00c49a]/25 transition-all animate-in fade-in"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Lưu vào Thư viện</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
