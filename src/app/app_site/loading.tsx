export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#cae9fd] via-[#e6f4fc] to-white animate-pulse">
      <div className="w-full max-w-md mx-auto px-6 pt-14 pb-32">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-white/60 rounded-2xl" />
          <div className="flex-1">
            <div className="h-5 bg-white/60 rounded-lg w-32 mb-2" />
            <div className="h-3 bg-white/40 rounded-lg w-48" />
          </div>
          <div className="w-10 h-10 bg-white/40 rounded-full" />
        </div>

        {/* Search skeleton */}
        <div className="h-14 bg-white/60 rounded-2xl mb-6" />

        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/50 rounded-xl" />
          ))}
        </div>

        {/* Create box skeleton */}
        <div className="h-32 bg-white/40 rounded-3xl mb-8" />

        {/* Box cards skeleton */}
        {[1, 2].map((i) => (
          <div key={i} className="h-28 bg-white/50 rounded-2xl mb-4" />
        ))}
      </div>
    </div>
  );
}
