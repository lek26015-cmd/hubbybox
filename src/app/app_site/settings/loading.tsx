export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white animate-pulse">
      <div className="w-full max-w-md mx-auto px-6 pt-8 pb-32">
        {/* Avatar skeleton */}
        <div className="flex flex-col items-center mb-10 pt-8">
          <div className="w-20 h-20 bg-slate-200 rounded-full mb-4" />
          <div className="h-5 bg-slate-200 rounded-lg w-28 mb-2" />
          <div className="h-3 bg-slate-100 rounded-lg w-40" />
        </div>

        {/* Menu items skeleton */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-2xl mb-3" />
        ))}
      </div>
    </div>
  );
}
