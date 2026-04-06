import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing image URL' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return NextResponse.json({ error: 'กรุณาตั้งค่า GEMINI_API_KEY ในไฟล์ .env.local' }, { status: 500 });
    }

    // 1. Initialize Gemini Model
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // 2. Fetch image as buffer
    const imageResp = await fetch(imageUrl);
    const imageBuffer = await imageResp.arrayBuffer();

    // 3. Generate content from image
    const prompt = "สิ่งของที่มองเห็นในรูปภาพนี้คืออะไรบ้าง? โปรดระบุเป็นชื่อสิ่งของสั้นๆ เท่านั้น แยกแต่ละรายการด้วยเครื่องหมายคอมม่า (,) เช่น เสื้อกันหนาว, กุญแจรถ, หนังสือ";
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: Buffer.from(imageBuffer).toString('base64'),
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error('Vision API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
