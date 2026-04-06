'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

/** App subdomain base URL; set NEXT_PUBLIC_APP_URL in production (e.g. https://app.example.com) */
const APP_ORIGIN = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://app.lvh.me:3000').replace(
  /\/$/,
  ''
);

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 1, y: 0 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  } as const;

  const [activeTab, setActiveTab] = useState(0);
  
  // Debug tabs
  useEffect(() => {
    console.log('Active Tab Changed:', activeTab);
  }, [activeTab]);

  const steps = [
    {
      title: 'เก็บบันทึก',
      subtitle: 'Pack & Record',
      icon: 'fa-box-open',
      desc: 'จัดของเข้ากล่องตามปกติ แล้วใช้ AI Vision ถ่ายรูปบันทึกข้อมูลเข้าระบบโดยไม่ต้องพิมพ์สักคำเดียว',
      color: 'bg-primary',
      image: '/step-scan-ai.png'
    },
    {
      title: 'สแกนอัจฉริยะ',
      subtitle: 'Smart Scan',
      icon: 'fa-qrcode',
      desc: 'แปะ QR Code หน้ากล่องเพื่อเชื่อมต่อข้อมูลเข้ากับแอป ให้คุณดูของข้างในได้แค่เพียงสแกนพริบตาเดียว',
      color: 'bg-indigo-600',
      image: '/step-qr-label.png'
    },
    {
      title: 'ค้นหาด้วย AI',
      subtitle: 'AI Search',
      icon: 'fa-wand-magic-sparkles',
      desc: 'พิมพ์หรือพูดถาม AI "กุญแจรถอยู่ไหน?" ระบบจะบอกตำแหน่งกล่องและรูปถ่ายยืนยันให้ทันที',
      color: 'bg-indigo-900',
      image: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=1200'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/20 overflow-x-hidden md:overflow-x-visible">
      
      {/* Navbar */}
      <motion.nav 
        initial={false}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-[100] glass-nav px-8 py-5 flex items-center justify-between shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative h-10 w-10 shrink-0 flex items-center justify-center bg-primary/10 rounded-xl border border-primary/20 backdrop-blur-md">
             <img src="/logo-hubbybox.png" alt="HubbyBox" className="w-7 h-7 object-contain" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 uppercase truncate font-sans">HubbyBox</span>
        </div>
        <div className="hidden lg:flex items-center gap-10">
           {['ฟีเจอร์', 'วิธีใช้', 'ราคา', 'FAQ'].map((item, idx) => (
             <a 
               key={idx}
               href={`#${['features', 'how-it-works', 'pricing', 'faq'][idx]}`} 
               className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-[0.2em] transition-all relative group"
             >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
             </a>
           ))}
        </div>
        <div className="flex items-center gap-6">
           <a href={APP_ORIGIN} className="hidden sm:block text-[10px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-[0.2em] transition-colors">
              Login
           </a>
           <a href={APP_ORIGIN} className="bg-slate-900 text-white font-black px-7 py-3 rounded-xl shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0 transition-all text-[10px] uppercase tracking-[0.2em]">
              Get Started
           </a>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 md:pt-56 pb-24 px-8 overflow-hidden mesh-gradient">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 pointer-events-none"></div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] animate-slow-fade pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-20">
           <motion.div 
             initial={false}
             animate="visible"
             className="text-center"
           >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2.5 bg-white/50 backdrop-blur-md border border-white/60 px-5 py-2.5 rounded-full mb-10 shadow-sm">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                 </span>
                 <span className="text-[10px] font-black text-slate-500 tracking-[0.25em] uppercase">The Future of Home Organization</span>
              </motion.div>
              
              <motion.h1
                variants={itemVariants}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black leading-[1.05] mb-12 tracking-tight text-slate-900 max-w-5xl mx-auto [text-wrap:balance]"
              >
                เลิกปวดหัวกับ <span className="text-primary relative inline-block">ของเยอะ<span className="absolute -bottom-2 left-0 w-full h-3 bg-primary/10 -rotate-1"></span></span><br className="hidden sm:block" />
                <span className="text-slate-800">แต่หาไม่เจอ</span> จัดการได้ด้วย <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600">Hubby AI</span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-xl sm:text-2xl text-slate-500 font-medium mb-14 max-w-3xl mx-auto leading-relaxed tracking-tight">
                เปลี่ยนความวุ่นวายให้เป็นระบบระเบียบที่ควบคุมได้ด้วยปลายนิ้ว <br className="hidden lg:block" />
                ด้วยเทคโนโลยี AI Vision และระบบ Smart Organizer ที่ดีที่สุดในไทย
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-32">
                 <a href={APP_ORIGIN} className="w-full sm:w-auto bg-slate-900 text-white font-black text-lg px-12 py-5.5 rounded-2xl shadow-2xl shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-1 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-4 group">
                    เริ่มจัดการของวันนี้ <i className="fa-solid fa-arrow-right-long group-hover:translate-x-2 transition-transform"></i>
                 </a>
                 <div className="flex items-center gap-4 px-7 py-4.5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm transition-transform hover:scale-[1.02]">
                    <div className="flex -space-x-3">
                       {[1, 12, 23, 34].map((i) => (
                         <div key={i} className="w-10 h-10 rounded-full border-[3px] border-white/80 bg-slate-200 overflow-hidden shadow-md">
                           <img src={`https://i.pravatar.cc/100?img=${i+5}`} alt="user" className="w-full h-full object-cover" />
                         </div>
                       ))}
                    </div>
                    <div className="text-left">
                       <p className="text-xs font-black text-slate-900 leading-none mb-1">1,200+ Smart Users</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Growing daily community</p>
                    </div>
                 </div>
              </motion.div>

              {/* Product Showcase */}
              <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative max-w-6xl mx-auto pt-10 px-4 md:px-0"
              >
                  <div className="relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border-[12px] md:border-[16px] border-white shadow-[0_80px_160px_-40px_rgba(0,0,0,0.2)] ring-1 ring-slate-200 group bg-slate-50 min-h-[300px]">
                     <Image 
                       src="/hero-premium.png" 
                       alt="HubbyBox Dashboard" 
                       width={1200} 
                       height={800} 
                       className="w-full h-auto transition-transform duration-1000 group-hover:scale-[1.01] block"
                       priority
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent pointer-events-none"></div>
                  </div>
                  
                  {/* Floating Elements (Optimized) */}
                  <motion.div 
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-10 -left-6 bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/50 flex items-center gap-5 z-40 hidden xl:flex"
                  >
                     <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <i className="fa-solid fa-wand-magic-sparkles text-2xl"></i>
                     </div>
                     <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">AI Smart Search</p>
                        <p className="font-black text-slate-900 text-base">หาเจอทันทีไม่ต้องไล่เปิดกล่อง!</p>
                     </div>
                  </motion.div>
                  
                  <motion.div 
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-10 -right-6 bg-slate-900/95 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/10 flex items-center gap-5 z-40 hidden xl:flex"
                  >
                     <div className="w-14 h-14 bg-primary/20 text-primary rounded-2xl flex items-center justify-center shadow-inner">
                        <i className="fa-solid fa-qrcode text-2xl"></i>
                     </div>
                     <div className="text-left">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Smart QR Label</p>
                        <p className="font-black text-white text-base">บันทึกตำแหน่งของแล้ว</p>
                     </div>
                  </motion.div>
              </motion.div>
           </motion.div>
        </div>
      </section>

      {/* Problem Solver Cards */}
      <section className="py-24 px-8 bg-slate-50 border-y border-slate-100">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20 space-y-4">
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">The Problem</p>
               <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">ทำไมคนส่วนใหญ่ถึงจัดระเบียบไม่สำเร็จ?</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
               {[
                  { title: "เสียเวลากับการรื้อหา", desc: "ต้องใช้เวลาหลายสิบนาทีเพื่อหาของชิ้นเดียวที่จำไม่ได้ว่าเก็บไว้ไหน ทำให้เสียสมาธิและหงุดหงิด", icon: "fa-clock" },
                  { title: "ซื้อของซ้ำโดยไม่จำเป็น", desc: "จำไม่ได้ว่ามีของชิ้นนี้อยู่แล้ว ทำให้ต้องเสียเงินซื้อใหม่โดยเปล่าประโยชน์ และเพิ่มภาระของในบ้าน", icon: "fa-receipt" },
                  { title: "บ้านรกเพราะไม่มีระบบ", desc: "ยิ่งเก็บ ยิ่งเยอะ ยิ่งคุมไม่อยู่ เพราะไม่มีเครื่องมือที่ช่วยให้การบันทึกของเป็นเรื่องที่ทำได้ทุกวัน", icon: "fa-fire-alt" }
               ].map((item, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -10 }}
                    className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group"
                  >
                     <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-8 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all">
                        <i className={`fa-solid ${item.icon} text-xl`}></i>
                     </div>
                     <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{item.title}</h3>
                     <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
                  </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white py-20 px-8 border-b border-slate-100">
         <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-12">
            <div className="flex-1 min-w-[200px] text-center">
               <p className="text-4xl md:text-6xl font-black text-slate-900 mb-2">50,000+</p>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">รายการของที่บันทึก</p>
            </div>
            <div className="flex-1 min-w-[200px] text-center">
               <p className="text-4xl md:text-6xl font-black text-primary mb-2">1,200+</p>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ผู้ใช้งานที่ไว้วางใจ</p>
            </div>
            <div className="flex-1 min-w-[200px] text-center">
               <p className="text-4xl md:text-6xl font-black text-slate-900 mb-2">99%</p>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">หาของเจอทันที</p>
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-8 bg-slate-50/50 relative overflow-hidden" id="features">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        
        <div className="max-w-6xl mx-auto text-center mb-24 relative z-10">
           <div className="inline-block py-2.5 px-6 bg-primary/5 border border-primary/10 rounded-full mb-8 font-black text-[10px] text-primary uppercase tracking-[0.3em]">Advanced Capabilities</div>
           <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tight text-slate-900">เทคโนโลยีที่ทำให้ชีวิตง่ายขึ้น</h2>
           <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">เราใช้เทคโนโลยีที่ทันสมัยที่สุดเพื่อให้การจัดเก็บไม่ใช่เรื่องน่าเบื่ออีกต่อไป</p>
        </div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
           {[ 
             { icon: 'fa-camera-retro', color: 'text-primary', bg: 'bg-primary/5', title: 'AI Vision Scanner', desc: 'ไม่ต้องพิมพ์ลิสต์อีกต่อไป แค่ถ่ายรูป AI จะช่วยจำแนกสิ่งของและเพิ่มข้อมูลเข้าระบบให้ทันที' },
             { icon: 'fa-qrcode', color: 'text-indigo-600', bg: 'bg-indigo-50', title: 'Smart QR System', desc: 'เชื่อมต่อกล่องกายภาพเข้ากับโลกดิจิทัล สแกนครั้งเดียวเห็นของทั้งหมดที่อยู่ข้างในแบบ Real-time' },
             { icon: 'fa-wand-magic-sparkles', color: 'text-indigo-900', bg: 'bg-indigo-50/50', title: 'AI Search Hubby', desc: 'ระบบค้นหาด้วยเสียงและข้อความ แค่บอกว่าหาอะไร AI จะชี้เป้าทันทีว่าอยู่กล่องไหน มุมไหนของบ้าน' }
           ].map((item, index) => (
             <motion.div 
               key={index}
               whileHover={{ y: -12, scale: 1.02 }}
               className="glass-card p-14 rounded-[3.5rem] flex flex-col items-center text-center transition-all duration-500 group"
             >
                <div className={`w-24 h-24 ${item.bg} rounded-[2rem] flex items-center justify-center ${item.color} mb-12 text-3xl shadow-sm border border-white/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                   <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <h3 className="text-2xl font-black mb-6 text-slate-900 tracking-tight">{item.title}</h3>
                <p className="text-slate-500 font-semibold leading-relaxed text-base opacity-80">{item.desc}</p>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Modern Tabbed Service Section */}
      <section className="relative z-20 py-24 px-8 bg-white" id="how-it-works">
         <div className="max-w-6xl mx-auto flex flex-col items-center text-center gap-12 md:gap-16">
            <div className="max-w-3xl">
               <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">ขั้นตอนจัดการแบบ Smart</h2>
               <p className="text-lg text-slate-500 font-medium tracking-tight">ง่ายจนคุณต้องตกหลุมรักการจัดระเบียบ</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 p-2 bg-slate-50/50 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-40 pointer-events-auto">
               {steps.map((step, i) => (
                  <button 
                    key={i}
                    type="button"
                    onClick={() => setActiveTab(i)}
                    className={`group relative px-6 md:px-8 py-3.5 md:py-4 rounded-2xl text-xs md:text-sm font-black transition-all duration-300 flex items-center gap-3 cursor-pointer overflow-hidden ${
                      activeTab === i 
                        ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-100' 
                        : 'text-slate-400 hover:text-slate-700 bg-transparent hover:bg-slate-100/50'
                    }`}
                  >
                     {activeTab === i && (
                        <motion.span 
                          layoutId="activeTabGlow"
                          className="absolute inset-0 bg-gradient-to-r from-primary via-blue-400 to-primary opacity-20 blur-md"
                          initial={false}
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                     )}
                     <i className={`fa-solid ${step.icon} text-base transition-transform group-hover:scale-110`}></i>
                     <span className="relative z-10">{step.title}</span>
                  </button>
               ))}
            </div>

            <div className="w-full mt-4 min-h-[450px] relative z-10">
               <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeTab}
                    initial={false}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center bg-slate-50/50 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-16 border border-slate-100 shadow-2xl shadow-slate-200/50"
                  >
                     <div className="text-left space-y-6 md:space-y-8">
                        <div className={`inline-block py-2 px-6 ${steps[activeTab].color} rounded-full font-black text-[10px] text-white uppercase tracking-widest`}>Step 0{activeTab + 1}</div>
                        <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter">
                           {steps[activeTab].title}
                        </h3>
                        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
                           {steps[activeTab].desc}
                        </p>
                        <div className="pt-4 flex items-center gap-6">
                           <div className="flex -space-x-2">
                              {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-primary/10"></div>)}
                           </div>
                           <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest italic">Reliable Technology</p>
                        </div>
                     </div>
                     <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-video lg:aspect-square bg-slate-200">
                        <img src={steps[activeTab].image} alt={steps[activeTab].title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/5 pointer-events-none"></div>
                     </div>
                  </motion.div>
               </AnimatePresence>
            </div>
         </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-8 bg-white relative" id="pricing">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-24 space-y-6">
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Simple & Transparent</p>
               <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight">เลือกแผนที่ใช่สำหรับบ้านคุณ</h2>
               <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">เริ่มต้นใช้งานฟรีได้ทันที ไม่มีข้อผูกมัด</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10">
               {[
                  { name: "Free Trial", price: "0", feat: ["บันทึกได้ 3 กล่องแรก", "AI Vision พื้นฐาน", "เข้าถึงผ่านมือถือได้ 24 ชม."], cta: "Start Free", popular: false, icon: "fa-paper-plane" },
                  { name: "Family Pack", price: "199", feat: ["บันทึกได้ 50 กล่อง", "Hubby AI Search (Voice/Text)", "แชร์ได้ทั้งครอบครัว (5 คน)", "สิทธิพิเศษส่งของเข้าคลัง"], cta: "Go Family", popular: true, icon: "fa-house-user" },
                  { name: "Unlimited Pro", price: "499", feat: ["บันทึกได้ไม่จำกัดจำนวน", "Hubby AI Personal Assistant", "ระบบคลังพรีเมียมส่วนตัว", "ฟรีค่าบริการส่งคืน 5 ครั้ง/ปี"], cta: "Get Pro Access", popular: false, icon: "fa-gem" }
               ].map((plan, i) => (
                  <div 
                    key={i} 
                    className={`p-12 rounded-[3rem] border transition-all duration-500 hover:-translate-y-2 flex flex-col relative overflow-hidden group ${
                      plan.popular 
                        ? 'bg-slate-900 text-white border-slate-800 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] ring-4 ring-primary/20 scale-105 z-10' 
                        : 'bg-slate-50 border-slate-200/60 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50'
                    }`}
                  >
                     {plan.popular && (
                        <>
                           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-10 -mt-10"></div>
                           <span className="absolute top-6 right-8 bg-primary text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest animate-pulse">Recommended</span>
                        </>
                     )}
                     
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-10 text-xl shadow-sm ${plan.popular ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white text-slate-400 border border-slate-200'}`}>
                        <i className={`fa-solid ${plan.icon}`}></i>
                     </div>

                     <h3 className={`text-2xl font-black mb-3 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                     <div className="flex items-baseline gap-1 mb-10">
                        <span className={`text-5xl font-black ${plan.popular ? 'text-white' : 'text-slate-900'}`}>฿{plan.price}</span>
                        <span className={`${plan.popular ? 'text-slate-400' : 'text-slate-400'} font-bold text-base`}>/เดือน</span>
                     </div>
                     <ul className="space-y-5 mb-12 flex-1">
                        {plan.feat.map((f, j) => (
                           <li key={j} className={`flex items-center gap-4 text-[15px] font-bold ${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>
                              <i className={`fa-solid fa-check-circle text-xs ${plan.popular ? 'text-primary' : 'text-primary'}`}></i>
                              {f}
                           </li>
                        ))}
                     </ul>
                     <button 
                        type="button"
                        className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.1em] transition-all duration-300 ${
                          plan.popular 
                            ? 'bg-primary text-white hover:bg-blue-400 hover:shadow-[0_0_30px_rgba(52,137,255,0.4)]' 
                            : 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm'
                        }`}
                     >
                        {plan.cta}
                     </button>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-24 px-8">
         <div className="max-w-7xl mx-auto relative overflow-hidden rounded-[4rem] bg-slate-900 p-12 md:p-24 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-indigo-500/20 opacity-50"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#3489ff15_0%,transparent_50%)]"></div>
            
            <div className="relative z-10 max-w-4xl mx-auto space-y-12">
               <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight [text-wrap:balance]">
                  พร้อมคืนพื้นที่แห่งความสุข <br className="hidden sm:block" /> เลิกหงุดหงิดกับการหาของหรือยัง?
               </h2>
               <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                  ให้ HubbyBox ช่วยคุณจัดระเบียบวันนี้ เพื่อเช้าวันที่สดใสและบ้านที่น่าอยู่ขึ้นสำหรับทุกคน
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <a href={APP_ORIGIN} className="w-full sm:w-auto bg-primary text-white font-black text-xl px-14 py-6 rounded-2xl shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
                     เริ่มใช้งานฟรีเดี๋ยวนี้
                  </a>
                  <a href="#how-it-works" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-black text-xl px-12 py-6 rounded-2xl backdrop-blur-md transition-all">
                     ดูวิธีการทำงาน
                  </a>
               </div>
               <div className="pt-8 flex items-center justify-center gap-3">
                  <div className="flex -space-x-2">
                     {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800"></div>)}
                  </div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Join 1k+ happy families</p>
               </div>
            </div>
         </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-8 bg-slate-50/50" id="faq">
         <div className="max-w-4xl mx-auto">
            <div className="text-center mb-24 space-y-6">
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Help Center</p>
               <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">คำถามที่พบบ่อย</h2>
            </div>
            
            <div className="space-y-6">
               {[
                  { q: "HubbyBox คืออะไร?", a: "HubbyBox คือแอปพลิเคชันจัดการของและการจัดเก็บอัจฉริยะที่ใช้ AI Vision ช่วยบันทึกและจดจำตำแหน่งสิ่งของในบ้าน ให้คุณหาของเจอได้ทันทีผ่านสมาร์ทโฟนเพียงแค่พิมพ์ถาม" },
                  { q: "ต้องมีกล่องของ HubbyBox เองเท่านั้นหรือไม่?", a: "ไม่จำเป็นครับ คุณสามารถใช้กล่องที่มีอยู่แล้วในบ้าน แล้วใช้แอปสแกน QR Code เพื่อเชื่อมต่อข้อมูลได้ทันที โดยพิมพ์ QR Code ได้ฟรีจากในแอป" },
                  { q: "AI Vision ทำงานได้ดีแค่ไหน?", a: "AI ของเราถูกฝึกฝนมาเพื่อจดจำวัตถุในบ้านได้มากกว่า 1,000 ประเภท และฉลาดขึ้นเรื่อยๆ ยิ่งคุณใช้งาน ระบบจะยิ่งจำแม่นขึ้น" },
                  { q: "ข้อมูลของฉันปลอดภัยแค่ไหน?", a: "ความปลอดภัยคือหัวใจหลัก ข้อมูลส่วนตัวและรูปถ่ายทั้งหมดถูกเข้ารหัสระดับสูงและเก็บไว้ใน Private Cloud ของคุณเท่านั้น" }
               ].map((faq, i) => (
                  <details key={i} className="group glass-card rounded-[2rem] overflow-hidden transition-all duration-300 border border-slate-200/50">
                     <summary className="flex items-center justify-between p-10 cursor-pointer list-none select-none">
                        <span className="font-black text-slate-800 text-xl text-left tracking-tight">{faq.q}</span>
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-open:rotate-180 transition-transform duration-300 flex-shrink-0 border border-slate-200">
                           <i className="fa-solid fa-chevron-down text-xs"></i>
                        </div>
                     </summary>
                     <div className="px-10 pb-10 text-slate-500 font-semibold leading-relaxed text-lg lg:text-xl">
                        {faq.a}
                     </div>
                  </details>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-32 pb-16 px-8 border-t border-slate-100">
         <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16 md:gap-20 mb-24">
            <div className="md:col-span-1 space-y-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                     <img src="/logo-hubbybox.png" alt="HubbyBox" className="h-8 w-8 object-contain" />
                  </div>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">HubbyBox</span>
               </div>
               <p className="text-slate-400 text-base font-bold leading-relaxed">
                  เราสร้างเทคโนโลยีที่จะช่วยให้การจัดบ้านเป็นเรื่องสนุก และคืนเวลาพักผ่อนอันมีค่าให้คุณและครอบครัว
               </p>
               <div className="flex gap-5">
                  {['facebook', 'line', 'instagram', 'twitter'].map(s => (
                     <div key={s} className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 hover:border-slate-900 transition-all duration-300 cursor-pointer shadow-sm">
                        <i className={`fa-brands fa-${s} text-lg`}></i>
                     </div>
                  ))}
               </div>
            </div>
            
            {['Product', 'Company', 'Support'].map((title, i) => (
               <div key={i} className="space-y-8">
                  <h4 className="font-black text-[10px] text-slate-900 uppercase tracking-[0.3em] leading-none mb-10">{title}</h4>
                  <ul className="space-y-5 text-[15px] font-black text-slate-400">
                     {i === 0 && ['ฟีเจอร์', 'Smart QR', 'AI Search', 'Pricing'].map(item => <li key={item} className="hover:text-primary transition-colors cursor-pointer">{item}</li>)}
                     {i === 1 && ['About Us', 'Careers', 'Privacy Policy', 'Terms'].map(item => <li key={item} className="hover:text-primary transition-colors cursor-pointer">{item}</li>)}
                     {i === 2 && ['Help Center', 'API Docs', 'Community', 'Status'].map(item => <li key={item} className="hover:text-primary transition-colors cursor-pointer">{item}</li>)}
                  </ul>
               </div>
            ))}
         </div>
         
         <div className="max-w-7xl mx-auto pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 opacity-60 text-center md:text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">© 2026 HUBBYBOX LABS. MADE WITH ❤️ IN BKK.</p>
            <div className="flex gap-12">
               {['Security', 'Status', 'Cookies'].map(item => (
                 <span key={item} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] hover:text-slate-900 transition-colors cursor-pointer">{item}</span>
               ))}
            </div>
         </div>
      </footer>
    </div>
  );
}
