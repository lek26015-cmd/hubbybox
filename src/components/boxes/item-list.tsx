'use client';

import type { ItemRow } from '@/lib/types';

interface ItemListProps {
  items: ItemRow[];
  isOwner: boolean;
  isLocked: boolean;
  isSelectionMode: boolean;
  selectedItemIds: Set<string>;
  onToggleSelection: (itemId: string) => void;
  onOpenMoveModal: (item: ItemRow) => void;
  onDeleteItem: (itemId: string) => void;
  onOpenFullScreenImage: (url: string) => void;
  onToggleSelectionMode: () => void;
}

export function ItemList({
  items, isOwner, isLocked,
  isSelectionMode, selectedItemIds,
  onToggleSelection, onOpenMoveModal, onDeleteItem,
  onOpenFullScreenImage, onToggleSelectionMode,
}: ItemListProps) {
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-bold text-sm text-slate-500">รายการสิ่งของ ({items.length})</h3>
        {items.length > 0 && isOwner && (
          <button
            onClick={onToggleSelectionMode}
            className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
              isSelectionMode
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-slate-400 hover:text-primary hover:bg-primary/5'
            }`}
          >
            {isSelectionMode ? 'เสร็จสิ้น' : 'เลือก'}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 px-6 border-2 border-dashed border-primary/20 rounded-3xl mt-2 bg-white/40 backdrop-blur-sm">
          <div className="w-20 h-20 bg-white border border-primary/10 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm text-primary">
            <i className="fa-solid fa-box-open text-[32px]" aria-hidden="true" />
          </div>
          <p className="font-bold text-xl text-slate-700 mb-2">กล่องว่างเปล่า</p>
          <p className="text-sm font-medium text-slate-500 max-w-[200px] mx-auto leading-relaxed">
            ใส่ของลงกล่องเลย!
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => {
            const isSelected = selectedItemIds.has(item.id);
            return (
              <li
                key={item.id}
                onClick={() => {
                  if (isSelectionMode) onToggleSelection(item.id);
                }}
                className={`bg-white/90 backdrop-blur-md border border-white/50 shadow-sm px-4 py-4 rounded-2xl flex items-center gap-4 hover:shadow-lg transition-all group overflow-hidden relative ${
                  isSelectionMode ? 'cursor-pointer active:scale-[0.98]' : ''
                } ${isSelected ? 'ring-2 ring-primary !bg-primary/5' : ''}`}
              >
                {isSelectionMode && (
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                      isSelected ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200'
                    }`}
                  >
                    {isSelected && <i className="fa-solid fa-check text-[10px]" />}
                  </div>
                )}
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden shadow-inner cursor-pointer active:scale-95 transition-transform ${
                    item.image_url ? '' : 'bg-primary/5 text-primary'
                  }`}
                  onClick={(e) => {
                    if (isSelectionMode) return;
                    e.stopPropagation();
                    if (item.image_url) onOpenFullScreenImage(item.image_url);
                  }}
                >
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <i className="fa-solid fa-box-open text-[20px]" aria-hidden="true" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <span className="font-bold text-slate-700 text-lg line-clamp-1 leading-tight">{item.name}</span>
                </div>
                {!isSelectionMode && isOwner && !isLocked && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMoveModal(item);
                      }}
                      className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all border border-slate-100 shadow-sm"
                    >
                      <i className="fa-solid fa-right-left text-[14px]" aria-hidden="true" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteItem(item.id);
                      }}
                      className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100 shadow-sm"
                    >
                      <i className="fa-solid fa-trash-can text-[14px]" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
