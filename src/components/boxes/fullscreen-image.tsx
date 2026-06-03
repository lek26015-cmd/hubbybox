'use client';

interface FullscreenImageProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function FullscreenImage({ imageUrl, onClose }: FullscreenImageProps) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div className="absolute top-8 right-8">
        <button className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white text-2xl">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
      <img
        src={imageUrl}
        className="max-w-full max-h-full rounded-3xl shadow-2xl border-2 border-white/20"
        alt="Full Preview"
      />
    </div>
  );
}
