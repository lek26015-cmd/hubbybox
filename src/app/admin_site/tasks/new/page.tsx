'use client';

export default function NewTaskPage() {
  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
      <div className="max-w-3xl mx-auto bg-vora-card border border-white/5 p-12 rounded-[2rem] shadow-2xl relative overflow-hidden group">
         <header className="mb-12 border-b border-white/5 pb-8 relative z-10">
            <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-2">Create New Task</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Add a new task to the system for staff assignment.</p>
         </header>

         <form className="space-y-10 relative z-10">
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Task Category</label>
               <input type="text" placeholder="e.g. Logistics, Maintenance" className="w-full bg-vora-dark border border-white/5 rounded-xl py-5 px-8 text-sm text-white focus:outline-none focus:border-vora-accent transition-all shadow-inner" />
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Task Title</label>
               <input type="text" placeholder="What needs to be done?" className="w-full bg-vora-dark border border-white/5 rounded-xl py-5 px-8 text-sm text-white focus:outline-none focus:border-vora-accent transition-all shadow-inner" />
            </div>
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Description</label>
               <textarea rows={4} placeholder="Provide details about the task..." className="w-full bg-vora-dark border border-white/5 rounded-xl py-5 px-8 text-sm text-white focus:outline-none focus:border-vora-accent transition-all shadow-inner resize-none"></textarea>
            </div>
            <div className="pt-6">
               <button type="submit" className="w-full bg-vora-accent text-white py-6 rounded-xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-vora-accent/20 active:scale-95 transition-all">Publish Task</button>
            </div>
         </form>
      </div>
    </main>
  );
}
