'use client';

export default function MessagesPage() {
  const messages = [
    { name: 'Peter Parkur', lastMessage: 'The new logistics board design is ready for review.', time: '10:42 AM', active: true, avatar: 'PP' },
    { name: 'Jane Smith', lastMessage: 'User @tawan reported an issue with box #4829.', time: 'Yesterday', active: false, avatar: 'JS' },
    { name: 'Robert Fox', lastMessage: 'Can we schedule a call regarding the warehouse audit?', time: 'Yesterday', active: false, avatar: 'RF' },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 h-full max-h-[80vh]">
         {/* Sidebar for chat list */}
         <div className="md:col-span-4 bg-vora-card border border-white/5 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 border-b border-white/5">
               <h3 className="text-xl font-black text-white tracking-widest uppercase">Direct Messages</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
               {messages.map((m, i) => (
                  <div key={i} className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${m.active ? 'bg-vora-accent text-white shadow-xl shadow-vora-accent/20' : 'text-slate-500 hover:bg-white/5'}`}>
                     <div className="w-10 h-10 rounded-xl bg-vora-dark flex items-center justify-center font-black text-xs border border-white/5">{m.avatar}</div>
                     <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-[10px] font-black uppercase tracking-widest">{m.name}</span>
                           <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest">{m.time}</span>
                        </div>
                        <p className={`text-[10px] font-bold truncate ${m.active ? 'text-white' : 'text-slate-600'}`}>{m.lastMessage}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Chat window placeholder */}
         <div className="md:col-span-8 bg-vora-card border border-white/5 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 p-12 opacity-5 scale-150 rotate-12 transition-transform hover:scale-[1.6]">
               <i className="fa-notdog fa-solid fa-message text-[200px]"></i>
            </div>
            <div className="text-center space-y-6 relative z-10 p-12">
               <div className="w-20 h-20 bg-vora-dark rounded-full flex items-center justify-center text-vora-accent mx-auto mb-10 shadow-2xl animate-bounce">
                  <i className="fa-notdog fa-solid fa-envelope-open-text text-3xl"></i>
               </div>
               <h4 className="text-2xl font-black text-white tracking-tighter">Unified Communication Channel</h4>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em] max-w-sm leading-loose">Secure end-to-end encrypted messaging for the HubbyBox logistics team.</p>
               <button className="bg-vora-accent text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-vora-accent/20 active:scale-95 transition-all">Start New Conversation</button>
            </div>
         </div>
      </div>
    </main>
  );
}
