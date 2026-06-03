export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white animate-pulse">
      <div className="w-full max-w-md mx-auto px-6 pt-8 pb-32">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-slate-200 rounded-xl" />
          <div className="h-6 bg-slate-200 rounded-lg w-24" />
        </div>

        {/* Cards skeleton */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-2xl mb-4" />
        ))}
      </div>
    </div>
  );
}
