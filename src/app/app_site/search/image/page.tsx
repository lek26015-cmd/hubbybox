'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLiff } from '@/components/providers/liff-provider';
import { useRouter } from 'next/navigation';

export default function SearchByImage() {
  const router = useRouter();
  const { dbUser } = useLiff();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [identifiedItems, setIdentifiedItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !dbUser?.id) return;

    setError(null);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIsAnalyzing(true);
    setSearchResults([]);

    try {
      // 1. Upload to temporary storage for analysis
      const fileExt = file.name.split('.').pop();
      const fileName = `search-${Date.now()}.${fileExt}`;
      const filePath = `temp-search/${dbUser.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('box-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('box-images')
        .getPublicUrl(filePath);

      // 2. Call Vision API to identify items
      const visionResp = await fetch('/api/vision', {
        method: 'POST',
        body: JSON.stringify({ imageUrl: publicUrl }),
        headers: { 'Content-Type': 'application/json' }
      });

      const visionData = await visionResp.json();
      if (!visionResp.ok) throw new Error(visionData.error || 'AI Vision failed');

      const aiResult = visionData.result || '';
      const itemsFound = aiResult.split(',').map((s: string) => s.trim()).filter(Boolean);
      setIdentifiedItems(itemsFound);

      if (itemsFound.length > 0) {
        // 3. Search database for these items
        // We'll search for the first 3 items identified to avoid too many queries
        const searchTerms = itemsFound.slice(0, 3);
        
        let allMatches: any[] = [];
        for (const term of searchTerms) {
          const { data } = await supabase
            .from('items')
            .select('*, boxes!inner(name, id, user_id)')
            .eq('boxes.user_id', dbUser.id)
            .ilike('name', `%${term}%`);
          
          if (data) allMatches = [...allMatches, ...data];
        }

        // Remove duplicates if same item matched multiple terms
        const uniqueMatches = Array.from(new Map(allMatches.map(m => [m.id, m])).values());
        setSearchResults(uniqueMatches);
      }

      // Cleanup temp file (optional, but good practice)
      // await supabase.storage.from('box-images').remove([filePath]);

    } catch (err: any) {
      console.error('Image Search Error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการสแกนภาพ');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col p-6">
       <header className="flex items-center gap-4 mb-10 pt-4">
          <Link href="/" className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all">
             <i className="fa-solid fa-arrow-left"></i>
          </Link>
          <h1 className="text-2xl font-black">ค้นหาด้วยรูปภาพ</h1>
       </header>

       <main className="flex-1 flex flex-col items-center justify-center gap-8">
          {!previewUrl ? (
             <div className="w-full max-w-sm aspect-square bg-slate-800 rounded-[3rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="bg-primary/20 w-24 h-24 rounded-full flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                   <i className="fa-solid fa-camera text-4xl"></i>
                </div>
                <h2 className="text-xl font-bold mb-2">ถ่ายรูปหรือเลือกภาพ</h2>
                <p className="text-slate-400 text-sm mb-8 px-4 font-medium italic">ส่งภาพของที่คุณต้องการหา แล้วปล่อยให้ Hubby AI จัดการ!</p>
                
                <label className="bg-white text-slate-900 font-black px-8 py-4 rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10">
                   เลือกไฟล์ภาพ
                   <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
             </div>
          ) : (
             <div className="w-full max-w-sm flex flex-col items-center gap-6">
                <div className="relative w-full aspect-square rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl">
                   <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                   {isAnalyzing && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
                         <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                         <p className="text-lg font-black tracking-widest text-primary animate-pulse">กำลังวิเคราะห์...</p>
                         <p className="text-xs text-white/70 italic mt-2">Hubby AI กำลังค้นหาสิ่งของจากฐานข้อมูล</p>
                      </div>
                   )}
                </div>

                {error && (
                  <div className="bg-rose-500/20 border border-rose-500/30 text-rose-300 p-4 rounded-2xl text-center text-sm">
                    {error}
                  </div>
                )}
                
                {!isAnalyzing && !error && (
                   <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="bg-slate-800 rounded-3xl p-6 border border-white/10">
                        <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                          <i className="fa-solid fa-magnifying-glass text-primary"></i>
                          ผลการวิเคราะห์
                        </h3>
                        <p className="text-slate-400 text-xs uppercase tracking-widest font-black mb-2">AI ตรวจเจอ:</p>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {identifiedItems.length > 0 ? identifiedItems.map((item, i) => (
                            <span key={i} className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-white border border-white/5">
                              {item}
                            </span>
                          )) : <span className="text-slate-500 italic">ไม่พบสิ่งของในภาพ</span>}
                        </div>

                        <div className="space-y-3">
                          <p className="text-slate-400 text-xs uppercase tracking-widest font-black">ผลการค้นหาในกล่องของคุณ:</p>
                          {searchResults.length > 0 ? (
                            searchResults.map((match) => (
                              <button 
                                key={match.id}
                                onClick={() => router.push(`/box/${match.box_id}`)}
                                className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all text-left"
                              >
                                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 shrink-0">
                                  {match.image_url ? <img src={match.image_url} className="w-full h-full object-cover rounded-lg" /> : <i className="fa-solid fa-tag"></i>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm text-white truncate">{match.name}</p>
                                  <p className="text-[10px] text-slate-400 font-medium truncate">ในกล่อง: {match.boxes?.name}</p>
                                </div>
                                <i className="fa-solid fa-chevron-right text-slate-600"></i>
                              </button>
                            ))
                          ) : (
                            <div className="py-4 text-center">
                              <p className="text-sm text-slate-500 italic">ขออภัยครับ ยังไม่มีของสิ่งนี้ในกล่องของคุณ</p>
                            </div>
                          )}
                        </div>
                      </div>
                   </div>
                )}
                
                <button 
                  onClick={() => {
                    setPreviewUrl(null);
                    setSearchResults([]);
                    setIdentifiedItems([]);
                    setError(null);
                  }}
                  className="text-slate-500 font-bold hover:text-white transition-colors"
                >
                   {previewUrl && !isAnalyzing ? 'ลองค้นหาภาพอื่น' : 'ยกเลิก'}
                </button>
             </div>
          )}
       </main>
       
       <footer className="py-8 text-center">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">ขับเคลื่อนด้วย Hubby AI Vision</p>
       </footer>
    </div>
  );
}
wUrl(null)}
                  className="text-slate-500 font-bold hover:text-white transition-colors"
                >
                   ลองภาพอื่น
                </button>
             </div>
          )}
       </main>
       
       <footer className="py-8 text-center">
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">ขับเคลื่อนด้วย Hubby AI Vision</p>
       </footer>
    </div>
  );
}
