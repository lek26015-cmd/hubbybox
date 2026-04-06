'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  } as const;

  const [activeTab, setActiveTab] = useState(0);

  const steps = [
    {
      title: 'เก็บบันทึก',
      subtitle: 'Pack & Record',
      icon: 'fa-box-open',
      desc: 'จัดของเข้ากล่องตามปกติ แล้วใช้ AI Vision ถ่ายรูปบันทึกข้อมูลเข้าระบบโดยไม่ต้องพิมพ์สักคำเดียว',
      color: 'bg-primary',
      image: 'https://images.unsplash.com/photo-1544413345-0639b56f8f1c?auto=format&fit=crop&q=80'
    },
    {
      title: 'สแกนอัจฉริยะ',
      subtitle: 'Smart Scan',
      icon: 'fa-qrcode',
      desc: 'แปะ QR Code หน้ากล่องเพื่อเชื่อมต่อข้อมูลเข้ากับแอป ให้คุณดูของข้างในได้แค่เพียงสแกนพริบตาเดียว',
      color: 'bg-indigo-500',
      image: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&q=80'
    },
    {
      title: 'ค้นหาด้วย AI',
      subtitle: 'AI Search',
      icon: 'fa-sparkles',
      desc: 'พิมพ์หรือพูดถาม AI "กุญแจรถอยู่ไหน?" ระบบจะบอกตำแหน่งกล่องและรูปถ่ายยืนยันให้ทันที',
      color: 'bg-rose-500',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/20 overflow-x-hidden">
      
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-[60] bg-slate-900/40 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 overflow-hidden shrink-0">
             <Image src="/logo-hubbyboox.png" alt="HubbyBox" width={40} height={40} className="object-contain" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase">HubbyBox</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
           <a href="#features" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">ฟีเจอร์</a>
           <a href="#how-it-works" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">วิธีใช้</a>
           <a href="#cta" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">เริ่มต้น</a>
        </div>
        <a href="http://app.lvh.me:3000" className="bg-primary text-white font-black px-8 py-3 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all text-sm">
           เข้าสู่ระบบ
        </a>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 md:pt-48 pb-0 px-8 overflow-hidden text-center bg-slate-900 border-b-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/20 via-transparent to-transparent blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto relative z-20">
           <motion.div 
             variants={containerVariants}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             className="flex flex-col items-center"
           >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 px-4 md:px-5 py-2 md:py-2.5 rounded-full mb-6 md:mb-10 backdrop-blur-md">
                 <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                 <span className="text-[9px] md:text-[10px] font-black text-primary tracking-[0.2em] uppercase">The Future of Organizing</span>
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl md:text-[7rem] font-black leading-[1.1] md:leading-[0.95] mb-6 md:mb-10 tracking-tighter text-white">
                จัดของเป็น <span className="text-primary italic">เรื่องเล่น</span> <br className="hidden sm:block" /> 
                หาเจอก็ <span className="bg-gradient-to-r from-blue-400 to-primary bg-clip-text text-transparent italic underline decoration-blue-500/30 underline-offset-8">เรื่องง่าย</span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-base md:text-2xl text-slate-400 font-medium mb-10 md:mb-14 max-w-2xl leading-relaxed px-4 md:px-0">
                เปลี่ยนความวุ่นวายในบ้าน ให้เป็นความสะดวกสบายที่ควบคุมได้ทางหน้าจอ ด้วยระบบ AI ช่วยจำตำแหน่งของอัจฉริยะ
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-6 mb-24">
                 <a href="http://app.lvh.me:3000" className="bg-primary text-white font-black text-xl px-12 py-6 rounded-[2.5rem] shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-2 transition-all active:scale-95 flex items-center gap-4">
                    จัดบ้านตอนนี้เลย <i className="fa-notdog fa-solid fa-arrow-right-long text-2xl" aria-hidden="true"></i>
                 </a>
                 <div className="flex -space-x-3 items-center">
                    {[1, 12, 23, 34].map((i) => (
                      <div key={i} className="w-11 h-11 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden shadow-sm">
                        <img src={`https://i.pravatar.cc/100?img=${i+5}`} alt="user" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="pl-6 flex flex-col items-start gap-0">
                       <div className="text-sm font-black text-white">1,200+ Active Users</div>
                       <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">Join our community</div>
                    </div>
                 </div>
              </motion.div>
           </motion.div>

           {/* Overlapping Mockup */}
           <motion.div 
             initial={{ opacity: 0, y: 100 }}
             whileInView={{ opacity: 1, y: 40 }}
             transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
             viewport={{ once: true }}
             className="relative z-30 max-w-4xl mx-auto"
           >
              <div className="absolute inset-x-0 -top-20 h-64 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none -z-10"></div>
              <div className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden border-[10px] md:border-[16px] border-white/5 backdrop-blur-sm shadow-[0_60px_120px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10 group">
                 <Image 
                   src="/hero-mockup.png" 
                   alt="HubbyBox Dashboard" 
                   width={1200} 
                   height={800} 
                   className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
                   priority
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none"></div>
              </div>
              
              {/* Floating Element 1 */}
              <motion.div 
                animate={{ y: [0, -20, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -left-6 md:-top-12 md:-left-20 bg-white p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-3 md:gap-4 z-40 backdrop-blur-md shadow-primary/10"
              >
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-primary text-white rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                    <i className="fa-notdog fa-solid fa-sparkles text-sm md:text-base" aria-hidden="true"></i>
                 </div>
                 <div className="text-left">
                    <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">AI ค้นหา</p>
                    <p className="font-black text-slate-800 text-[10px] md:text-sm">หาเจอใน 1 วินาที!</p>
                 </div>
              </motion.div>
              
              {/* Floating Element 2 */}
              <motion.div 
                animate={{ y: [0, 20, 0], rotate: [2, -2, 2] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-8 -right-6 md:-bottom-10 md:-right-20 bg-slate-800 p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-2xl border border-white/10 flex items-center gap-3 md:gap-4 z-40 backdrop-blur-md"
              >
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500 text-white rounded-lg md:rounded-xl flex items-center justify-center shrink-0">
                    <i className="fa-notdog fa-solid fa-qrcode text-sm md:text-base" aria-hidden="true"></i>
                 </div>
                 <div className="text-left">
                    <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Smart Scan</p>
                    <p className="font-black text-white text-[10px] md:text-sm">บันทึกข้อมูลแล้ว</p>
                 </div>
              </motion.div>
           </motion.div>
        </div>
      </section>

      {/* Wave Transition Header */}
      <div className="h-40 bg-slate-900 relative">
         <svg className="absolute bottom-0 w-full h-full text-slate-50 fill-current" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,224L48,202.7C96,181,192,139,288,144C384,149,480,203,576,213.3C672,224,768,192,864,181.3C960,171,1056,181,1152,197.3C1248,213,1344,235,1392,245.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
         </svg>
      </div>

      {/* Stats Bar */}
      <section className="bg-slate-50 py-24 px-8 relative z-10">
         <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-12">
            <div className="flex-1 min-w-[200px] text-center">
               <p className="text-4xl md:text-6xl font-black text-slate-800 mb-2">50,000+</p>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">รายการของที่บันทึก</p>
            </div>
            <div className="flex-1 min-w-[200px] text-center">
               <p className="text-4xl md:text-6xl font-black text-primary mb-2">10,500+</p>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">กล่องที่พร้อมให้บริการ</p>
            </div>
            <div className="flex-1 min-w-[200px] text-center">
               <p className="text-4xl md:text-6xl font-black text-slate-800 mb-2">99%</p>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">อัตราการหาของเจอทันที</p>
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 md:py-40 px-8 bg-slate-50" id="features">
        <div className="max-w-7xl mx-auto text-center mb-16 md:mb-24">
           <div className="inline-block py-2 px-6 bg-primary/5 border border-primary/10 rounded-full mb-6 font-black text-[10px] text-primary uppercase tracking-[0.3em]">Our Superpowers</div>
           <h2 className="text-4xl md:text-7xl font-black mb-8 tracking-tighter text-slate-900 leading-[1.1]">สามหัวใจหลักของ HubbyBox</h2>
           <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">เทคโนโลยีที่เราตั้งใจพัฒนาเพื่อเปลี่ยนชีวิตการจัดระเบียบของคุณให้กลายเป็นเรื่องที่ง่ายและสนุกที่สุด</p>
        </div>
        
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 text-center">
           {[ 
             { icon: 'fa-camera-iris', color: 'text-primary', bg: 'bg-primary/5', title: 'AI Vision Scanner', desc: 'ถ่ายรูปของที่จะเก็บเข้ากล่อง AI จะช่วยแยกแยะและจดบันทึกให้โดยที่คุณไม่ต้องพิมพ์สักคำเดียว' },
             { icon: 'fa-qrcode', color: 'text-indigo-500', bg: 'bg-indigo-50', title: 'Smart QR Integration', desc: 'แปะ QR หน้ากล่องเพื่อดูข้อมูลข้างในผ่านแอป ตัวหน้าตากล่องบนเว็บจะเปลี่ยนตามรูปสแกนล่าสุด' },
             { icon: 'fa-sparkles', color: 'text-rose-500', bg: 'bg-rose-50', title: 'AI Search Assistant', desc: 'แค่พิมพ์ถาม Hubby AI จะบอกตำแหน่งกล่องและรูปถ่ายยืนยันให้ทันทีในไม่กี่วินาที' }
           ].map((item, index) => (
             <motion.div 
               key={index}
               whileHover={{ y: -15 }}
               className="bg-white p-12 md:p-16 rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-primary/10 transition-all group flex flex-col items-center"
             >
                <div className={`w-28 h-28 ${item.bg} rounded-full flex items-center justify-center ${item.color} mb-12 text-4xl group-hover:scale-110 transition-transform relative`}>
                   <div className="absolute inset-0 rounded-full border-2 border-dashed border-current opacity-30 animate-[spin_10s_linear_infinite]"></div>
                   <i className={`fa-notdog fa-solid ${item.icon}`} aria-hidden="true"></i>
                </div>
                <h3 className="text-3xl font-black mb-6 text-slate-800 tracking-tighter">{item.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-sm">{item.desc}</p>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Wave Transition Middle */}
      <div className="h-40 bg-slate-50 relative">
         <svg className="absolute top-0 w-full h-full text-white fill-current" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,96L48,112C96,128,192,160,288,144C384,128,480,64,576,64C672,64,768,128,864,154.7C960,181,1056,171,1152,144C1248,117,1344,75,1392,53.3L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
         </svg>
      </div>

      {/* Modern Tabbed Service Section */}
      <section className="relative z-10 py-24 md:py-40 px-8 bg-white" id="how-it-works">
         <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-12 md:gap-16">
            <div className="max-w-3xl">
               <h2 className="text-4xl md:text-7xl font-black mb-8 md:mb-10 tracking-tight leading-[1.1]">ขั้นตอนง่ายๆ แค่ <span className="text-primary italic">เก็บบันทึก-ส่งหา</span></h2>
               <p className="text-base md:text-lg text-slate-500 font-medium">สัมผัสประสบการณ์การจัดระเบียบรูปแบบใหม่ที่ง่ายจนคุณต้องตกหลุมรัก</p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 p-2 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-3xl overflow-hidden shadow-inner w-full sm:w-auto">
               {steps.map((step, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`px-6 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl text-sm font-black transition-all flex items-center justify-center sm:justify-start gap-3 ${activeTab === i ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 hover:text-slate-600 hover:bg-white'}`}
                  >
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeTab === i ? 'bg-white/20' : 'bg-slate-100'}`}>
                        <i className={`fa-notdog fa-solid ${step.icon} text-xs`} aria-hidden="true"></i>
                     </div>
                     {step.title}
                  </button>
               ))}
            </div>

            {/* Tab Content */}
            <div className="w-full max-w-6xl mt-10 min-h-[600px]">
               <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center bg-slate-50 rounded-2xl md:rounded-3xl p-8 md:p-24 border border-slate-100 shadow-2xl shadow-slate-200/40"
                  >
                     <div className="text-left space-y-6 md:space-y-8">
                        <div className={`inline-block py-2 px-6 ${steps[activeTab].color} rounded-full font-black text-[10px] text-white uppercase tracking-[0.3em] shadow-lg shadow-current/10`}>Step 0{activeTab + 1}</div>
                        <h3 className="text-3xl md:text-6xl font-black text-slate-900 leading-tight tracking-tighter">
                           {steps[activeTab].title} <br />
                           <span className="text-slate-300 font-medium italic opacity-60 tracking-normal text-2xl md:text-4xl">{steps[activeTab].subtitle}</span>
                        </h3>
                        <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed max-w-md">
                           {steps[activeTab].desc}
                        </p>
                        <ul className="space-y-4">
                           {['รวดเร็วและแม่นยำด้วย AI', 'มีระบบ QR อัจฉริยะรองรับ', 'ค้นหาได้ทันทีจากทุกที่'].map(text => (
                              <li key={text} className="flex items-center gap-4 text-sm font-bold text-slate-700">
                                 <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                    <i className="fa-notdog fa-solid fa-check text-[10px]" aria-hidden="true"></i>
                                 </div>
                                 {text}
                              </li>
                           ))}
                        </ul>
                     </div>
                     <div className="relative">
                        <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full scale-110 -z-10"></div>
                        <div className="rounded-2xl md:rounded-3xl overflow-hidden border-[8px] md:border-[12px] border-white shadow-2xl relative group h-[300px] md:h-[450px]">
                           <img src={steps[activeTab].image} alt={steps[activeTab].title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                           <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors"></div>
                        </div>
                     </div>
                  </motion.div>
               </AnimatePresence>
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="relative z-10 py-32 md:py-52 px-8 bg-slate-900 text-white overflow-hidden text-center">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-[120px] pointer-events-none"></div>
         <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[100%] bg-blue-600/10 rounded-full blur-[150px]"></div>
         
         <div className="max-w-5xl mx-auto relative z-10 space-y-10 md:y-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
               <div className="inline-block py-2 px-6 bg-white/5 border border-white/10 rounded-full mb-8 font-black text-[10px] text-primary uppercase tracking-[0.3em]">Join HubbyBox Today</div>
               <h2 className="text-5xl md:text-[8rem] font-black mb-10 md:mb-12 tracking-tighter leading-[1] md:leading-[0.9]">เริ่มจัดระเบียบ <br />ให้ง่าย <span className="text-primary italic">ตั้งแต่วันนี้</span></h2>
               <p className="text-lg md:text-2xl text-slate-400 font-medium mb-12 md:mb-16 max-w-2xl leading-relaxed px-4">
                  พื้นที่จัดเก็บเริ่มต้น 3 กล่องแรก <span className="text-white font-black underline decoration-primary underline-offset-4 decoration-4">ฟรีถาวร!</span> <br className="hidden md:block" />
                  พร้อมระบบ AI ช่วยหาของครบครัน จ่ายเพิ่มเฉพาะตอนของเยอะจริงๆ เท่านั้น
               </p>
               <a href="http://app.lvh.me:3000" className="bg-primary text-white font-black text-xl md:text-2xl px-12 md:px-16 py-6 md:py-8 rounded-xl md:rounded-2xl shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-2 transition-all active:scale-95 flex items-center gap-4 group">
                  เริ่มใช้งานได้เลย <i className="fa-notdog fa-solid fa-arrow-right-long text-2xl md:text-3xl group-hover:translate-x-2 transition-transform" aria-hidden="true"></i>
               </a>
            </motion.div>
         </div>

         {/* Footer Content */}
         <div className="max-w-7xl mx-auto mt-52 pt-24 border-t border-white/5 grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10 text-left">
            <div className="md:col-span-2 space-y-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 overflow-hidden shrink-0">
                    <Image src="/logo-hubbyboox.png" alt="HubbyBox" width={48} height={48} className="object-contain" />
                  </div>
                  <span className="text-3xl font-black text-white tracking-tighter">HubbyBox</span>
               </div>
               <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-md">
                  เปลี่ยนโลกของการจัดเก็บให้กลายเป็นมิตร ด้วยพลังแห่ง AI และระบบจัดการอัจฉริยะ ออกแบบมาเพื่อทุกไลฟ์สไตล์
               </p>
               <div className="flex gap-4">
                  {['facebook', 'twitter', 'instagram', 'linkedin'].map(social => (
                    <a key={social} href="#" className="w-12 h-12 bg-white/5 hover:bg-primary transition-all rounded-xl flex items-center justify-center text-white/50 hover:text-white border border-white/10 hover:border-primary">
                       <i className={`fa-notdog fa-brands fa-${social} text-lg`} aria-hidden="true"></i>
                    </a>
                  ))}
               </div>
            </div>
            
            <div className="space-y-8">
               <h4 className="text-white font-black text-xl">Quick Links</h4>
               <ul className="space-y-4">
                  {['ฟีเจอร์', 'ราคา', 'วิธีใช้งาน', 'รีวิวผู้ใช้'].map(link => (
                    <li key={link}><a href="#" className="text-slate-500 font-bold hover:text-primary transition-colors text-sm">{link}</a></li>
                  ))}
               </ul>
            </div>
            
            <div className="space-y-8">
               <h4 className="text-white font-black text-xl">Legal & Support</h4>
               <ul className="space-y-4">
                  {['ศูนย์ช่วยเหลือ', 'นโยบายความเป็นส่วนตัว', 'ติดต่อทีมงาน', 'ร่วมงานกับเรา'].map(link => (
                    <li key={link}><a href="#" className="text-slate-500 font-bold hover:text-primary transition-colors text-sm">{link}</a></li>
                  ))}
               </ul>
            </div>
         </div>
         
         <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 text-left">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">© 2026 HUBBYBOX LABS. MADE WITH ❤️ IN THAILAND.</p>
            <div className="flex gap-10">
               <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
               <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] cursor-pointer hover:text-white transition-colors">Terms of Service</span>
            </div>
         </div>
      </section>

    </div>
  );
}
