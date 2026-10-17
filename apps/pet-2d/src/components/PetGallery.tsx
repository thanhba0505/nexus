import { PetItem } from '../types/pet';
import { Check, Trash2, Sparkles, Layers } from 'lucide-react';

interface PetGalleryProps {
  pets: PetItem[];
  activePetId: string;
  onSelectPet: (petId: string) => void;
  onDeletePet: (petId: string) => void;
}

export function PetGallery({ pets, activePetId, onSelectPet, onDeletePet }: PetGalleryProps) {
  return (
    <div className="relative shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#082620]/85 via-[#061c18]/90 to-[#031411]/95 border border-[#00c49a]/30 p-4.5 sm:p-5 shadow-2xl backdrop-blur-xl">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#00c49a]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#00c49a]/35 bg-[#00c49a]/15 text-[#00c49a] shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#f0fdf9]">
              Thư Viện Nhân Vật (Pet Gallery)
            </h3>
            <p className="text-[11px] text-[#5eead4]/70">
              Chọn nhân vật đồng hành hiển thị ngoài desktop
            </p>
          </div>
        </div>
        <span className="text-xs text-[#00c49a] font-mono bg-[#00c49a]/15 border border-[#00c49a]/30 px-2.5 py-1 rounded-lg">
          {pets.length} nhân vật sẵn có
        </span>
      </div>

      {/* Pet Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 relative z-10">
        {pets.map((pet) => {
          const isActive = pet.id === activePetId;
          return (
            <div
              key={pet.id}
              onClick={() => onSelectPet(pet.id)}
              className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
                isActive
                  ? 'bg-[#0e3d34]/95 border-[#00c49a]/60 shadow-xl shadow-[#00c49a]/20'
                  : 'bg-[#041613]/80 hover:bg-[#082620] border-[#00c49a]/20 hover:border-[#00c49a]/45'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                {/* Pet Animated Preview Box */}
                <div className="w-14 h-14 rounded-xl bg-[#031411] border border-[#00c49a]/25 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-inner group-hover:scale-105 group-hover:border-[#00c49a]/50 transition-all">
                  <img
                    src={pet.previewUrl}
                    alt={pet.name}
                    className="w-11 h-11 object-contain filter drop-shadow"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4
                      className={`text-xs font-semibold truncate transition-colors ${
                        isActive ? 'text-[#00c49a]' : 'text-[#f0fdf9] group-hover:text-[#00c49a]'
                      }`}
                    >
                      {pet.name}
                    </h4>
                    {pet.isCustom && (
                      <span className="text-[9px] bg-[#00c49a]/20 text-[#00c49a] border border-[#00c49a]/35 px-1.5 py-0.2 rounded font-mono shrink-0">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#5eead4]/80 line-clamp-2 leading-tight">
                    {pet.description}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#00c49a]/15">
                <span className="flex items-center gap-1 text-[10px] text-[#2dd4bf]/70 font-mono">
                  <Layers className="w-3 h-3 text-[#2dd4bf]/60" />
                  <span>{pet.frameCount} frames</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {pet.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePet(pet.id);
                      }}
                      className="p-1 rounded-lg hover:bg-red-500/20 text-[#5eead4]/60 hover:text-red-400 transition-colors"
                      title="Xóa nhân vật này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {isActive ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#031411] bg-[#00c49a] px-2.5 py-1 rounded-lg shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Đang chọn</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#5eead4]/80 hover:text-[#f0fdf9] px-2 py-1 rounded-lg group-hover:bg-[#00c49a]/15 transition-colors">
                      Chọn dùng
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
